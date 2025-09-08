
import { useState, useRef, useCallback } from 'react';
import type { Position } from '../types';

const haversineDistance = (coords1: Position, coords2: Position): number => {
  const toRad = (x: number) => (x * Math.PI) / 180;

  const R = 6371; // Earth radius in km
  const dLat = toRad(coords2.lat - coords1.lat);
  const dLon = toRad(coords2.lng - coords1.lng);
  const lat1 = toRad(coords1.lat);
  const lat2 = toRad(coords2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return d;
};


export const useGeolocation = () => {
  const [position, setPosition] = useState<Position | null>(null);
  const [speed, setSpeed] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const watchId = useRef<number | null>(null);
  const lastPosition = useRef<Position | null>(null);
  
  const resetDistance = useCallback(() => {
    setDistance(0);
    lastPosition.current = null;
  },[]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const currentPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        setPosition(currentPosition);
        // Speed is in m/s, convert to km/h
        setSpeed(pos.coords.speed ? pos.coords.speed * 3.6 : 0);
        setError(null);
        
        if (lastPosition.current) {
            const newDistance = haversineDistance(lastPosition.current, currentPosition);
            setDistance(prevDistance => prevDistance + newDistance);
        }
        lastPosition.current = currentPosition;

      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Location access was denied. Please enable it in your browser settings.");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Location information is unavailable.");
            break;
          case err.TIMEOUT:
            setError("The request to get user location timed out.");
            break;
          default:
            setError("An unknown error occurred.");
            break;
        }
      },
      options
    );
  }, []);

  const stopTracking = useCallback(() => {
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setSpeed(0);
  }, []);

  return { position, speed, distance, error, startTracking, stopTracking, resetDistance };
};
