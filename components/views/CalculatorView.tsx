
import React, { useState, useEffect } from 'react';
import { useGeolocation } from '../../hooks/useGeolocation';

export const CalculatorView: React.FC = () => {
  const [petrol, setPetrol] = useState('');
  const [average, setAverage] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const { distance, startTracking, stopTracking, resetDistance } = useGeolocation();

  const handleStart = () => {
    resetDistance();
    setAverage(null);
    startTracking();
    setIsCalculating(true);
  };

  const handleStopAndCalculate = () => {
    stopTracking();
    const petrolAmount = parseFloat(petrol);
    if (distance > 0 && petrolAmount > 0) {
      setAverage(distance / petrolAmount);
    }
    setIsCalculating(false);
  };
  
  const handleReset = () => {
    stopTracking();
    resetDistance();
    setPetrol('');
    setAverage(null);
    setIsCalculating(false);
  };
  
  return (
    <div className="flex flex-col items-center gap-6 p-4 bg-slate-800/50 rounded-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-cyan-400">Calculate Your Mileage</h2>
      <p className="text-center text-slate-400">
        Fill your tank, start tracking, and enter the amount of fuel used when you stop to get your bike's real average.
      </p>

      {!isCalculating && !average && (
         <div className="w-full">
            <button onClick={handleStart} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-full transition-colors">
              Start a New Trip
            </button>
         </div>
      )}
      
      {isCalculating && (
        <div className="w-full flex flex-col items-center gap-4 p-4 bg-slate-900/50 rounded-lg">
          <p className="text-slate-300">Tracking trip...</p>
          <p className="text-4xl font-bold text-cyan-400">{distance.toFixed(2)} <span className="text-lg">km</span></p>
          <div className="w-full">
            <label htmlFor="petrol" className="block text-sm font-medium text-slate-300 mb-2">Fuel Used (Liters)</label>
            <input
              type="number"
              id="petrol"
              value={petrol}
              onChange={(e) => setPetrol(e.target.value)}
              className="w-full bg-slate-700 text-white p-3 rounded-full border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              placeholder="e.g., 5.5"
            />
          </div>
          <button 
            onClick={handleStopAndCalculate} 
            disabled={!petrol}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-full transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">
            Stop & Calculate Average
          </button>
        </div>
      )}

      {average !== null && (
        <div className="w-full flex flex-col items-center gap-4 p-6 bg-slate-900/50 rounded-lg">
          <p className="text-lg text-slate-300">Your Calculated Average</p>
          <p className="text-5xl font-bold text-green-400">{average.toFixed(2)}</p>
          <p className="text-slate-400">km/L</p>
          <button onClick={handleReset} className="mt-4 w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-full transition-colors">
            Calculate Another Trip
          </button>
        </div>
      )}
    </div>
  );
};
