
import React, { useState } from 'react';
import type { Bike } from '../../types';

interface GarageViewProps {
  bikes: Bike[];
  onSelectBike: (bike: Bike) => void;
}

export const GarageView: React.FC<GarageViewProps> = ({ bikes, onSelectBike }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBikes = bikes.filter(bike =>
    `${bike.make} ${bike.model}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-cyan-400 text-center">Your Garage</h2>
      <input
        type="text"
        placeholder="Search for a bike..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-slate-800 text-white p-3 rounded-full border border-slate-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
      />
      <div className="flex flex-col gap-3">
        {filteredBikes.map(bike => (
          <div key={`${bike.make}-${bike.model}`} className="bg-slate-800/50 p-4 rounded-lg flex justify-between items-center shadow-md">
            <div>
              <p className="font-bold text-lg">{bike.make} {bike.model}</p>
              <p className="text-sm text-slate-400">Avg: {bike.average} km/L</p>
            </div>
            <button
              onClick={() => onSelectBike(bike)}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-full transition-colors"
            >
              Select
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
