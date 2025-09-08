
export interface Bike {
  make: string;
  model: string;
  average: number; // km/L
  tankSize: number; // Liters
  optimalSpeed: {
    min: number;
    max: number;
  };
}

export interface TrackingData {
  distance: number; // in km
  speedHistory: number[]; // array of speeds in km/h
}

export interface Position {
  lat: number;
  lng: number;
}

export type NavigationTab = 'Tracker' | 'Calculator' | 'Garage' | 'AI';
