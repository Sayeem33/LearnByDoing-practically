import { useState, useEffect, useCallback, useRef } from 'react';
import { DataPoint } from '@/engine/SimulationLoop';

export interface DataStreamConfig {
  maxPoints?: number;
  captureInterval?: number; // milliseconds
  variables?: string[];
}

export function useDataStream(config: DataStreamConfig = {}) {
  const {
    maxPoints = 1000,
    captureInterval = 50,
    variables = ['time', 'value'],
  } = config;

  const [dataPoints, setDataPoints] = useState<any[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const lastCaptureTime = useRef<number>(0);

  // Capture data point
  const capture = useCallback(
    (data: DataPoint) => {
      const now = Date.now();
      
      // Throttle data capture based on interval
      if (now - lastCaptureTime.current < captureInterval) {
        return;
      }

      lastCaptureTime.current = now;

      setDataPoints((prev) => {
        const newPoints = [...prev, data];
        // Keep only last maxPoints
        if (newPoints.length > maxPoints) {
          return newPoints.slice(-maxPoints);
        }
        return newPoints;
      });
    },
    [captureInterval, maxPoints]
  );

  // Start capturing
  const startCapture = useCallback(() => {
    setIsCapturing(true);
    lastCaptureTime.current = 0;
  }, []);

  // Stop capturing
  const stopCapture = useCallback(() => {
    setIsCapturing(false);
  }, []);

  // Clear data
  const clearData = useCallback(() => {
    setDataPoints([]);
  }, []);

  // Export data as CSV
  const exportCSV = useCallback(() => {
    if (dataPoints.length === 0) return;

    const headers = Object.keys(dataPoints[0]);
    const csvContent = [
      headers.join(','),
      ...dataPoints.map((point) =>
        headers.map((key) => point[key]).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `experiment_data_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [dataPoints]);

  // Get statistics
  const getStatistics = useCallback(
    (variable: string) => {
      if (dataPoints.length === 0) return null;

      const values = dataPoints
        .map((point) => point[variable])
        .filter((value): value is number => typeof value === 'number');
      
      if (values.length === 0) return null;

      const sum = values.reduce((a, b) => a + b, 0);
      const mean = sum / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      return { mean, min, max, stdDev, count: values.length };
    },
    [dataPoints]
  );

  return {
    dataPoints,
    isCapturing,
    capture,
    startCapture,
    stopCapture,
    clearData,
    exportCSV,
    getStatistics,
  };
}
