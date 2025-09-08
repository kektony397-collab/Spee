import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TrackerView } from './components/views/TrackerView';
import { CalculatorView } from './components/views/CalculatorView';
import { GarageView } from './components/views/GarageView';
import { AiView } from './components/views/AiView';
import { HistoryView } from './components/views/HistoryView';
import { BottomNavBar } from './components/BottomNavBar';
import { Footer } from './components/Footer';
import { useGeolocation } from './hooks/useGeolocation';
import { DEFAULT_BIKE, BIKE_DATA } from './constants';
import type { Bike, NavigationTab, TrackingData, TripRecord } from './types';
import { getMileageTips, speak } from './services/geminiService';
import * as db from './services/dbService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('Tracker');
  const [currentBike, setCurrentBike] = useState<Bike>(DEFAULT_BIKE);
  const [petrol, setPetrol] = useState<number>(DEFAULT_BIKE.tankSize);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [trackingData, setTrackingData] = useState<TrackingData>({
    distance: 0,
    speedHistory: [],
  });
  const [geminiAdvice, setGeminiAdvice] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<TripRecord[]>([]);
  const [isVoiceAssistantOn, setIsVoiceAssistantOn] = useState<boolean>(false);

  const { position, speed, distance, error, startTracking, stopTracking, resetDistance } = useGeolocation();
  
  // Refs for voice assistant alerts to prevent spamming
  const lastDistanceAlertKm = useRef(0);
  const speedingTimer = useRef<number | null>(null);
  const lowFuelAlertGiven = useRef(false);


  useEffect(() => {
    const loadData = async () => {
      await db.initDB();
      const appState = await db.getAppState();
      if (appState) {
        setCurrentBike(appState.currentBike);
        setPetrol(appState.petrol);
      } else {
        // First time launch: start with a full tank for the default bike
        setCurrentBike(DEFAULT_BIKE);
        setPetrol(DEFAULT_BIKE.tankSize);
      }
      const tripHistory = await db.getAllTrips();
      setHistory(tripHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isTracking) {
      setTrackingData(prev => ({
        distance: distance,
        speedHistory: [...prev.speedHistory, speed],
      }));
    }
  }, [distance, speed, isTracking]);

  useEffect(() => {
    db.saveAppState({ currentBike, petrol });
  }, [currentBike, petrol]);
  
  // Effect for real-time voice assistant alerts
  useEffect(() => {
    if (!isTracking || !isVoiceAssistantOn) {
      if (speedingTimer.current) {
        clearTimeout(speedingTimer.current);
        speedingTimer.current = null;
      }
      return;
    }

    const remainingRange = Math.max(0, (petrol * currentBike.average) - trackingData.distance);
    const isReserve = petrol > 0 && (petrol / currentBike.tankSize) * 100 <= 15;

    // Distance Alert
    const DISTANCE_ALERT_INTERVAL = 5; // Trigger every 5 km
    const currentDistanceKm = Math.floor(trackingData.distance);

    if (currentDistanceKm > 0 && currentDistanceKm >= lastDistanceAlertKm.current + DISTANCE_ALERT_INTERVAL) {
        const message = `You have covered ${currentDistanceKm} kilometers. Remaining range is approximately ${Math.floor(remainingRange)} kilometers.`;
        speak(message);
        lastDistanceAlertKm.current = currentDistanceKm;
    }
    
    // Speeding Alert
    if (speed > currentBike.optimalSpeed.max) {
      if (!speedingTimer.current) {
        speedingTimer.current = window.setTimeout(() => {
          speak("For better mileage, please slow down to the optimal speed.");
          speedingTimer.current = null; // Allow alert to re-trigger after some time
        }, 10000); // 10 seconds of continuous speeding
      }
    } else {
      if (speedingTimer.current) {
        clearTimeout(speedingTimer.current);
        speedingTimer.current = null;
      }
    }

    // Low Fuel Alert
    if (isReserve && !lowFuelAlertGiven.current) {
      speak("Fuel is low. Please refuel soon.");
      lowFuelAlertGiven.current = true;
    } else if (!isReserve && lowFuelAlertGiven.current) {
      lowFuelAlertGiven.current = false; // Reset when not in reserve
    }

  }, [isTracking, isVoiceAssistantOn, trackingData.distance, speed, petrol, currentBike]);

  // Cleanup timers on component unmount
  useEffect(() => {
    return () => {
      if (speedingTimer.current) {
        clearTimeout(speedingTimer.current);
      }
    };
  }, []);

  const handleStartTracking = () => {
    resetDistance();
    setTrackingData({ distance: 0, speedHistory: [] });
    setGeminiAdvice('');
    lastDistanceAlertKm.current = 0; // Reset alert counter
    startTracking();
    setIsTracking(true);
  };

  const handleStopTracking = async () => {
    stopTracking();
    setIsTracking(false);

    // Clear any active speeding timer
    if (speedingTimer.current) {
        clearTimeout(speedingTimer.current);
        speedingTimer.current = null;
    }

    // Decrease petrol based on distance traveled
    const fuelConsumed = trackingData.distance / currentBike.average;
    setPetrol(prev => Math.max(0, prev - fuelConsumed));

    if (trackingData.distance > 0.1) { // Only save trips longer than 100m
      const speedHistory = trackingData.speedHistory.filter(s => s > 0);
      const avgSpeed = speedHistory.reduce((a, b) => a + b, 0) / speedHistory.length || 0;
      const maxSpeed = Math.max(...speedHistory, 0);

      const newTrip: TripRecord = {
        date: new Date().toISOString(),
        distance: trackingData.distance,
        speedHistory: trackingData.speedHistory,
        bikeMake: currentBike.make,
        bikeModel: currentBike.model,
        avgSpeed,
        maxSpeed
      };
      await db.addTrip(newTrip);
      const updatedHistory = await db.getAllTrips();
      setHistory(updatedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  };

  const handleRefill = (amount: number) => {
    setPetrol(prev => Math.min(currentBike.tankSize, prev + amount));
  };
  
  const handleSelectBike = (bike: Bike) => {
    setCurrentBike(bike);
    setActiveTab('Tracker'); // Switch to tracker view after selecting a bike
  };
  
  const handleGetAdvice = useCallback(async () => {
    if (trackingData.speedHistory.length < 5) {
      setGeminiAdvice("Not enough driving data. Please track a longer trip.");
      return;
    }
    setIsAiLoading(true);
    setGeminiAdvice('');
    try {
      const advice = await getMileageTips(trackingData);
      setGeminiAdvice(advice);
    } catch (e) {
      console.error(e);
      setGeminiAdvice('Sorry, I could not get advice at this time. Please check your API key and try again.');
    } finally {
      setIsAiLoading(false);
    }
  }, [trackingData]);
  
  const handleResetTracker = () => {
    if (isTracking) stopTracking();
    resetDistance();
    setTrackingData({ distance: 0, speedHistory: [] });
    setPetrol(currentBike.tankSize); // Refill to full tank on reset
  };
  
  const handleDeleteTrip = async (id: number) => {
    await db.deleteTrip(id);
    setHistory(prev => prev.filter(trip => trip.id !== id));
  };
  
  const handleClearHistory = async () => {
    await db.clearTrips();
    setHistory([]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Tracker':
        return (
          <TrackerView
            bike={currentBike}
            petrol={petrol}
            trackingData={trackingData}
            currentSpeed={speed}
            isTracking={isTracking}
            onStart={handleStartTracking}
            onStop={handleStopTracking}
            onRefill={handleRefill}
            onReset={handleResetTracker}
            isVoiceAssistantOn={isVoiceAssistantOn}
            onToggleVoiceAssistant={setIsVoiceAssistantOn}
          />
        );
      case 'Calculator':
        return <CalculatorView />;
      case 'Garage':
        return <GarageView bikes={BIKE_DATA} onSelectBike={handleSelectBike} />;
      case 'AI':
        return <AiView 
            onGetAdvice={handleGetAdvice}
            advice={geminiAdvice}
            isLoading={isAiLoading}
            isTracking={isTracking}
          />;
      case 'History':
        return <HistoryView trips={history} onDelete={handleDeleteTrip} onClear={handleClearHistory} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto p-4 pb-24">
        <h1 className="text-3xl font-bold text-center mb-2 text-cyan-400">Bike Advance</h1>
        <p className="text-center text-slate-400 mb-6">Your Smart Biking Companion</p>
        {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4">{error}</div>}
        {renderContent()}
      </main>
      <Footer />
      <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
