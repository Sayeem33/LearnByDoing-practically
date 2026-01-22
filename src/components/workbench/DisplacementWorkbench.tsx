'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDataStream } from '@/hooks/useDataStream';
import LiveChart from '@/components/analysis/LiveChart';
import ExportBtn from '@/components/analysis/ExportBtn';
import Card from '@/components/ui/Card';
import { Play, Pause, RotateCcw, FlaskConical, ArrowRightLeft } from 'lucide-react';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const CAPTURE_INTERVAL = 100;

// Reactivity series (most reactive to least)
const REACTIVITY_ORDER = ['K', 'Na', 'Ca', 'Mg', 'Al', 'Zn', 'Fe', 'Ni', 'Sn', 'Pb', 'H', 'Cu', 'Ag', 'Au'];

// Metals and their properties
const METALS: Record<string, {
  name: string;
  symbol: string;
  color: string;
  ionColor: string;
  reactivity: number;
}> = {
  zinc: { name: 'Zinc', symbol: 'Zn', color: '#94a3b8', ionColor: '#ffffff', reactivity: 6 },
  iron: { name: 'Iron', symbol: 'Fe', color: '#78716c', ionColor: '#fde68a', reactivity: 7 },
  magnesium: { name: 'Magnesium', symbol: 'Mg', color: '#e5e7eb', ionColor: '#ffffff', reactivity: 4 },
  copper: { name: 'Copper', symbol: 'Cu', color: '#f97316', ionColor: '#3b82f6', reactivity: 12 },
};

// Metal ion solutions
const SOLUTIONS: Record<string, {
  name: string;
  formula: string;
  metal: string;
  color: string;
  metalSymbol: string;
  reactivity: number;
}> = {
  cuso4: { 
    name: 'Copper Sulfate', 
    formula: 'CuSO₄', 
    metal: 'copper',
    color: '#3b82f6', 
    metalSymbol: 'Cu²⁺',
    reactivity: 12 
  },
  znso4: { 
    name: 'Zinc Sulfate', 
    formula: 'ZnSO₄', 
    metal: 'zinc',
    color: '#e5e7eb', 
    metalSymbol: 'Zn²⁺',
    reactivity: 6 
  },
  feso4: { 
    name: 'Iron(II) Sulfate', 
    formula: 'FeSO₄', 
    metal: 'iron',
    color: '#84cc16', 
    metalSymbol: 'Fe²⁺',
    reactivity: 7 
  },
  agno3: { 
    name: 'Silver Nitrate', 
    formula: 'AgNO₃', 
    metal: 'silver',
    color: '#f3f4f6', 
    metalSymbol: 'Ag⁺',
    reactivity: 13 
  },
};

interface Bubble {
  x: number;
  y: number;
  r: number;
  speed: number;
}

interface Deposit {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

interface ReactionState {
  reactionProgress: number; // 0-100%
  metalRemaining: number; // mass %
  ionConcentration: number; // 0-100
  temperature: number;
  time: number;
}

export default function DisplacementWorkbench() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { dataPoints, capture, clearData, startCapture, stopCapture } = useDataStream({ captureInterval: CAPTURE_INTERVAL });

  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [selectedMetal, setSelectedMetal] = useState<string>('zinc');
  const [selectedSolution, setSelectedSolution] = useState<string>('cuso4');
  
  const [state, setState] = useState<ReactionState>({
    reactionProgress: 0,
    metalRemaining: 100,
    ionConcentration: 100,
    temperature: 25,
    time: 0,
  });

  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [reactionMessage, setReactionMessage] = useState<string>('');

  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  // Check if reaction will occur
  const willReact = useCallback((metalKey: string, solutionKey: string) => {
    const metal = METALS[metalKey];
    const solution = SOLUTIONS[solutionKey];
    // A more reactive metal will displace a less reactive metal from solution
    return metal.reactivity < solution.reactivity;
  }, []);

  // Get reaction equation
  const getReactionEquation = useCallback((metalKey: string, solutionKey: string) => {
    const metal = METALS[metalKey];
    const solution = SOLUTIONS[solutionKey];
    
    if (!willReact(metalKey, solutionKey)) {
      return 'No reaction - metal is less reactive than ions in solution';
    }

    if (solutionKey === 'cuso4') {
      return `${metal.symbol}(s) + CuSO₄(aq) → ${metal.symbol}SO₄(aq) + Cu(s)`;
    }
    if (solutionKey === 'agno3') {
      return `${metal.symbol}(s) + 2AgNO₃(aq) → ${metal.symbol}(NO₃)₂(aq) + 2Ag(s)`;
    }
    return `${metal.symbol}(s) + ${solution.formula}(aq) → ${metal.symbol}${solution.formula.slice(-3)}(aq) + ${solution.metal}(s)`;
  }, [willReact]);

  // Initialize state
  const initializeState = useCallback(() => {
    setState({
      reactionProgress: 0,
      metalRemaining: 100,
      ionConcentration: 100,
      temperature: 25,
      time: 0,
    });
    setBubbles([]);
    setDeposits([]);
    
    if (willReact(selectedMetal, selectedSolution)) {
      setReactionMessage('✓ Reaction will occur - metal is more reactive');
    } else {
      setReactionMessage('✗ No reaction - metal is less reactive');
    }
  }, [selectedMetal, selectedSolution, willReact]);

  // Initialize on mount and selection changes
  useEffect(() => {
    if (!running) {
      initializeState();
    }
  }, [running, selectedMetal, selectedSolution, initializeState]);

  // Simulation loop
  useEffect(() => {
    if (!running) return;

    const metal = METALS[selectedMetal];
    const solution = SOLUTIONS[selectedSolution];
    const canReact = willReact(selectedMetal, selectedSolution);

    const simulate = (timestamp: number) => {
      if (!lastUpdateRef.current) lastUpdateRef.current = timestamp;
      const dt = Math.min((timestamp - lastUpdateRef.current) / 1000, 0.1);
      lastUpdateRef.current = timestamp;

      if (canReact) {
        setState(prev => {
          if (prev.reactionProgress >= 100 || prev.metalRemaining <= 0) {
            return prev;
          }

          // Reaction rate depends on concentration and temperature
          const reactionRate = (prev.ionConcentration / 100) * 
            (1 + (prev.temperature - 25) * 0.02) * 2 * dt;
          
          const newProgress = Math.min(100, prev.reactionProgress + reactionRate);
          const newMetalRemaining = Math.max(0, 100 - newProgress);
          const newIonConc = Math.max(0, 100 - newProgress);
          
          // Temperature rises slightly during exothermic reaction
          const newTemp = 25 + (newProgress / 100) * 10;

          return {
            reactionProgress: newProgress,
            metalRemaining: newMetalRemaining,
            ionConcentration: newIonConc,
            temperature: newTemp,
            time: prev.time + dt,
          };
        });

        // Generate bubbles (hydrogen if reacting with acid, or just visual effect)
        setBubbles(prev => {
          let updated = prev
            .map(b => ({ ...b, y: b.y - b.speed }))
            .filter(b => b.y > 150);

          if (state.reactionProgress < 95 && Math.random() < 0.3) {
            updated.push({
              x: 350 + Math.random() * 100,
              y: 350,
              r: 2 + Math.random() * 4,
              speed: 1 + Math.random() * 2,
            });
          }

          return updated;
        });

        // Generate metal deposits
        setDeposits(prev => {
          let updated = [...prev];

          if (state.reactionProgress < 95 && state.reactionProgress > 5 && Math.random() < 0.15) {
            updated.push({
              x: 320 + Math.random() * 160,
              y: 320 + Math.random() * 60,
              size: 2 + Math.random() * 5,
              opacity: 0.6 + Math.random() * 0.4,
            });
          }

          return updated.slice(-50); // Limit deposits
        });
      }

      animationRef.current = requestAnimationFrame(simulate);
    };

    animationRef.current = requestAnimationFrame(simulate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [running, selectedMetal, selectedSolution, willReact, state.reactionProgress]);

  // Drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let drawAnimationRef: number;

    const metal = METALS[selectedMetal];
    const solution = SOLUTIONS[selectedSolution];
    const canReact = willReact(selectedMetal, selectedSolution);
    const displacedMetal = canReact ? METALS[solution.metal as keyof typeof METALS] : null;

    const draw = () => {
      // Background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#f1f5f9');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Title
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Metal Displacement Reaction', CANVAS_WIDTH / 2, 30);
      ctx.font = '12px Arial';
      ctx.fillStyle = '#6b7280';
      ctx.fillText('Reactivity Series Demonstration', CANVAS_WIDTH / 2, 50);

      // Draw beaker
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(280, 130);
      ctx.lineTo(270, 400);
      ctx.lineTo(530, 400);
      ctx.lineTo(520, 130);
      ctx.closePath();
      ctx.stroke();

      // Solution with color change
      const currentColor = canReact && state.reactionProgress > 0
        ? interpolateColor(solution.color, '#e5e7eb', state.reactionProgress / 100)
        : solution.color;
      
      ctx.fillStyle = `${currentColor}90`;
      ctx.beginPath();
      ctx.moveTo(273, 160);
      ctx.lineTo(270, 397);
      ctx.lineTo(530, 397);
      ctx.lineTo(527, 160);
      ctx.closePath();
      ctx.fill();

      // Draw metal piece (shrinking if reacting)
      const metalWidth = 80 * (state.metalRemaining / 100);
      const metalHeight = 120 * (state.metalRemaining / 100);
      
      if (metalWidth > 5) {
        ctx.fillStyle = metal.color;
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.roundRect(
          400 - metalWidth / 2,
          350 - metalHeight,
          metalWidth,
          metalHeight,
          5
        );
        ctx.fill();
        ctx.stroke();

        // Metal label
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(metal.symbol, 400, 350 - metalHeight / 2 + 5);
      }

      // Draw displaced metal deposits
      if (canReact && displacedMetal) {
        deposits.forEach(d => {
          ctx.fillStyle = displacedMetal.color;
          ctx.globalAlpha = d.opacity;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      }

      // Draw bubbles
      bubbles.forEach(b => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Reactivity series panel
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.roundRect(20, 80, 120, 320, 10);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Reactivity', 80, 100);
      ctx.fillText('Series', 80, 115);

      ctx.font = '10px Arial';
      ctx.textAlign = 'left';
      const yStart = 135;
      const yStep = 18;
      
      REACTIVITY_ORDER.forEach((symbol, i) => {
        const y = yStart + i * yStep;
        const isSelectedMetal = Object.values(METALS).some(m => m.symbol === symbol && 
          selectedMetal === Object.keys(METALS).find(k => METALS[k].symbol === symbol));
        const isSolutionMetal = solution.metalSymbol.startsWith(symbol);
        
        if (isSelectedMetal) {
          ctx.fillStyle = '#3b82f6';
          ctx.fillRect(25, y - 10, 90, 15);
          ctx.fillStyle = '#ffffff';
        } else if (isSolutionMetal) {
          ctx.fillStyle = '#f97316';
          ctx.fillRect(25, y - 10, 90, 15);
          ctx.fillStyle = '#ffffff';
        } else {
          ctx.fillStyle = symbol === 'H' ? '#ef4444' : '#6b7280';
        }
        
        const label = symbol === 'H' ? 'H (hydrogen)' : symbol;
        ctx.fillText(`${i + 1}. ${label}`, 30, y);
      });

      // Legend
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(25, 385, 10, 10);
      ctx.fillStyle = '#1f2937';
      ctx.font = '9px Arial';
      ctx.fillText('Metal', 40, 393);
      
      ctx.fillStyle = '#f97316';
      ctx.fillRect(75, 385, 10, 10);
      ctx.fillText('Ion', 90, 393);

      // Info panel
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.roundRect(CANVAS_WIDTH - 230, 80, 210, 200, 10);
      ctx.fill();
      ctx.strokeStyle = canReact ? '#22c55e' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('📊 Reaction Data', CANVAS_WIDTH - 220, 100);
      
      ctx.font = '11px Arial';
      ctx.fillText(`Metal: ${metal.name} (${metal.symbol})`, CANVAS_WIDTH - 220, 125);
      ctx.fillText(`Solution: ${solution.name}`, CANVAS_WIDTH - 220, 145);
      ctx.fillText(`Progress: ${state.reactionProgress.toFixed(1)}%`, CANVAS_WIDTH - 220, 170);
      ctx.fillText(`Metal remaining: ${state.metalRemaining.toFixed(1)}%`, CANVAS_WIDTH - 220, 190);
      ctx.fillText(`Ion conc.: ${state.ionConcentration.toFixed(1)}%`, CANVAS_WIDTH - 220, 210);
      ctx.fillText(`Temp: ${state.temperature.toFixed(1)}°C`, CANVAS_WIDTH - 220, 230);
      
      // Reaction status
      ctx.fillStyle = canReact ? '#22c55e' : '#ef4444';
      ctx.font = 'bold 11px Arial';
      ctx.fillText(reactionMessage, CANVAS_WIDTH - 220, 260);

      // Equation panel
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.roundRect(150, CANVAS_HEIGHT - 80, 500, 60, 10);
      ctx.fill();
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Reaction Equation:', 400, CANVAS_HEIGHT - 60);
      ctx.font = '14px Arial';
      ctx.fillStyle = canReact ? '#166534' : '#991b1b';
      ctx.fillText(getReactionEquation(selectedMetal, selectedSolution), 400, CANVAS_HEIGHT - 38);

      drawAnimationRef = requestAnimationFrame(draw);
    };

    drawAnimationRef = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(drawAnimationRef);
    };
  }, [state, bubbles, deposits, selectedMetal, selectedSolution, willReact, getReactionEquation, reactionMessage]);

  // Helper function to interpolate colors
  function interpolateColor(color1: string, color2: string, factor: number): string {
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');
    
    const r1 = parseInt(hex1.substring(0, 2), 16);
    const g1 = parseInt(hex1.substring(2, 4), 16);
    const b1 = parseInt(hex1.substring(4, 6), 16);
    
    const r2 = parseInt(hex2.substring(0, 2), 16);
    const g2 = parseInt(hex2.substring(2, 4), 16);
    const b2 = parseInt(hex2.substring(4, 6), 16);
    
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  // Data capture
  const lastCapturedTime = useRef<number>(-1);

  useEffect(() => {
    if (!running) return;

    const elapsed = (Date.now() - startTimeRef.current) / 1000;

    if (elapsed - lastCapturedTime.current >= CAPTURE_INTERVAL / 1000) {
      lastCapturedTime.current = elapsed;
      setTime(elapsed);

      capture({
        time: parseFloat(elapsed.toFixed(2)),
        reactionProgress: parseFloat(state.reactionProgress.toFixed(1)),
        metalRemaining: parseFloat(state.metalRemaining.toFixed(1)),
        ionConcentration: parseFloat(state.ionConcentration.toFixed(1)),
        temperature: parseFloat(state.temperature.toFixed(1)),
      });
    }
  }, [running, state, capture]);

  const handleStart = () => {
    startTimeRef.current = Date.now();
    lastUpdateRef.current = 0;
    lastCapturedTime.current = -1;
    setRunning(true);
    startCapture();

    capture({
      time: 0,
      reactionProgress: 0,
      metalRemaining: 100,
      ionConcentration: 100,
      temperature: 25,
    });
  };

  const handleStop = () => {
    setRunning(false);
    stopCapture();
  };

  const handleReset = () => {
    setRunning(false);
    setTime(0);
    clearData();
    initializeState();
    lastCapturedTime.current = -1;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Canvas */}
        <div className="lg:col-span-2">
          <Card>
            <h3 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
              <ArrowRightLeft className="text-green-500" size={24} />
              Metal Displacement Reaction
            </h3>

            <div className="flex flex-wrap gap-2 mb-4">
              {!running ? (
                <button
                  onClick={handleStart}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition"
                >
                  <Play size={18} /> Start Reaction
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition"
                >
                  <Pause size={18} /> Stop
                </button>
              )}
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition"
              >
                <RotateCcw size={18} /> Reset
              </button>
              <ExportBtn data={dataPoints} experimentName="displacement" />
            </div>

            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="border-2 border-gray-200 rounded-lg w-full"
              style={{ maxWidth: '100%', height: 'auto' }}
            />

            <p className="text-sm text-gray-600 mt-3 text-center">
              ⚗️ A more reactive metal displaces a less reactive metal from its solution
            </p>
          </Card>
        </div>

        {/* Controls Sidebar */}
        <div className="space-y-4">
          {/* Metal Selection */}
          <Card>
            <h3 className="font-bold text-lg mb-3 text-gray-900 flex items-center gap-2">
              <FlaskConical className="text-blue-500" size={20} />
              Select Metal
            </h3>

            <div className="space-y-2">
              {Object.entries(METALS).map(([key, metalData]) => (
                <button
                  key={key}
                  onClick={() => !running && setSelectedMetal(key)}
                  disabled={running}
                  className={`w-full p-3 rounded-lg border-2 transition text-left ${
                    selectedMetal === key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${running ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded border border-gray-300"
                      style={{ backgroundColor: metalData.color }}
                    />
                    <div>
                      <div className="font-medium text-sm">{metalData.name}</div>
                      <div className="text-xs text-gray-500">Symbol: {metalData.symbol}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Solution Selection */}
          <Card>
            <h3 className="font-bold text-lg mb-3 text-gray-900">🧪 Select Solution</h3>

            <div className="space-y-2">
              {Object.entries(SOLUTIONS).map(([key, sol]) => (
                <button
                  key={key}
                  onClick={() => !running && setSelectedSolution(key)}
                  disabled={running}
                  className={`w-full p-3 rounded-lg border-2 transition text-left ${
                    selectedSolution === key
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${running ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded border border-gray-300"
                      style={{ backgroundColor: sol.color }}
                    />
                    <div>
                      <div className="font-medium text-sm">{sol.name}</div>
                      <div className="text-xs text-gray-500">{sol.formula}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Reaction Prediction */}
          <Card>
            <h3 className="font-bold text-sm text-gray-900 mb-3">🔮 Prediction</h3>
            <div className={`p-3 rounded-lg border ${
              willReact(selectedMetal, selectedSolution) 
                ? 'bg-green-50 border-green-300'
                : 'bg-red-50 border-red-300'
            }`}>
              <p className={`font-semibold text-sm ${
                willReact(selectedMetal, selectedSolution) 
                  ? 'text-green-700'
                  : 'text-red-700'
              }`}>
                {willReact(selectedMetal, selectedSolution) 
                  ? '✓ Reaction WILL occur'
                  : '✗ NO reaction expected'
                }
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {willReact(selectedMetal, selectedSolution) 
                  ? `${METALS[selectedMetal].symbol} is more reactive than ${SOLUTIONS[selectedSolution].metalSymbol}`
                  : `${METALS[selectedMetal].symbol} is less reactive than ${SOLUTIONS[selectedSolution].metalSymbol}`
                }
              </p>
            </div>
          </Card>

          {/* Theory */}
          <Card>
            <h3 className="font-bold text-sm text-gray-900 mb-3">📚 Theory</h3>
            <div className="text-xs space-y-2">
              <p className="text-gray-600">
                More reactive metals can displace less reactive metals from their compounds.
              </p>
              <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
                <span className="font-semibold">Reactivity Rule:</span>
                <p className="text-gray-600 mt-1">
                  If Metal A is above Metal B in the reactivity series, A will displace B.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveChart
          data={dataPoints}
          config={{
            xKey: 'time',
            yKey: 'reactionProgress',
            xLabel: 'Time (s)',
            yLabel: 'Progress (%)',
            title: '📈 Reaction Progress',
            color: '#22c55e',
          }}
        />
        <LiveChart
          data={dataPoints}
          config={{
            xKey: 'time',
            yKey: 'ionConcentration',
            xLabel: 'Time (s)',
            yLabel: 'Concentration (%)',
            title: '📈 Ion Concentration Change',
            color: '#3b82f6',
          }}
        />
        <LiveChart
          data={dataPoints}
          config={{
            xKey: 'time',
            yKey: 'metalRemaining',
            xLabel: 'Time (s)',
            yLabel: 'Metal Remaining (%)',
            title: '📈 Metal Consumption',
            color: '#f97316',
          }}
        />
        <LiveChart
          data={dataPoints}
          config={{
            xKey: 'time',
            yKey: 'temperature',
            xLabel: 'Time (s)',
            yLabel: 'Temperature (°C)',
            title: '📈 Temperature Change',
            color: '#ef4444',
          }}
        />
      </div>
    </div>
  );
}
