'use client';

import React, { useEffect, useRef, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Slider from '@/components/ui/Slider';
import LiveChart from '@/components/analysis/LiveChart';
import ExportBtn from '@/components/analysis/ExportBtn';
import { Play, Pause, RotateCcw, Waves } from 'lucide-react';
import { useDataStream } from '@/hooks/useDataStream';
import { WorkbenchPersistenceProps } from '@/components/workbench/persistence';

const CANVAS_WIDTH = 860;
const CANVAS_HEIGHT = 420;
const SOURCE_X = 170;
const SCREEN_X = 700;
const CENTER_Y = CANVAS_HEIGHT / 2;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getWaveValues(
  waveLength: number,
  sourceSeparation: number,
  observationOffset: number
) {
  const sourceTopY = CENTER_Y - sourceSeparation / 2;
  const sourceBottomY = CENTER_Y + sourceSeparation / 2;
  const probeY = CENTER_Y + observationOffset;
  const distanceA = Math.hypot(SCREEN_X - SOURCE_X, probeY - sourceTopY);
  const distanceB = Math.hypot(SCREEN_X - SOURCE_X, probeY - sourceBottomY);
  const pathDifference = distanceB - distanceA;
  const phaseDifference = (2 * Math.PI * pathDifference) / waveLength;
  const intensity = (1 + Math.cos(phaseDifference)) / 2;

  return {
    sourceTopY,
    sourceBottomY,
    probeY,
    pathDifference,
    phaseDifference,
    intensity,
  };
}

export default function WaveInterferenceWorkbench({
  initialSnapshot,
  onSnapshotChange,
}: WorkbenchPersistenceProps<any>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { dataPoints, capture, clearData, startCapture, stopCapture } = useDataStream({
    captureInterval: 100,
    initialDataPoints: initialSnapshot?.dataPoints || [],
  });

  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(initialSnapshot?.time ?? 0);
  const [waveAmplitude, setWaveAmplitude] = useState(initialSnapshot?.waveAmplitude ?? 30);
  const [waveFrequency, setWaveFrequency] = useState(initialSnapshot?.waveFrequency ?? 1.5);
  const [waveLength, setWaveLength] = useState(initialSnapshot?.waveLength ?? 120);
  const [sourceSeparation, setSourceSeparation] = useState(initialSnapshot?.sourceSeparation ?? 120);
  const [observationOffset, setObservationOffset] = useState(initialSnapshot?.observationOffset ?? 0);
  const [pathDifference, setPathDifference] = useState(initialSnapshot?.pathDifference ?? 0);
  const [phaseDifference, setPhaseDifference] = useState(initialSnapshot?.phaseDifference ?? 0);
  const [intensity, setIntensity] = useState(initialSnapshot?.intensity ?? 0);

  useEffect(() => {
    const values = getWaveValues(waveLength, sourceSeparation, observationOffset);
    setPathDifference(values.pathDifference);
    setPhaseDifference(values.phaseDifference);
    setIntensity(values.intensity);
  }, [waveLength, sourceSeparation, observationOffset]);

  useEffect(() => {
    if (!running) {
      return;
    }

    const interval = window.setInterval(() => {
      setTime((prev: number) => {
        const next = Number((prev + 0.1).toFixed(2));
        setObservationOffset(clamp(Math.sin(next * 0.8) * 120, -120, 120));
        return next;
      });
    }, 100);

    return () => window.clearInterval(interval);
  }, [running]);

  useEffect(() => {
    if (!running) {
      return;
    }

    capture({
      time,
      intensity: Number(intensity.toFixed(4)),
      pathDifference: Number(pathDifference.toFixed(3)),
      phaseDifference: Number(phaseDifference.toFixed(3)),
    });
  }, [running, time, intensity, pathDifference, phaseDifference, capture]);

  useEffect(() => {
    onSnapshotChange?.({
      time,
      waveAmplitude,
      waveFrequency,
      waveLength,
      sourceSeparation,
      observationOffset,
      pathDifference,
      phaseDifference,
      intensity,
      dataPoints,
    });
  }, [
    onSnapshotChange,
    time,
    waveAmplitude,
    waveFrequency,
    waveLength,
    sourceSeparation,
    observationOffset,
    pathDifference,
    phaseDifference,
    intensity,
    dataPoints,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const values = getWaveValues(waveLength, sourceSeparation, observationOffset);
    const phase = time * waveFrequency * Math.PI * 2;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const bg = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    bg.addColorStop(0, '#eef2ff');
    bg.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Wave Interference Screen', 36, 38);
    ctx.font = '13px Arial';
    ctx.fillStyle = '#475569';
    ctx.fillText(`Phase difference: ${phaseDifference.toFixed(2)} rad`, 36, 62);
    ctx.fillText(`Relative intensity: ${intensity.toFixed(2)}`, 36, 82);

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(SCREEN_X, 40);
    ctx.lineTo(SCREEN_X, CANVAS_HEIGHT - 40);
    ctx.stroke();

    ctx.fillStyle = '#1d4ed8';
    ctx.beginPath();
    ctx.arc(SOURCE_X, values.sourceTopY, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(SOURCE_X, values.sourceBottomY, 12, 0, Math.PI * 2);
    ctx.fill();

    for (let ring = 1; ring <= 5; ring += 1) {
      const radius = ring * waveLength * 0.35 + (phase % waveLength);
      ctx.strokeStyle = `rgba(59, 130, 246, ${0.25 - ring * 0.03})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(SOURCE_X, values.sourceTopY, radius, -0.7, 0.7);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(SOURCE_X, values.sourceBottomY, radius, -0.7, 0.7);
      ctx.stroke();
    }

    ctx.fillStyle = `rgba(250, 204, 21, ${0.3 + intensity * 0.6})`;
    ctx.fillRect(SCREEN_X - 10, values.probeY - 20, 20, 40);

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(SOURCE_X, values.sourceTopY);
    ctx.lineTo(SCREEN_X, values.probeY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(SOURCE_X, values.sourceBottomY);
    ctx.lineTo(SCREEN_X, values.probeY);
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = '12px Arial';
    ctx.fillText('S1', SOURCE_X - 26, values.sourceTopY + 4);
    ctx.fillText('S2', SOURCE_X - 26, values.sourceBottomY + 4);
    ctx.fillText('Probe', SCREEN_X + 18, values.probeY + 4);

    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 240; x <= 620; x += 4) {
      const localX = x - 240;
      const y =
        CENTER_Y +
        Math.sin((localX / waveLength) * Math.PI * 2 + phase) * waveAmplitude * 0.35 +
        Math.sin((localX / waveLength) * Math.PI * 2 + phase + phaseDifference) *
          waveAmplitude *
          0.35;
      if (x === 240) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }, [time, waveAmplitude, waveFrequency, waveLength, sourceSeparation, observationOffset, phaseDifference, intensity]);

  const handleStart = () => {
    startCapture();
    setRunning(true);
  };

  const handlePause = () => {
    stopCapture();
    setRunning(false);
  };

  const handleReset = () => {
    stopCapture();
    setRunning(false);
    setTime(0);
    setObservationOffset(0);
    clearData();
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="lg:w-80 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Wave Interference</h2>
              <p className="text-sm text-gray-600 mt-1">
                Two coherent sources create bright and dark regions on the observation screen.
              </p>
            </div>

            <Slider
              label="Amplitude"
              min={10}
              max={50}
              step={1}
              unit=" px"
              value={waveAmplitude}
              onChange={(e) => setWaveAmplitude(Number(e.target.value))}
            />
            <Slider
              label="Frequency"
              min={0.5}
              max={4}
              step={0.1}
              unit=" Hz"
              value={waveFrequency}
              onChange={(e) => setWaveFrequency(Number(e.target.value))}
            />
            <Slider
              label="Wavelength"
              min={60}
              max={180}
              step={5}
              unit=" px"
              value={waveLength}
              onChange={(e) => setWaveLength(Number(e.target.value))}
            />
            <Slider
              label="Source Separation"
              min={60}
              max={220}
              step={10}
              unit=" px"
              value={sourceSeparation}
              onChange={(e) => setSourceSeparation(Number(e.target.value))}
            />

            <div className="flex flex-wrap gap-2">
              <Button onClick={handleStart} disabled={running} leftIcon={<Play size={16} />}>
                Start
              </Button>
              <Button variant="outline" onClick={handlePause} disabled={!running} leftIcon={<Pause size={16} />}>
                Pause
              </Button>
              <Button variant="ghost" onClick={handleReset} leftIcon={<RotateCcw size={16} />}>
                Reset
              </Button>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="w-full rounded-2xl border border-indigo-100 shadow-sm"
            />

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-indigo-50 border-indigo-100">
                <div className="flex items-center gap-3">
                  <Waves className="text-indigo-500" size={20} />
                  <div>
                    <div className="text-sm text-gray-600">Intensity</div>
                    <div className="text-xl font-bold text-gray-900">{intensity.toFixed(2)}</div>
                  </div>
                </div>
              </Card>
              <Card className="bg-blue-50 border-blue-100">
                <div className="text-sm text-gray-600">Path Difference</div>
                <div className="text-xl font-bold text-gray-900">{pathDifference.toFixed(2)} px</div>
              </Card>
              <Card className="bg-slate-50 border-slate-200">
                <div className="text-sm text-gray-600">Phase Difference</div>
                <div className="text-xl font-bold text-gray-900">{phaseDifference.toFixed(2)} rad</div>
              </Card>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <LiveChart
          data={dataPoints}
          config={{
            title: 'Intensity vs Time',
            xKey: 'time',
            yKey: 'intensity',
            xLabel: 'Time (s)',
            yLabel: 'Intensity',
            color: '#8b5cf6',
          }}
        />
        <LiveChart
          data={dataPoints}
          config={{
            title: 'Path Difference vs Time',
            xKey: 'time',
            yKey: 'pathDifference',
            xLabel: 'Time (s)',
            yLabel: 'Path Difference',
            color: '#0ea5e9',
          }}
        />
      </div>

      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Measurements</h3>
            <p className="text-sm text-gray-600">The captured path and intensity values are available for export and reports.</p>
          </div>
          <ExportBtn data={dataPoints} experimentName="waveinterference" />
        </div>
      </Card>
    </div>
  );
}
