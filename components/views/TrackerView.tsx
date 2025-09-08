import React, { useState, useMemo } from 'react';
import type { Bike, TrackingData } from '../../types';

interface TrackerViewProps {
  bike: Bike;
  petrol: number;
  trackingData: TrackingData;
  currentSpeed: number;
  isTracking: boolean;
  onStart: () => void;
  onStop: () => void;
  onRefill: (amount: number) => void;
  onReset: () => void;
}

export const TrackerView: React.FC<TrackerViewProps> = ({
  bike,
  petrol,
  trackingData,
  currentSpeed,
  isTracking,
  onStart,
  onStop,
  onRefill,
  onReset,
}) => {
  const [refillAmount, setRefillAmount] = useState('1');

  const totalRange = useMemo(() => petrol * bike.average, [petrol, bike.average]);
  const remainingRange = useMemo(() => Math.max(0, totalRange - trackingData.distance), [totalRange, trackingData.distance]);
  const isReserve = useMemo(() => petrol > 0 && totalRange > 0 && (petrol / bike.tankSize) * 100 <= 15, [petrol, bike.tankSize, totalRange]);

  const handleRefillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(refillAmount);
    if (!isNaN(amount) && amount > 0) {
      onRefill(amount);
      setRefillAmount('1');
    }
  };

  const handleFullTank = () => {
    const amountNeeded = bike.tankSize - petrol;
    if (amountNeeded > 0.01) { // Add a small threshold
        onRefill(amountNeeded);
    }
  };
  
  const speedColor = currentSpeed > bike.optimalSpeed.max ? 'text-red-400' : currentSpeed < bike.optimalSpeed.min && currentSpeed > 5 ? 'text-yellow-400' : 'text-cyan-400';

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full max-w-sm bg-slate-800/50 p-4 rounded-lg shadow-lg text-center">
        <h2 className="text-xl font-bold">{bike.make} {bike.model}</h2>
        <p className="text-sm text-slate-400">Average: {bike.average} km/L | Tank: {bike.tankSize} L</p>
      </div>

      {/* Speedometer */}
      <div className="relative w-64 h-64 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-800 rounded-full shadow-inner"></div>
          <div className="absolute inset-2 border-4 border-slate-700 rounded-full"></div>
          <div className="absolute inset-4 border-2 border-cyan-500/50 rounded-full animate-pulse"></div>
          <div className="relative z-10 text-center">
            <p className={`text-7xl font-bold transition-colors ${speedColor}`}>{Math.round(currentSpeed)}</p>
            <p className="text-lg text-slate-300">km/h</p>
            <p className="text-xs text-slate-400 mt-2">
              Optimal: {bike.optimalSpeed.min}-{bike.optimalSpeed.max} km/h
            </p>
          </div>
      </div>
      
      {/* Stats */}
      <div className="w-full max-w-sm grid grid-cols-2 gap-4 text-center">
        <div className="bg-slate-800 p-4 rounded-lg">
          <p className="text-xs text-slate-400">Distance</p>
          <p className="text-2xl font-semibold">{trackingData.distance.toFixed(2)} <span className="text-base font-normal">km</span></p>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg">
          <p className="text-xs text-slate-400">Remaining Range</p>
          <p className="text-2xl font-semibold">{remainingRange.toFixed(1)} <span className="text-base font-normal">km</span></p>
        </div>
        <div className={`bg-slate-800 p-4 rounded-lg col-span-2 transition-all duration-300 ${isReserve ? 'ring-2 ring-red-500 animate-pulse' : ''}`}>
          <p className="text-xs text-slate-400">Fuel</p>
          <p className="text-2xl font-semibold">{petrol.toFixed(2)} <span className="text-base font-normal">Liters</span></p>
          {isReserve && <p className="text-xs text-red-400 mt-1">Fuel is low!</p>}
        </div>
      </div>
      
      {/* Controls */}
      <div className="w-full max-w-sm flex flex-col gap-4">
        {isTracking ? (
          <button onClick={onStop} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-full transition-colors">
            Stop Tracking
          </button>
        ) : (
          <button onClick={onStart} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-full transition-colors">
            Start Tracking
          </button>
        )}
        
        {/* Refuel Controls */}
        <div className="bg-slate-800 p-4 rounded-lg space-y-3">
          <h3 className="text-center text-sm font-medium text-slate-300">Refuel</h3>
          <form onSubmit={handleRefillSubmit} className="flex gap-2">
            <input 
              type="number"
              value={refillAmount}
              onChange={(e) => setRefillAmount(e.target.value)}
              step="0.1"
              min="0.1"
              className="w-full bg-slate-700 text-white p-3 rounded-full border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-center"
              placeholder="Liters"
            />
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition-colors">
              Add
            </button>
          </form>
          <button
            onClick={handleFullTank}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-full transition-colors text-sm disabled:bg-slate-600 disabled:opacity-50"
            disabled={petrol >= bike.tankSize}
          >
            Fill to Full
          </button>
        </div>

        <button onClick={onReset} className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-full transition-colors text-sm">
            Reset Data & Refill Tank
        </button>
      </div>
    </div>
  );
};