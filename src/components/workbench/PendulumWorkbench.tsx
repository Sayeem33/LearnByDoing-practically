'use client';

import React, { useEffect, useState } from 'react';
import PhysicsEngine from '@/engine/PhysicsEngine';
import PendulumEngine from '@/engine/physics/pendulumEngine';
import EnergyGraph from '@/components/analysis/EnergyGraph';
import { useDataStream } from '@/hooks/useDataStream';

export default function PendulumWorkbench() {
  const [physics] = useState(() => new PhysicsEngine());
  const [engine] = useState(() => new PendulumEngine(physics));
  const [length, setLength] = useState(200);
  const [mass, setMass] = useState(1);
  const [running, setRunning] = useState(false);
  const { dataPoints, capture, startCapture, stopCapture, exportCSV } = useDataStream({ captureInterval: 50 });

  useEffect(() => {
    engine.create(400, 100, length, mass);
    return () => physics.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStart = () => {
    physics.start();
    startCapture();
    setRunning(true);
  };
  const handleStop = () => {
    physics.stop();
    stopCapture();
    setRunning(false);
  };
  const handleReset = () => {
    physics.reset();
    engine.create(400, 100, length, mass);
    setRunning(false);
  };

  // sample energy periodically
  useEffect(() => {
    let id = 0;
    const loop = () => {
      const e = engine.getEnergy();
      if (e) capture({ time: Date.now(), pe: e.pe, ke: e.ke, total: e.total });
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const theoreticalPeriod = PendulumEngine.period(length / 100); // convert px to meters roughly

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 bg-white p-4 rounded shadow">
        <div className="flex gap-2 mb-4">
          <button onClick={handleStart} className="btn btn-primary" disabled={running}>Start</button>
          <button onClick={handleStop} className="btn btn-secondary" disabled={!running}>Stop</button>
          <button onClick={handleReset} className="btn">Reset</button>
        </div>
        <div className="h-96 border flex items-center justify-center text-sm text-gray-500">Canvas preview (pendulum)</div>
      </div>

      <div className="col-span-1 space-y-4">
        <div className="bg-white p-4 rounded shadow">
          <label className="block text-sm">Length: {length}px</label>
          <input type="range" min={50} max={400} value={length} onChange={(e) => setLength(Number(e.target.value))} />
          <label className="block text-sm mt-2">Mass: {mass} kg</label>
          <input type="range" min={1} max={10} value={mass} onChange={(e) => setMass(Number(e.target.value))} />
          <div className="mt-4">
            <strong>Period (theoretical):</strong>
            <p>{theoreticalPeriod.toFixed(2)} s</p>
          </div>
        </div>

        <EnergyGraph data={dataPoints.map((d) => ({ time: d.time, pe: d.pe, ke: d.ke }))} />
      </div>
    </div>
  );
}
