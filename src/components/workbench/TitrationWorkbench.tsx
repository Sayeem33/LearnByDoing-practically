'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChemistryCore } from '@/engine/ChemistryCore';
import { useDataStream } from '@/hooks/useDataStream';
import LiveChart from '@/components/analysis/LiveChart';
import ExportBtn from '@/components/analysis/ExportBtn';
import Card from '@/components/ui/Card';
import { Play, Pause, RotateCcw, Droplets, FlaskConical, TestTube, Target } from 'lucide-react';
import { WorkbenchPersistenceProps } from '@/components/workbench/persistence';

// Helper function to draw rounded rectangle
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

// Titration state
interface TitrationState {
  acidVolume: number; // mL of acid in flask
  acidConcentration: number; // mol/L
  baseVolume: number; // mL of base added
  baseConcentration: number; // mol/L
  ph: number;
  indicatorColor: string;
  temperature: number;
  equivalenceReached: boolean;
  drops: { x: number; y: number; speed: number }[];
}

// Indicator types
const INDICATORS = [
  { name: 'Phenolphthalein', acidColor: 'transparent', baseColor: '#ec4899', transitionPH: 8.2 },
  { name: 'Methyl Orange', acidColor: '#ef4444', baseColor: '#eab308', transitionPH: 4.0 },
  { name: 'Bromothymol Blue', acidColor: '#eab308', baseColor: '#3b82f6', transitionPH: 7.0 },
];

const CAPTURE_INTERVAL = 50; // Reduce to 50ms for better responsiveness

export default function TitrationWorkbench({
  initialSnapshot,
  onSnapshotChange,
}: WorkbenchPersistenceProps<any>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [chemistry] = useState(() => new ChemistryCore());
  const { dataPoints, capture, clearData, startCapture, stopCapture } = useDataStream({
    captureInterval: CAPTURE_INTERVAL,
    initialDataPoints: initialSnapshot?.dataPoints || [],
  });

  const [running, setRunning] = useState(false);
  const [autoTitrate, setAutoTitrate] = useState(initialSnapshot?.autoTitrate || false);
  const [time, setTime] = useState(initialSnapshot?.time || 0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Selected indicator
  const [selectedIndicator, setSelectedIndicator] = useState(initialSnapshot?.selectedIndicator || 0);

  // Titration parameters
  const [titration, setTitration] = useState<TitrationState>(() => initialSnapshot?.titration || {
    acidVolume: 25, // 25 mL HCl
    acidConcentration: 0.1, // 0.1 M
    baseVolume: 0, // Start with 0 mL NaOH added
    baseConcentration: 0.1, // 0.1 M NaOH
    ph: 1,
    indicatorColor: 'transparent',
    temperature: 25,
    equivalenceReached: false,
    drops: [],
  });

  // Burette state
  const [buretteOpen, setBuretteOpen] = useState(initialSnapshot?.buretteOpen || false);
  const [dropRate, setDropRate] = useState(initialSnapshot?.dropRate || 1); // drops per click or per interval

  useEffect(() => {
    onSnapshotChange?.({
      autoTitrate,
      time,
      selectedIndicator,
      titration,
      buretteOpen,
      dropRate,
      dataPoints,
    });
  }, [onSnapshotChange, autoTitrate, time, selectedIndicator, titration, buretteOpen, dropRate, dataPoints]);

  // Calculate pH based on titration progress
  const calculatePH = useCallback((acidVol: number, acidConc: number, baseVol: number, baseConc: number): number => {
    const molesAcid = (acidVol / 1000) * acidConc;
    const molesBase = (baseVol / 1000) * baseConc;
    const totalVolume = (acidVol + baseVol) / 1000; // in L

    if (totalVolume === 0) return 7;

    const excessMoles = molesAcid - molesBase;

    if (Math.abs(excessMoles) < 0.0001) {
      // At equivalence point
      return 7;
    } else if (excessMoles > 0) {
      // Excess acid
      const hConc = excessMoles / totalVolume;
      return Math.max(0, -Math.log10(hConc));
    } else {
      // Excess base
      const ohConc = -excessMoles / totalVolume;
      const pOH = Math.max(0, -Math.log10(ohConc));
      return Math.min(14, 14 - pOH);
    }
  }, []);

  // Get indicator color based on pH
  const getIndicatorColor = useCallback((ph: number, indicatorIdx: number): string => {
    const indicator = INDICATORS[indicatorIdx];
    if (ph < indicator.transitionPH - 1) {
      return indicator.acidColor;
    } else if (ph > indicator.transitionPH + 1) {
      return indicator.baseColor;
    } else {
      // Transition zone - blend colors
      const ratio = (ph - (indicator.transitionPH - 1)) / 2;
      return indicator.baseColor; // Simplified - show base color in transition
    }
  }, []);

  // Add a drop of base
  const addDrop = useCallback(() => {
    const dropVolume = 0.05; // 0.05 mL per drop

    setTitration(prev => {
      const newBaseVolume = prev.baseVolume + dropVolume;
      const newPH = calculatePH(prev.acidVolume, prev.acidConcentration, newBaseVolume, prev.baseConcentration);
      const newColor = getIndicatorColor(newPH, selectedIndicator);
      
      // Check if equivalence point reached
      const molesAcid = (prev.acidVolume / 1000) * prev.acidConcentration;
      const molesBase = (newBaseVolume / 1000) * prev.baseConcentration;
      const equivalenceReached = Math.abs(molesAcid - molesBase) < 0.0001;

      // Add visual drop
      const newDrop = {
        x: 400 + (Math.random() - 0.5) * 10,
        y: 180,
        speed: 2 + Math.random() * 2,
      };

      return {
        ...prev,
        baseVolume: newBaseVolume,
        ph: newPH,
        indicatorColor: newColor,
        equivalenceReached,
        drops: [...prev.drops, newDrop],
      };
    });
  }, [calculatePH, getIndicatorColor, selectedIndicator]);

  // Drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawLoop = () => {
      // Clear canvas
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw lab bench
      ctx.fillStyle = '#78716c';
      ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
      ctx.fillStyle = '#57534e';
      ctx.fillRect(0, canvas.height - 55, canvas.width, 5);

      // Draw stand/clamp
      ctx.fillStyle = '#374151';
      ctx.fillRect(380, 50, 10, 350);
      ctx.fillRect(350, 45, 70, 10);
      
      // Clamp for burette
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(385, 60, 30, 15);
      ctx.fillRect(385, 160, 30, 15);

      // Draw burette (with NaOH)
      const buretteX = 390;
      const buretteY = 70;
      const buretteWidth = 20;
      const buretteHeight = 120;
      const maxBuretteVolume = 50; // mL
      const remainingBase = maxBuretteVolume - titration.baseVolume;
      const liquidHeight = (remainingBase / maxBuretteVolume) * (buretteHeight - 10);

      // Burette glass
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.strokeRect(buretteX, buretteY, buretteWidth, buretteHeight);

      // Burette liquid (NaOH - blue)
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(buretteX + 2, buretteY + buretteHeight - liquidHeight - 8, buretteWidth - 4, liquidHeight);

      // Burette tip/stopcock
      ctx.fillStyle = '#374151';
      ctx.fillRect(buretteX + 7, buretteY + buretteHeight, 6, 20);
      
      // Stopcock handle
      ctx.fillStyle = buretteOpen ? '#22c55e' : '#ef4444';
      drawRoundRect(ctx, buretteX - 8, buretteY + buretteHeight + 5, 15, 10, 2);
      ctx.fill();
      drawRoundRect(ctx, buretteX + buretteWidth - 7, buretteY + buretteHeight + 5, 15, 10, 2);
      ctx.fill();

      // Burette markings
      ctx.fillStyle = '#64748b';
      ctx.font = '9px Arial';
      for (let i = 0; i <= 5; i++) {
        const markY = buretteY + 5 + (i * (buretteHeight - 10) / 5);
        ctx.fillRect(buretteX + buretteWidth - 5, markY, 5, 1);
        ctx.fillText(`${i * 10}`, buretteX + buretteWidth + 3, markY + 3);
      }

      // Burette label
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 10px Arial';
      ctx.fillText('NaOH', buretteX - 2, buretteY - 5);
      ctx.font = '9px Arial';
      ctx.fillText(`${titration.baseConcentration}M`, buretteX, buretteY - 15);

      // Draw drops falling
      setTitration(prev => {
        const updatedDrops = prev.drops
          .map(drop => ({ ...drop, y: drop.y + drop.speed }))
          .filter(drop => drop.y < 320); // Remove drops that reached flask

        return { ...prev, drops: updatedDrops };
      });

      // Draw falling drops
      ctx.fillStyle = '#3b82f6';
      titration.drops.forEach(drop => {
        ctx.beginPath();
        ctx.ellipse(drop.x, drop.y, 3, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Erlenmeyer flask
      const flaskX = 340;
      const flaskY = 280;
      const flaskWidth = 120;
      const flaskHeight = 140;

      // Flask body (triangular shape)
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(flaskX + flaskWidth / 2 - 15, flaskY); // Neck left
      ctx.lineTo(flaskX + flaskWidth / 2 + 15, flaskY); // Neck right
      ctx.lineTo(flaskX + flaskWidth, flaskY + flaskHeight - 20); // Bottom right
      ctx.lineTo(flaskX, flaskY + flaskHeight - 20); // Bottom left
      ctx.closePath();
      ctx.stroke();

      // Flask neck
      ctx.strokeRect(flaskX + flaskWidth / 2 - 15, flaskY - 30, 30, 35);

      // Flask liquid
      const liquidLevel = Math.min(0.7, (titration.acidVolume + titration.baseVolume) / 100);
      const liquidY = flaskY + flaskHeight - 25 - (liquidLevel * (flaskHeight - 40));
      
      // Determine liquid color based on indicator
      let liquidColor = titration.indicatorColor;
      if (liquidColor === 'transparent') {
        liquidColor = 'rgba(200, 200, 200, 0.3)'; // Slightly visible when no color
      }

      ctx.fillStyle = liquidColor;
      ctx.beginPath();
      const liquidWidthRatio = 1 - (liquidY - flaskY) / flaskHeight;
      const liquidWidth = flaskWidth * liquidWidthRatio * 0.9;
      const liquidX = flaskX + (flaskWidth - liquidWidth) / 2;
      ctx.moveTo(liquidX, liquidY);
      ctx.lineTo(liquidX + liquidWidth, liquidY);
      ctx.lineTo(flaskX + flaskWidth - 5, flaskY + flaskHeight - 25);
      ctx.lineTo(flaskX + 5, flaskY + flaskHeight - 25);
      ctx.closePath();
      ctx.fill();

      // Draw swirl lines in liquid
      if (titration.baseVolume > 0) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        const swirlOffset = Date.now() / 500;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          const startX = flaskX + 30 + i * 20;
          const startY = liquidY + 20 + Math.sin(swirlOffset + i) * 5;
          ctx.arc(startX, startY, 10 + i * 5, 0, Math.PI, false);
          ctx.stroke();
        }
      }

      // Flask label
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 11px Arial';
      ctx.fillText('HCl (aq)', flaskX + 35, flaskY + flaskHeight + 15);
      ctx.font = '9px Arial';
      ctx.fillText(`${titration.acidVolume}mL × ${titration.acidConcentration}M`, flaskX + 25, flaskY + flaskHeight + 28);

      // Draw pH meter on the right
      const meterX = 550;
      const meterY = 80;

      ctx.fillStyle = '#1f2937';
      drawRoundRect(ctx, meterX, meterY, 180, 280, 10);
      ctx.fill();

      // Screen
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(meterX + 15, meterY + 15, 150, 70);

      // pH value
      const phColor = titration.ph < 7 ? '#ef4444' : titration.ph > 7 ? '#3b82f6' : '#22c55e';
      ctx.fillStyle = phColor;
      ctx.font = 'bold 32px monospace';
      ctx.fillText(`pH ${titration.ph.toFixed(2)}`, meterX + 25, meterY + 58);

      // Volume added display
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(meterX + 15, meterY + 95, 150, 45);
      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(`Vol: ${titration.baseVolume.toFixed(2)} mL`, meterX + 25, meterY + 125);

      // Equivalence indicator
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(meterX + 15, meterY + 150, 150, 45);
      if (titration.equivalenceReached) {
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('✓ EQUIVALENCE', meterX + 30, meterY + 175);
        ctx.fillText('   POINT!', meterX + 45, meterY + 190);
      } else {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px Arial';
        ctx.fillText('Waiting for', meterX + 45, meterY + 172);
        ctx.fillText('equivalence...', meterX + 40, meterY + 187);
      }

      // Indicator selection display
      ctx.fillStyle = '#374151';
      ctx.fillRect(meterX + 15, meterY + 205, 150, 60);
      ctx.fillStyle = '#e5e7eb';
      ctx.font = '10px Arial';
      ctx.fillText('Indicator:', meterX + 20, meterY + 220);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px Arial';
      ctx.fillText(INDICATORS[selectedIndicator].name, meterX + 20, meterY + 238);
      
      // Indicator color preview
      const indicatorPreviewColor = INDICATORS[selectedIndicator].baseColor;
      ctx.fillStyle = indicatorPreviewColor === 'transparent' ? '#f8fafc' : indicatorPreviewColor;
      ctx.fillRect(meterX + 130, meterY + 225, 25, 25);
      ctx.strokeStyle = '#64748b';
      ctx.strokeRect(meterX + 130, meterY + 225, 25, 25);

      // pH scale at bottom
      const scaleX = 550;
      const scaleY = 380;
      const scaleWidth = 180;
      const scaleHeight = 20;

      const phGradient = ctx.createLinearGradient(scaleX, scaleY, scaleX + scaleWidth, scaleY);
      phGradient.addColorStop(0, '#ef4444');
      phGradient.addColorStop(0.35, '#eab308');
      phGradient.addColorStop(0.5, '#22c55e');
      phGradient.addColorStop(0.65, '#06b6d4');
      phGradient.addColorStop(1, '#8b5cf6');

      ctx.fillStyle = phGradient;
      ctx.fillRect(scaleX, scaleY, scaleWidth, scaleHeight);

      // pH marker
      const markerX = scaleX + (titration.ph / 14) * scaleWidth;
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.moveTo(markerX, scaleY - 5);
      ctx.lineTo(markerX - 5, scaleY);
      ctx.lineTo(markerX + 5, scaleY);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#1f2937';
      ctx.font = '9px Arial';
      ctx.fillText('0', scaleX, scaleY + scaleHeight + 12);
      ctx.fillText('7', scaleX + scaleWidth / 2 - 3, scaleY + scaleHeight + 12);
      ctx.fillText('14', scaleX + scaleWidth - 10, scaleY + scaleHeight + 12);

      // Instructions panel
      ctx.fillStyle = '#f1f5f9';
      drawRoundRect(ctx, 20, 80, 150, 200, 8);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.stroke();

      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 12px Arial';
      ctx.fillText('Instructions', 55, 105);

      ctx.font = '10px Arial';
      ctx.fillStyle = '#64748b';
      const instructions = [
        '1. Click "Add Drop"',
        '   to add NaOH',
        '',
        '2. Watch pH change',
        '',
        '3. Find equivalence',
        '   point (pH = 7)',
        '',
        '4. Or use "Auto"',
        '   for continuous',
      ];
      instructions.forEach((line, i) => {
        ctx.fillText(line, 30, 125 + i * 14);
      });

      // Continue animation
      animationRef.current = requestAnimationFrame(drawLoop);
    };

    animationRef.current = requestAnimationFrame(drawLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [titration, selectedIndicator]);

  // Auto-titration effect
  useEffect(() => {
    if (!autoTitrate || titration.equivalenceReached) return;

    const interval = setInterval(() => {
      addDrop();
    }, 200);

    return () => clearInterval(interval);
  }, [autoTitrate, titration.equivalenceReached, addDrop]);

  // Data capture when running - capture on volume change
  const lastCapturedVolume = useRef<number>(-1);
  
  useEffect(() => {
    if (!running) return;

    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    setTime(elapsed);

    // Only capture if volume has changed (new drop added)
    if (titration.baseVolume !== lastCapturedVolume.current) {
      lastCapturedVolume.current = titration.baseVolume;
      
      // Directly add to dataPoints to avoid throttling issues
      capture({
        time: parseFloat(elapsed.toFixed(2)),
        volumeAdded: parseFloat(titration.baseVolume.toFixed(3)),
        ph: parseFloat(titration.ph.toFixed(2)),
        temperature: titration.temperature,
      });
    }
  }, [running, titration.baseVolume, titration.ph, capture]);

  const handleStart = () => {
    startTimeRef.current = Date.now() - time * 1000;
    setRunning(true);
    startCapture();
    // Capture initial data point
    capture({
      time: parseFloat(time.toFixed(2)),
      volumeAdded: titration.baseVolume,
      ph: titration.ph,
      temperature: titration.temperature,
    });
  };

  const handleStop = () => {
    setRunning(false);
    setAutoTitrate(false);
    stopCapture();
  };

  const handleReset = () => {
    setRunning(false);
    setAutoTitrate(false);
    setTime(0);
    clearData();
    lastCapturedVolume.current = -1; // Reset the capture tracker
    setTitration({
      acidVolume: 25,
      acidConcentration: 0.1,
      baseVolume: 0,
      baseConcentration: 0.1,
      ph: 1,
      indicatorColor: getIndicatorColor(1, selectedIndicator),
      temperature: 25,
      equivalenceReached: false,
      drops: [],
    });
  };

  // Calculate expected equivalence volume
  const expectedEquivalenceVolume = 
    (titration.acidVolume * titration.acidConcentration) / titration.baseConcentration;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Canvas */}
        <div className="lg:col-span-2">
          <Card>
            <h3 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
              <TestTube className="text-purple-500" size={24} />
              Acid-Base Titration
            </h3>

            <div className="flex flex-wrap gap-2 mb-4">
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
                onClick={addDrop}
                disabled={titration.baseVolume >= 50}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition"
              >
                <Droplets size={18} /> Add Drop
              </button>

              <button
                onClick={() => setAutoTitrate(!autoTitrate)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                  autoTitrate 
                    ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                }`}
              >
                {autoTitrate ? 'Stop Auto' : 'Auto Titrate'}
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition"
              >
                <RotateCcw size={18} /> Reset
              </button>

              <ExportBtn data={dataPoints} experimentName="titration" />
            </div>

            <canvas
              ref={canvasRef}
              width={800}
              height={450}
              className="border-2 border-gray-200 rounded-lg w-full"
              style={{ maxWidth: '100%', height: 'auto' }}
            />

            <p className="text-sm text-gray-600 mt-3 text-center">
              🧪 Click "Add Drop" to add NaOH drop by drop, or "Auto Titrate" for continuous addition
            </p>
          </Card>
        </div>

        {/* Controls Sidebar */}
        <div className="space-y-4">
          {/* Status Card */}
          <Card>
            <h3 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
              <Target className="text-green-500" size={20} />
              Titration Status
            </h3>

            <div className="space-y-3">
              {/* pH Display */}
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Current pH</span>
                  <span
                    className="text-3xl font-bold font-mono"
                    style={{ color: titration.ph < 7 ? '#ef4444' : titration.ph > 7 ? '#3b82f6' : '#22c55e' }}
                  >
                    {titration.ph.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Volume Added */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <Droplets className="text-blue-500" size={20} />
                  <span className="text-gray-700">NaOH Added</span>
                </div>
                <span className="font-bold text-blue-600">{titration.baseVolume.toFixed(2)} mL</span>
              </div>

              {/* Equivalence Status */}
              <div className={`p-3 rounded-lg border ${
                titration.equivalenceReached 
                  ? 'bg-green-50 border-green-300' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Equivalence Point</span>
                  {titration.equivalenceReached ? (
                    <span className="font-bold text-green-600">✓ Reached!</span>
                  ) : (
                    <span className="text-gray-500">Pending...</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Expected at ~{expectedEquivalenceVolume.toFixed(1)} mL
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-gray-700">Elapsed Time</span>
                <span className="font-mono font-bold">{time.toFixed(1)}s</span>
              </div>
            </div>
          </Card>

          {/* Indicator Selection */}
          <Card>
            <h3 className="font-bold text-sm text-gray-900 mb-3">🎨 Select Indicator</h3>
            <div className="space-y-2">
              {INDICATORS.map((indicator, idx) => (
                <button
                  key={indicator.name}
                  onClick={() => {
                    setSelectedIndicator(idx);
                    setTitration(prev => ({
                      ...prev,
                      indicatorColor: getIndicatorColor(prev.ph, idx),
                    }));
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg border transition ${
                    selectedIndicator === idx
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-sm font-medium">{indicator.name}</span>
                  <div className="flex gap-1">
                    <div
                      className="w-5 h-5 rounded border"
                      style={{ backgroundColor: indicator.acidColor === 'transparent' ? '#f8fafc' : indicator.acidColor }}
                    />
                    <span className="text-gray-400">→</span>
                    <div
                      className="w-5 h-5 rounded border"
                      style={{ backgroundColor: indicator.baseColor }}
                    />
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Transition pH: {INDICATORS[selectedIndicator].transitionPH}
            </p>
          </Card>

          {/* Theory Card */}
          <Card>
            <h3 className="font-bold text-sm text-gray-900 mb-3">📐 Calculations</h3>
            <div className="space-y-2 text-sm">
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <div className="font-semibold text-gray-900 mb-1">At Equivalence Point</div>
                <div className="font-mono text-purple-800 text-xs">
                  n(acid) = n(base)<br />
                  M₁V₁ = M₂V₂
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="font-semibold text-gray-900 mb-1">Given Values</div>
                <div className="text-gray-700 text-xs space-y-1">
                  <div>HCl: {titration.acidVolume} mL × {titration.acidConcentration} M</div>
                  <div>NaOH: {titration.baseConcentration} M</div>
                  <div className="font-semibold text-purple-700">
                    V(NaOH) at eq. = {expectedEquivalenceVolume.toFixed(1)} mL
                  </div>
                </div>
              </div>
            </div>
          </Card>

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
                  <span className="text-gray-600">Current pH:</span>
                  <span className="font-semibold">{titration.ph.toFixed(2)}</span>
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
            xKey: 'volumeAdded',
            yKey: 'ph',
            xLabel: 'Volume NaOH Added (mL)',
            yLabel: 'pH',
            title: '📈 Titration Curve (pH vs Volume)',
            color: '#8b5cf6',
          }}
        />
        <LiveChart
          data={dataPoints}
          config={{
            xKey: 'time',
            yKey: 'ph',
            xLabel: 'Time (s)',
            yLabel: 'pH',
            title: '📈 pH vs Time',
            color: '#3b82f6',
          }}
        />
      </div>
    </div>
  );
}
