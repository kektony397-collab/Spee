import React from 'react';
import type { TripRecord } from '../../types';

interface HistoryViewProps {
  trips: TripRecord[];
  onDelete: (id: number) => void;
  onClear: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ trips, onDelete, onClear }) => {
    
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-cyan-400">Trip History</h2>
        {trips.length > 0 && (
            <button
            onClick={() => { if(confirm('Are you sure you want to delete all trip history? This cannot be undone.')) onClear() }}
            className="bg-red-600/50 hover:bg-red-600 text-white text-xs font-bold py-2 px-3 rounded-full transition-colors"
            >
            Clear All
            </button>
        )}
      </div>

      {trips.length === 0 ? (
        <div className="text-center text-slate-500 p-8 bg-slate-800/50 rounded-lg">
            <p>You have no saved trips.</p>
            <p className="text-sm">Complete a trip in the 'Tracker' tab to see it here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
            {trips.map(trip => (
            <div key={trip.id} className="bg-slate-800/50 p-4 rounded-lg shadow-md transition-all hover:bg-slate-800">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-lg">{trip.bikeMake} {trip.bikeModel}</p>
                        <p className="text-xs text-slate-400">{formatDate(trip.date)}</p>
                    </div>
                    <button
                        onClick={() => onDelete(trip.id!)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                        aria-label="Delete trip"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                    <div>
                        <p className="text-xs text-slate-400">Distance</p>
                        <p className="font-semibold text-cyan-400">{trip.distance.toFixed(2)} km</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400">Avg Speed</p>
                        <p className="font-semibold">{trip.avgSpeed.toFixed(1)} km/h</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400">Max Speed</p>
                        <p className="font-semibold">{trip.maxSpeed.toFixed(1)} km/h</p>
                    </div>
                </div>
            </div>
            ))}
        </div>
        )}
    </div>
  );
};
