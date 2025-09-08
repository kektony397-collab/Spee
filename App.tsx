
import React, { useState, useEffect, useCallback } from 'react';
import { TrackerView } from './components/views/TrackerView';
import { CalculatorView } from './components/views/CalculatorView';
import { GarageView } from './components/views/GarageView';
import { AiView } from './components/views/AiView';
import { BottomNavBar } from './components/BottomNavBar';
import { Footer } from './components/Footer';
import { useGeolocation } from './hooks/useGeolocation';
import { DEFAULT_BIKE, BIKE_DATA } from './constants';
import type { Bike, NavigationTab, TrackingData, Position } from './types';
import { getMileageTips } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('Tracker');
  const [currentBike, setCurrentBike] = useState<Bike>(DEFAULT_BIKE);
  const [petrol, setPetrol] = useState<number>(1); // Default 1L
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [trackingData, setTrackingData] = useState<TrackingData>({
    distance: 0,
    speedHistory: [],
  });
  const [geminiAdvice, setGeminiAdvice] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const { position, speed, distance, error, startTracking, stopTracking, resetDistance } = useGeolocation();

  useEffect(() => {
    // Load state from localStorage on mount
    const savedBike = localStorage.getItem('currentBike');
    const savedPetrol = localStorage.getItem('petrol');
    if (savedBike) {
      setCurrentBike(JSON.parse(savedBike));
    }
    if (savedPetrol) {
      setPetrol(parseFloat(savedPetrol));
    }
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
    // Save state to localStorage on change
    localStorage.setItem('currentBike', JSON.stringify(currentBike));
    localStorage.setItem('petrol', petrol.toString());
  }, [currentBike, petrol]);
  

  const handleStartTracking = () => {
    resetDistance();
    setTrackingData({ distance: 0, speedHistory: [] });
    setGeminiAdvice('');
    startTracking();
    setIsTracking(true);
  };

  const handleStopTracking = () => {
    stopTracking();
    setIsTracking(false);
  };

  const handleRefill = (amount: number) => {
    setPetrol(prev => prev + amount);
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
