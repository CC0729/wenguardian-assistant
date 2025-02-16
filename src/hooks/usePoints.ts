import { useState, useEffect } from 'react';

const POINTS_KEY = 'user_points';
const INITIAL_POINTS = 100;

export function usePoints() {
  const [points, setPoints] = useState(() => {
    const stored = localStorage.getItem(POINTS_KEY);
    return stored ? parseInt(stored) : INITIAL_POINTS;
  });

  useEffect(() => {
    localStorage.setItem(POINTS_KEY, points.toString());
  }, [points]);

  const addPoints = (amount: number) => {
    setPoints(prev => Math.max(0, prev + amount));
  };

  const hasEnoughPoints = (cost: number) => {
    return points >= cost;
  };

  return {
    points,
    addPoints,
    hasEnoughPoints
  };
} 