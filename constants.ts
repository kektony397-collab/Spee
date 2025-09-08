
import type { Bike } from './types';

export const DEFAULT_BIKE: Bike = {
  make: 'Honda',
  model: 'Dream Yuga',
  average: 44,
  tankSize: 8,
  optimalSpeed: { min: 40, max: 55 },
};

export const BIKE_DATA: Bike[] = [
  DEFAULT_BIKE,
  {
    make: 'Hero',
    model: 'Splendor Plus',
    average: 65,
    tankSize: 9.8,
    optimalSpeed: { min: 40, max: 60 },
  },
  {
    make: 'Bajaj',
    model: 'Pulsar 150',
    average: 50,
    tankSize: 15,
    optimalSpeed: { min: 50, max: 70 },
  },
  {
    make: 'Yamaha',
    model: 'FZ-S FI',
    average: 45,
    tankSize: 13,
    optimalSpeed: { min: 50, max: 65 },
  },
  {
    make: 'Royal Enfield',
    model: 'Classic 350',
    average: 35,
    tankSize: 13,
    optimalSpeed: { min: 60, max: 80 },
  },
  {
    make: 'TVS',
    model: 'Apache RTR 160',
    average: 45,
    tankSize: 12,
    optimalSpeed: { min: 50, max: 70 },
  },
];
