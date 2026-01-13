'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Slider from '@/components/ui/Slider';
import Toolbar from '@/components/workbench/Toolbar';
import PhysicsLayer from '@/components/workbench/PhysicsLayer';
import LiveChart from '@/components/analysis/LiveChart';
import DataLogger from '@/components/analysis/DataLogger';
import ExportBtn from '@/components/analysis/ExportBtn';
import { useSimulation } from '@/hooks/useSimulation';
import { useDataStream } from '@/hooks/useDataStream';
import {
  Play,
  Pause,
  RotateCcw,
  Save,
  ArrowLeft,
  BookOpen,
  Info,
} from 'lucide-react';
import { EXPERIMENT_TEMPLATES } from '@/lib/constants';

interface LabWorkspaceProps {
  params: { experimentId: string };
}

export default function LabWorkspace({ params }: LabWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { experimentId } = params;

  // Get experiment template - use query param 'type' if experimentId is 'new'
  const experimentType = experimentId === 'new' 
    ? (searchParams.get('type') || 'freefall') 
    : experimentId;
  const template = EXPERIMENT_TEMPLATES[experimentType as keyof typeof EXPERIMENT_TEMPLATES];

  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const [objects, setObjects] = useState<any[]>([]);

  // Physics simulation
  const {
    physicsEngine,
    chemistryEngine,
    simulationLoop,
    state: simState,
    start,
    stop,
    reset,
    addDataPoint,
  } = useSimulation((template?.category || 'physics') as 'physics' | 'chemistry');

  // Data collection
  const { dataPoints, capture, startCapture, stopCapture, clearData, exportCSV } =
    useDataStream({
      maxPoints: 1000,
      captureInterval: 50,
    });

  // Apply template initial setup when physics engine becomes available
  useEffect(() => {
    if (!physicsEngine || !template?.initialSetup) return;

    const setup = template.initialSetup;
    const created: any[] = [];

    // Create initial physics objects if provided
        if ('objects' in setup && Array.isArray((setup as any).objects)) {
          const objs = (setup as any).objects as any[];
          objs.forEach((obj: any) => {
            let id: string | null = null;
            switch (obj.type) {
              case 'ball':
                id = physicsEngine.createBall(obj.x || 100, obj.y || 100, obj.radius || 20, obj);
                break;
              case 'box':
                id = physicsEngine.createBox(obj.x || 100, obj.y || 100, obj.width || 60, obj.height || 60, obj);
                break;
              case 'pendulum':
                id = physicsEngine.createPendulum(obj.x || 100, obj.y || 100, obj.length || 150, obj);
                break;
              case 'cannon':
                // Represent cannon as a stationary ball (projectile spawn point)
                // Add autoLaunch flag defaulting to true unless explicitly disabled in template
                const meta = { ...obj, autoLaunch: obj.autoLaunch === false ? false : true };
                id = physicsEngine.createBall(obj.x || 50, obj.y || 400, obj.radius || 8, { isSensor: true, render: { fillStyle: '#222' }, metadata: meta });
                break;
              default:
                break;
            }
    
            if (id) created.push({ id, type: obj.type, x: obj.x, y: obj.y, meta: obj });
          });
        }

    if (created.length > 0) setObjects((prev) => [...prev, ...created]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [physicsEngine, template?.initialSetup]);

  // Auto-launch projectile from cannon when simulation starts
  useEffect(() => {
    if (!simState.isRunning || !physicsEngine) return;
    if (experimentType !== 'projectilemotion') return;

    // find cannon object (not yet launched)
    const cannonObj = objects.find((o) => o.type === 'cannon' && !o.launched);
    if (!cannonObj) return;

    const meta = cannonObj.meta || {};
    // respect template's autoLaunch flag (default true)
    if (meta.autoLaunch === false) return;

    const angle = meta.angle || 45;
    const speed = meta.velocity || 20;

    // use ProjectileEngine semantics (m/s -> px/s conversion handled by engine.launch)
    // spawn and launch projectile
    // create projectile and set velocity using utility on physicsEngine
    const rad = (angle * Math.PI) / 180;
    // Convert speed to px/s using PHYSICS.SCALE in engine.launch; here we mimic that logic
    const { PHYSICS } = require('@/lib/constants');
    const speedPx = speed * PHYSICS.SCALE;
    const vx = speedPx * Math.cos(rad);
    const vy = -speedPx * Math.sin(rad);

    const projId = physicsEngine.createBall(cannonObj.x || 50, cannonObj.y || 400, meta.radius || 8, { color: '#ef4444' });
    physicsEngine.setVelocity(projId, { x: vx, y: vy });

    // mark cannon as launched to prevent repeated launches
    setObjects((prev) => prev.map((o) => (o.id === cannonObj.id ? { ...o, launched: true } : o)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simState.isRunning, physicsEngine]);

  const chartRef = useRef<HTMLDivElement>(null);

  // Handle start/stop
  const handleStart = () => {
    start();
    startCapture();
  };

  const handleStop = () => {
    stop();
    stopCapture();
  };

  const handleReset = () => {
    reset();
    clearData();
    setObjects([]);
  };

  // Handle canvas click to add objects
  const handleCanvasClick = (x: number, y: number) => {
    if (!selectedTool || !physicsEngine) return;

    let objectId: string | null = null;

    switch (selectedTool.type) {
      case 'ball':
        objectId = physicsEngine.createBall(x, y, 20, { color: selectedTool.color });
        break;
      case 'box':
        objectId = physicsEngine.createBox(x, y, 60, 60, { color: selectedTool.color });
        break;
      case 'ramp':
        objectId = physicsEngine.createRamp(x, y, 200, 30, { color: selectedTool.color });
        break;
      case 'pendulum':
        objectId = physicsEngine.createPendulum(x, y, 150, { color: selectedTool.color });
        break;
    }

    if (objectId) {
      setObjects((prev) => [...prev, { id: objectId, type: selectedTool.type, x, y }]);
    }
  };

  // Data collection callback
  const handlePhysicsUpdate = (data: any) => {
    if (data && data.length > 0 && simState.isRunning) {
      const obj = data[0];
      capture({
        time: simState.time,
        velocity: obj.speed,
        position: obj.position.y,
      });
    }
  };

  // Save experiment
  const handleSave = async () => {
    try {
      const response = await fetch('/api/experiments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user', // Replace with actual user ID from auth
          title: `${template?.name} - ${new Date().toLocaleDateString()}`,
          category: template?.category,
          experimentType: experimentType,
          state: {
            objects,
            dataPoints,
          },
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert('Experiment saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save experiment:', error);
      alert('Failed to save experiment');
    }
  };

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Experiment not found
          </h1>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              leftIcon={<ArrowLeft size={18} />}
            >
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{template.name}</h1>
              <p className="text-sm text-gray-600">{template.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTutorial(!showTutorial)}
              leftIcon={<BookOpen size={18} />}
            >
              {showTutorial ? 'Hide' : 'Show'} Tutorial
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              leftIcon={<Save size={18} />}
            >
              Save
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Toolbar */}
          <div className="lg:col-span-2">
            <Toolbar
              category={template.category as any}
              onToolSelect={setSelectedTool}
              selectedTool={selectedTool}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-7">
            {/* Tutorial Panel */}
            {showTutorial && (
              <Card variant="glass" className="mb-6">
                <div className="flex items-start gap-3">
                  <Info className="text-blue-600 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      Theory & Objectives
                    </h3>
                    <p className="text-sm text-gray-700 mb-3">{template.theory}</p>
                    <div className="text-sm">
                      <strong className="text-gray-900">Learning Objectives:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                        {template.objectives.map((obj, idx) => (
                          <li key={idx}>{obj}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Simulation Controls */}
            <Card className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {!simState.isRunning ? (
                    <Button
                      variant="success"
                      onClick={handleStart}
                      leftIcon={<Play size={20} />}
                    >
                      Start Simulation
                    </Button>
                  ) : (
                    <Button
                      variant="danger"
                      onClick={handleStop}
                      leftIcon={<Pause size={20} />}
                    >
                      Stop
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    leftIcon={<RotateCcw size={20} />}
                  >
                    Reset
                  </Button>
                </div>

                <div className="text-sm font-mono bg-gray-100 px-4 py-2 rounded-lg">
                  Time: {simState.time.toFixed(2)}s
                </div>
              </div>
            </Card>

            {/* Canvas */}
            <PhysicsLayer
              engine={physicsEngine?.getEngine() || null}
              isRunning={simState.isRunning}
              onUpdate={handlePhysicsUpdate}
            />
          </div>

          {/* Right Sidebar - Analysis */}
          <div className="lg:col-span-3 space-y-6">
            {/* Live Chart */}
            <div ref={chartRef}>
              <LiveChart
                data={dataPoints}
                config={{
                  xKey: 'time',
                  yKey: 'velocity',
                  xLabel: 'Time (s)',
                  yLabel: 'Velocity (m/s)',
                  title: 'Velocity vs Time',
                  color: '#3b82f6',
                }}
              />
            </div>

            {/* Export */}
            <Card>
              <h3 className="font-bold text-gray-900 mb-3">Export Data</h3>
              <ExportBtn
                data={dataPoints}
                chartRef={chartRef}
                experimentName={experimentType}
              />
            </Card>

            {/* Data Logger */}
            <DataLogger
              data={dataPoints}
              columns={['time', 'velocity', 'position']}
            />
          </div>
        </div>
      </div>
    </div>
  );
}