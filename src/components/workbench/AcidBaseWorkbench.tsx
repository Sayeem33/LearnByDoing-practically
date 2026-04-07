'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChemistryCore, Chemical, ReactionResult } from '@/engine/ChemistryCore';
import { useDataStream } from '@/hooks/useDataStream';
import LiveChart from '@/components/analysis/LiveChart';
import ExportBtn from '@/components/analysis/ExportBtn';
import Card from '@/components/ui/Card';
import { Play, Pause, RotateCcw, Beaker, Droplets, Thermometer, FlaskConical } from 'lucide-react';
import { WorkbenchPersistenceProps } from '@/components/workbench/persistence';

// Helper function to draw rounded rectangle (polyfill for older browsers)
function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Chemical item for drag and drop
interface ChemicalItem {
  id: string;
  formula: string;
  name: string;
  color: string;
  x: number;
  y: number;
  amount: number;
  ph: number;
}

// Beaker state
interface BeakerState {
  chemicals: ChemicalItem[];
  mixedColor: string;
  ph: number;
  temperature: number;
  volume: number;
  reactionMessage: string;
  bubbling: boolean;
  glowing: boolean;
}

const AVAILABLE_CHEMICALS = [
  { formula: 'HCl', name: 'Hydrochloric Acid', color: '#ef4444', ph: 1 },
  { formula: 'NaOH', name: 'Sodium Hydroxide', color: '#3b82f6', ph: 14 },
  { formula: 'H2O', name: 'Water', color: '#06b6d4', ph: 7 },
  { formula: 'NaCl', name: 'Sodium Chloride', color: '#94a3b8', ph: 7 },
];

const CAPTURE_INTERVAL = 100; // ms

const defaultBeakerState: BeakerState = {
  chemicals: [],
  mixedColor: '#06b6d4',
  ph: 7,
  temperature: 25,
  volume: 0,
  reactionMessage: '',
  bubbling: false,
  glowing: false,
};

export default function AcidBaseWorkbench({
  initialSnapshot,
  onSnapshotChange,
}: WorkbenchPersistenceProps<any>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [chemistry] = useState(() => new ChemistryCore());
  const { dataPoints, capture, clearData, exportCSV } = useDataStream({
    captureInterval: CAPTURE_INTERVAL,
    initialDataPoints: initialSnapshot?.dataPoints || [],
  });

  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(initialSnapshot?.time || 0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Drag state
  const [draggingChemical, setDraggingChemical] = useState<ChemicalItem | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Beaker state
  const [beaker, setBeaker] = useState<BeakerState>(() => initialSnapshot?.beaker || defaultBeakerState);

  // Reaction history
  const [reactionHistory, setReactionHistory] = useState<string[]>(() => initialSnapshot?.reactionHistory || []);

  // Beaker dimensions
  const beakerRect = { x: 300, y: 200, width: 200, height: 280 };

  useEffect(() => {
    chemistry.reset();

    if (!initialSnapshot?.beaker?.chemicals?.length) return;

    const restoredTemperature = initialSnapshot.beaker.temperature || 25;
    const rebuiltChemicals = initialSnapshot.beaker.chemicals.map((chemical: ChemicalItem) => ({
      ...chemical,
      id: chemistry.addChemical(chemical.formula, chemical.amount / 100, restoredTemperature),
    }));

    setBeaker((prev) => ({
      ...prev,
      ...initialSnapshot.beaker,
      chemicals: rebuiltChemicals,
    }));
  }, [chemistry, initialSnapshot]);

  useEffect(() => {
    onSnapshotChange?.({
      time,
      beaker,
      reactionHistory,
      dataPoints,
    });
  }, [onSnapshotChange, time, beaker, reactionHistory, dataPoints]);

  // Get pH color
  const getPHColor = (ph: number): string => {
    if (ph < 3) return '#ef4444'; // Strong acid - red
    if (ph < 5) return '#f97316'; // Weak acid - orange
    if (ph < 6) return '#eab308'; // Slight acid - yellow
    if (ph < 8) return '#22c55e'; // Neutral - green
    if (ph < 10) return '#06b6d4'; // Slight base - cyan
    if (ph < 12) return '#3b82f6'; // Weak base - blue
    return '#8b5cf6'; // Strong base - purple
  };

  // Handle adding chemical to beaker
  const addChemicalToBeaker = useCallback((formula: string, amount: number = 10) => {
    const chemData = AVAILABLE_CHEMICALS.find(c => c.formula === formula);
    if (!chemData) return;

    // Add to chemistry engine
    const id = chemistry.addChemical(formula, amount / 100, beaker.temperature);

    // Create chemical item
    const newChemical: ChemicalItem = {
      id,
      formula: chemData.formula,
      name: chemData.name,
      color: chemData.color,
      x: beakerRect.x + beakerRect.width / 2 + (Math.random() - 0.5) * 100,
      y: beakerRect.y + beakerRect.height - 50,
      amount,
      ph: chemData.ph,
    };

    setBeaker(prev => {
      const newChemicals = [...prev.chemicals, newChemical];
      const allIds = newChemicals.map(c => c.id);
      
      // Calculate new pH
      const newPH = chemistry.calculateMixturePH(allIds);
      const newTemp = chemistry.calculateAverageTemperature(allIds);
      const newVolume = prev.volume + amount;

      // Check for reactions between chemicals
      let reactionMsg = '';
      let bubbling = false;
      let glowing = false;

      // Try mixing the last two chemicals if there are at least 2
      if (newChemicals.length >= 2) {
        const lastTwo = newChemicals.slice(-2);
        const result = chemistry.mixChemicals(lastTwo[0].id, lastTwo[1].id);
        
        if (result.occurred) {
          reactionMsg = result.message || 'Reaction occurred!';
          setReactionHistory(h => [...h, reactionMsg]);
          
          if (result.animation === 'neutralization') {
            glowing = true;
          } else if (result.animation === 'bubbling') {
            bubbling = true;
          }
        }
      }

      return {
        ...prev,
        chemicals: newChemicals,
        ph: newPH,
        temperature: newTemp,
        volume: newVolume,
        mixedColor: getPHColor(newPH),
        reactionMessage: reactionMsg,
        bubbling,
        glowing,
      };
    });
  }, [chemistry, beaker.temperature]);

  // Drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let bubbleOffset = 0;
    let glowIntensity = 0;

    const drawLoop = () => {
      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw lab bench
      ctx.fillStyle = '#78716c';
      ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
      ctx.fillStyle = '#57534e';
      ctx.fillRect(0, canvas.height - 65, canvas.width, 5);

      // Draw available chemicals on the left side
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(20, 80, 150, 350);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 80, 150, 350);

      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('Chemicals', 55, 105);

      // Draw draggable chemical bottles
      AVAILABLE_CHEMICALS.forEach((chem, idx) => {
        const bottleX = 45;
        const bottleY = 130 + idx * 80;

        // Bottle shape
        ctx.fillStyle = chem.color;
        drawRoundRect(ctx, bottleX, bottleY, 50, 60, 5);
        ctx.fill();

        // Bottle neck
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(bottleX + 15, bottleY - 10, 20, 15);

        // Bottle cap
        ctx.fillStyle = '#374151';
        ctx.fillRect(bottleX + 12, bottleY - 15, 26, 8);

        // Label
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(chem.formula, bottleX + 8, bottleY + 35);

        // pH indicator
        ctx.font = '10px Arial';
        ctx.fillText(`pH ${chem.ph}`, bottleX + 10, bottleY + 50);
      });

      // Draw instruction text
      ctx.fillStyle = '#64748b';
      ctx.font = '12px Arial';
      ctx.fillText('Drag chemicals', 40, 455);
      ctx.fillText('to the beaker →', 40, 470);

      // Draw beaker with glow effect if reacting
      if (beaker.glowing) {
        glowIntensity = (glowIntensity + 0.05) % (Math.PI * 2);
        const glow = Math.abs(Math.sin(glowIntensity)) * 20 + 10;
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = glow;
      } else {
        ctx.shadowBlur = 0;
      }

      // Beaker outline
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(beakerRect.x, beakerRect.y);
      ctx.lineTo(beakerRect.x, beakerRect.y + beakerRect.height);
      ctx.lineTo(beakerRect.x + beakerRect.width, beakerRect.y + beakerRect.height);
      ctx.lineTo(beakerRect.x + beakerRect.width, beakerRect.y);
      ctx.stroke();

      // Beaker lip
      ctx.beginPath();
      ctx.moveTo(beakerRect.x - 10, beakerRect.y);
      ctx.lineTo(beakerRect.x + 20, beakerRect.y - 15);
      ctx.stroke();

      ctx.shadowBlur = 0;

      // Draw liquid in beaker
      if (beaker.volume > 0) {
        const liquidHeight = Math.min((beaker.volume / 200) * beakerRect.height, beakerRect.height - 10);
        const liquidY = beakerRect.y + beakerRect.height - liquidHeight;

        // Liquid gradient
        const liquidGradient = ctx.createLinearGradient(
          beakerRect.x, liquidY,
          beakerRect.x, beakerRect.y + beakerRect.height
        );
        liquidGradient.addColorStop(0, beaker.mixedColor + 'cc');
        liquidGradient.addColorStop(1, beaker.mixedColor);

        ctx.fillStyle = liquidGradient;
        ctx.fillRect(
          beakerRect.x + 3,
          liquidY,
          beakerRect.width - 6,
          liquidHeight
        );

        // Draw bubbles if bubbling
        if (beaker.bubbling || running) {
          bubbleOffset = (bubbleOffset + 2) % 50;
          for (let i = 0; i < 8; i++) {
            const bx = beakerRect.x + 20 + Math.random() * (beakerRect.width - 40);
            const by = liquidY + liquidHeight - 20 - (bubbleOffset + i * 15) % (liquidHeight - 30);
            const br = 3 + Math.random() * 4;

            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(bx, by, br, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Surface waves
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = beakerRect.x + 5; x < beakerRect.x + beakerRect.width - 5; x += 5) {
          const waveY = liquidY + Math.sin((x + Date.now() / 200) * 0.1) * 2;
          if (x === beakerRect.x + 5) {
            ctx.moveTo(x, waveY);
          } else {
            ctx.lineTo(x, waveY);
          }
        }
        ctx.stroke();
      }

      // Draw measurement lines on beaker
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.font = '10px Arial';
      ctx.fillStyle = '#64748b';
      for (let i = 1; i <= 4; i++) {
        const markY = beakerRect.y + beakerRect.height - (i * beakerRect.height / 5);
        ctx.beginPath();
        ctx.moveTo(beakerRect.x + beakerRect.width - 15, markY);
        ctx.lineTo(beakerRect.x + beakerRect.width - 5, markY);
        ctx.stroke();
        ctx.fillText(`${i * 50}ml`, beakerRect.x + beakerRect.width + 5, markY + 4);
      }

      // Draw pH meter display
      const meterX = 550;
      const meterY = 100;
      
      // Meter body
      ctx.fillStyle = '#1f2937';
      drawRoundRect(ctx, meterX, meterY, 180, 220, 10);
      ctx.fill();

      // Screen
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(meterX + 15, meterY + 15, 150, 80);

      // pH value
      ctx.fillStyle = getPHColor(beaker.ph);
      ctx.font = 'bold 36px monospace';
      ctx.fillText(`pH ${beaker.ph.toFixed(1)}`, meterX + 30, meterY + 65);

      // pH label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Arial';
      ctx.fillText('pH Meter', meterX + 60, meterY + 88);

      // Temperature display
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(meterX + 15, meterY + 105, 150, 40);
      ctx.fillStyle = '#f97316';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`${beaker.temperature.toFixed(1)}°C`, meterX + 40, meterY + 132);

      // Volume display
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(meterX + 15, meterY + 155, 150, 40);
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`${beaker.volume.toFixed(0)} mL`, meterX + 45, meterY + 182);

      // pH scale
      const scaleX = 550;
      const scaleY = 340;
      const scaleWidth = 180;
      const scaleHeight = 25;

      // pH gradient bar
      const phGradient = ctx.createLinearGradient(scaleX, scaleY, scaleX + scaleWidth, scaleY);
      phGradient.addColorStop(0, '#ef4444');
      phGradient.addColorStop(0.25, '#f97316');
      phGradient.addColorStop(0.4, '#eab308');
      phGradient.addColorStop(0.5, '#22c55e');
      phGradient.addColorStop(0.6, '#06b6d4');
      phGradient.addColorStop(0.75, '#3b82f6');
      phGradient.addColorStop(1, '#8b5cf6');

      ctx.fillStyle = phGradient;
      ctx.fillRect(scaleX, scaleY, scaleWidth, scaleHeight);

      // pH marker
      const markerX = scaleX + (beaker.ph / 14) * scaleWidth;
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.moveTo(markerX, scaleY - 8);
      ctx.lineTo(markerX - 6, scaleY);
      ctx.lineTo(markerX + 6, scaleY);
      ctx.closePath();
      ctx.fill();

      // Scale labels
      ctx.fillStyle = '#1f2937';
      ctx.font = '10px Arial';
      ctx.fillText('0', scaleX, scaleY + scaleHeight + 15);
      ctx.fillText('7', scaleX + scaleWidth / 2 - 3, scaleY + scaleHeight + 15);
      ctx.fillText('14', scaleX + scaleWidth - 10, scaleY + scaleHeight + 15);
      ctx.fillText('Acidic', scaleX + 10, scaleY + scaleHeight + 30);
      ctx.fillText('Neutral', scaleX + scaleWidth / 2 - 15, scaleY + scaleHeight + 30);
      ctx.fillText('Basic', scaleX + scaleWidth - 30, scaleY + scaleHeight + 30);

      // Draw reaction message
      if (beaker.reactionMessage) {
        ctx.fillStyle = '#059669';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(beaker.reactionMessage, beakerRect.x - 50, beakerRect.y - 30);
      }

      // Draw dragging chemical
      if (draggingChemical) {
        ctx.fillStyle = draggingChemical.color + 'cc';
        ctx.beginPath();
        ctx.arc(draggingChemical.x, draggingChemical.y, 25, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(draggingChemical.formula, draggingChemical.x - 12, draggingChemical.y + 4);
      }

      // Continue animation
      animationRef.current = requestAnimationFrame(drawLoop);
    };

    animationRef.current = requestAnimationFrame(drawLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [beaker, draggingChemical, running]);

  // Data capture when running
  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setTime(elapsed);

      capture({
        time: elapsed,
        ph: beaker.ph,
        temperature: beaker.temperature,
        volume: beaker.volume,
      });
    }, CAPTURE_INTERVAL);

    return () => clearInterval(interval);
  }, [running, beaker, capture]);

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Check if clicking on a chemical bottle
    AVAILABLE_CHEMICALS.forEach((chem, idx) => {
      const bottleX = 45;
      const bottleY = 130 + idx * 80;

      if (x >= bottleX && x <= bottleX + 50 && y >= bottleY && y <= bottleY + 60) {
        setDraggingChemical({
          id: `drag_${Date.now()}`,
          formula: chem.formula,
          name: chem.name,
          color: chem.color,
          x,
          y,
          amount: 25,
          ph: chem.ph,
        });
        setDragOffset({ x: x - bottleX - 25, y: y - bottleY - 30 });
      }
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggingChemical) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setDraggingChemical({
      ...draggingChemical,
      x: x - dragOffset.x,
      y: y - dragOffset.y,
    });
  };

  const handleMouseUp = () => {
    if (!draggingChemical) return;

    // Check if dropped in beaker
    const dx = draggingChemical.x;
    const dy = draggingChemical.y;

    if (
      dx >= beakerRect.x &&
      dx <= beakerRect.x + beakerRect.width &&
      dy >= beakerRect.y &&
      dy <= beakerRect.y + beakerRect.height
    ) {
      addChemicalToBeaker(draggingChemical.formula, draggingChemical.amount);
    }

    setDraggingChemical(null);
  };

  const handleStart = () => {
    startTimeRef.current = Date.now() - time * 1000;
    setRunning(true);
  };

  const handleStop = () => {
    setRunning(false);
  };

  const handleReset = () => {
    setRunning(false);
    setTime(0);
    chemistry.reset();
    clearData();
    setBeaker(defaultBeakerState);
    setReactionHistory([]);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Canvas */}
        <div className="lg:col-span-2">
          <Card>
            <h3 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
              <FlaskConical className="text-blue-500" size={24} />
              Acid-Base Neutralization Lab
            </h3>

            <div className="flex gap-2 mb-4">
              {!running ? (
                <button
                  onClick={handleStart}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition"
                >
                  <Play size={18} /> Start Recording
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
              <ExportBtn data={dataPoints} experimentName="acidbase" />
            </div>

            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="border-2 border-gray-200 rounded-lg w-full cursor-grab active:cursor-grabbing"
              style={{ maxWidth: '100%', height: 'auto' }}
            />

            <p className="text-sm text-gray-600 mt-3 text-center">
              🧪 Drag chemicals from the left panel and drop them into the beaker to mix
            </p>
          </Card>
        </div>

        {/* Controls Sidebar */}
        <div className="space-y-4">
          <Card>
            <h3 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
              <Beaker className="text-purple-500" size={20} />
              Beaker Status
            </h3>

            <div className="space-y-4">
              {/* pH Display */}
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">pH Level</span>
                  <span
                    className="text-2xl font-bold font-mono"
                    style={{ color: getPHColor(beaker.ph) }}
                  >
                    {beaker.ph.toFixed(2)}
                  </span>
                </div>
                <div className="h-3 rounded-full overflow-hidden bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-cyan-500 to-purple-500">
                  <div
                    className="h-full w-1 bg-white shadow-lg transition-all duration-300"
                    style={{ marginLeft: `${(beaker.ph / 14) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Acidic</span>
                  <span>Neutral</span>
                  <span>Basic</span>
                </div>
              </div>

              {/* Temperature */}
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2">
                  <Thermometer className="text-orange-500" size={20} />
                  <span className="text-gray-700">Temperature</span>
                </div>
                <span className="font-bold text-orange-600">{beaker.temperature.toFixed(1)}°C</span>
              </div>

              {/* Volume */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <Droplets className="text-blue-500" size={20} />
                  <span className="text-gray-700">Volume</span>
                </div>
                <span className="font-bold text-blue-600">{beaker.volume.toFixed(0)} mL</span>
              </div>

              {/* Time */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-gray-700">Elapsed Time</span>
                <span className="font-mono font-bold">{time.toFixed(1)}s</span>
              </div>
            </div>
          </Card>

          {/* Theory Card */}
          <Card>
            <h3 className="font-bold text-lg mb-3 text-gray-900">📐 Theory</h3>
            <div className="space-y-2 text-sm">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="font-semibold text-gray-900 mb-1">Neutralization Reaction</div>
                <div className="font-mono text-blue-800">
                  HCl + NaOH → NaCl + H₂O
                </div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <div className="font-semibold text-gray-900 mb-1">pH Scale</div>
                <ul className="text-gray-700 space-y-1">
                  <li>• pH &lt; 7: Acidic</li>
                  <li>• pH = 7: Neutral</li>
                  <li>• pH &gt; 7: Basic</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Reaction History */}
          {reactionHistory.length > 0 && (
            <Card>
              <h3 className="font-bold text-sm text-gray-900 mb-3">🧪 Reaction Log</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {reactionHistory.map((msg, idx) => (
                  <div key={idx} className="text-xs text-gray-700 p-2 bg-green-50 rounded border border-green-200">
                    {msg}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Statistics */}
          {dataPoints.length > 0 && (
            <Card>
              <h3 className="font-bold text-sm text-gray-900 mb-3">📊 Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Data Points:</span>
                  <span className="font-semibold">{dataPoints.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Initial pH:</span>
                  <span className="font-semibold">{dataPoints[0]?.ph?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Final pH:</span>
                  <span className="font-semibold">{dataPoints[dataPoints.length - 1]?.ph?.toFixed(2) || 'N/A'}</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveChart
          data={dataPoints}
          config={{
            xKey: 'time',
            yKey: 'ph',
            xLabel: 'Time (s)',
            yLabel: 'pH',
            title: '📈 pH vs Time',
            color: '#8b5cf6',
          }}
        />
        <LiveChart
          data={dataPoints}
          config={{
            xKey: 'time',
            yKey: 'temperature',
            xLabel: 'Time (s)',
            yLabel: 'Temperature (°C)',
            title: '🌡️ Temperature vs Time',
            color: '#f97316',
          }}
        />
      </div>
    </div>
  );
}
