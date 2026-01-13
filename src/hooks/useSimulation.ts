import { useEffect, useRef, useState, useCallback } from 'react';
import PhysicsEngine from '@/engine/PhysicsEngine';
import ChemistryCore from '@/engine/ChemistryCore';
import SimulationLoop from '@/engine/SimulationLoop';

export interface SimulationState {
  isRunning: boolean;
  time: number;
  dataPoints: any[];
}

export function useSimulation(experimentType: 'physics' | 'chemistry') {
  const physicsEngineRef = useRef<PhysicsEngine | null>(null);
  const chemistryEngineRef = useRef<ChemistryCore | null>(null);
  const simulationLoopRef = useRef<SimulationLoop | null>(null);

  const [state, setState] = useState<SimulationState>({
    isRunning: false,
    time: 0,
    dataPoints: [],
  });

  // Initialize engines
  useEffect(() => {
    if (experimentType === 'physics') {
      physicsEngineRef.current = new PhysicsEngine();
    } else {
      chemistryEngineRef.current = new ChemistryCore();
    }

    simulationLoopRef.current = new SimulationLoop();

    return () => {
      // Cleanup
      simulationLoopRef.current?.stop();
      physicsEngineRef.current?.reset();
      chemistryEngineRef.current?.reset();
    };
  }, [experimentType]);

  // Start simulation
  const start = useCallback(() => {
    if (!simulationLoopRef.current) return;

    simulationLoopRef.current.onUpdate((deltaTime) => {
      if (physicsEngineRef.current) {
        physicsEngineRef.current.step(deltaTime);
      }

      setState((prev) => ({
        ...prev,
        time: simulationLoopRef.current!.getElapsedTime(),
      }));
    });

    simulationLoopRef.current.start();
    
    if (physicsEngineRef.current) {
      physicsEngineRef.current.start();
    }

    setState((prev) => ({ ...prev, isRunning: true }));
  }, []);

  // Stop simulation
  const stop = useCallback(() => {
    simulationLoopRef.current?.stop();
    physicsEngineRef.current?.stop();
    setState((prev) => ({ ...prev, isRunning: false }));
  }, []);

  // Reset simulation
  const reset = useCallback(() => {
    stop();
    simulationLoopRef.current?.reset();
    physicsEngineRef.current?.reset();
    chemistryEngineRef.current?.reset();
    setState({
      isRunning: false,
      time: 0,
      dataPoints: [],
    });
  }, [stop]);

  // Add data point
  const addDataPoint = useCallback((data: any) => {
    setState((prev) => ({
      ...prev,
      dataPoints: [...prev.dataPoints, data],
    }));
  }, []);

  return {
    physicsEngine: physicsEngineRef.current,
    chemistryEngine: chemistryEngineRef.current,
    simulationLoop: simulationLoopRef.current,
    state,
    start,
    stop,
    reset,
    addDataPoint,
  };
}