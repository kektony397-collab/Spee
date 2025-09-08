
import React from 'react';
import type { NavigationTab } from '../types';
import { TrackerIcon, CalculatorIcon, GarageIcon, AiIcon } from './icons/NavIcons';

interface BottomNavBarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, setActiveTab }) => {
  const navItems: { tab: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'Tracker', label: 'Tracker', icon: <TrackerIcon /> },
    { tab: 'Calculator', label: 'Calculate', icon: <CalculatorIcon /> },
    { tab: 'Garage', label: 'Garage', icon: <GarageIcon /> },
    { tab: 'AI', label: 'AI Coach', icon: <AiIcon /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-slate-800/80 backdrop-blur-sm border-t border-slate-700 shadow-lg">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ease-in-out ${
                isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </div>
              <span className={`text-xs mt-1 font-medium ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
