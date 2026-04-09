'use client';

import React, { useEffect, useRef, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Slider from '@/components/ui/Slider';
import LiveChart from '@/components/analysis/LiveChart';
import ExportBtn from '@/components/analysis/ExportBtn';
import { Play, Pause, RotateCcw, Magnet } from 'lucide-react';
import { useDataStream } from '@/hooks/useDataStream';
import { WorkbenchPersistenceProps } from '@/components/workbench/persistence';

const CANVAS_WIDTH = 860;
const CANVAS_HEIGHT = 420;
const CENTER_X = CANVAS_WIDTH / 2;
const CENTER_Y = CANVAS_HEIGHT / 2 + 10;
const FIELD_SCALE = 15000;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function getElectricField(
  chargeStrength: number,
  chargeSeparation: number,
  probeX: number
) {
  const k = 8.99;
  const leftX = -chargeSeparation / 2;
  const rightX = chargeSeparation / 2;
  const probeDistanceFromLeft = probeX - leftX;
  const probeDistanceFromRight = probeX - rightX;
  const safeLeft = Math.sign(probeDistanceFromLeft || 1) * Math.max(Math.abs(probeDistanceFromLeft), 10);
  const safeRight =
    Math.sign(probeDistanceFromRight || 1) * Math.max(Math.abs(probeDistanceFromRight), 10);
  const leftDistance = Math.max(Math.abs(probeDistanceFromLeft), 10);
  const rightDistance = Math.max(Math.abs(probeDistanceFromRight), 10);

  const leftField = (k * chargeStrength) / (safeLeft * safeLeft);
  const rightField = (k * chargeStrength) / (safeRight * safeRight);
  const fieldStrength = leftField + rightField;
  const potential = (k * chargeStrength) / leftDistance - (k * chargeStrength) / rightDistance;

  return {
    fieldStrength,
    potential,
    leftX,
    rightX,
  };
}

export default function ElectricFieldsWorkbench({
  initialSnapshot,
  onSnapshotChange,
}: WorkbenchPersistenceProps<any>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const directionRef = useRef(initialSnapshot?.sweepDirection || 1);
  const { dataPoints, capture, clearData, startCapture, stopCapture } = useDataStream({
    captureInterval: 100,
    initialDataPoints: initialSnapshot?.dataPoints || [],
  });

  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(initialSnapshot?.time ?? 0);
  const [chargeStrength, setChargeStrength] = useState(initialSnapshot?.chargeStrength ?? 5);
  const [chargeSeparation, setChargeSeparation] = useState(initialSnapshot?.chargeSeparation ?? 160);
  const [probeDistance, setProbeDistance] = useState(initialSnapshot?.probeDistance ?? 120);
  const [probeX, setProbeX] = useState(initialSnapshot?.probeX ?? 0);
  const [fieldStrength, setFieldStrength] = useState(initialSnapshot?.fieldStrength ?? 0);
  const [potential, setPotential] = useState(initialSnapshot?.potential ?? 0);

  useEffect(() => {
    const result = getElectricField(chargeStrength, chargeSeparation, probeX);
    setFieldStrength(result.fieldStrength);
    setPotential(result.potential);
  }, [chargeStrength, chargeSeparation, probeX]);

  useEffect(() => {
    if (!running) {
      return;
    }

    const interval = window.setInterval(() => {
      setTime((prev: number) => Number((prev + 0.1).toFixed(2)));
      setProbeX((prev: number) => {
        const next = prev + directionRef.current * 8;
        if (next >= probeDistance || next <= -probeDistance) {
          directionRef.current *= -1;
          return clamp(next, -probeDistance, probeDistance);
        }

        return next;
      });
    }, 100);

    return () => window.clearInterval(interval);
  }, [running, probeDistance]);

  useEffect(() => {
    if (!running) {
      return;
    }

    capture({
      time,
      probeX: Number(probeX.toFixed(2)),
      fieldStrength: Number(fieldStrength.toFixed(4)),
      potential: Number(potential.toFixed(4)),
    });
  }, [running, time, probeX, fieldStrength, potential, capture]);

  useEffect(() => {
    onSnapshotChange?.({
      time,
      chargeStrength,
      chargeSeparation,
      probeDistance,
      probeX,
      fieldStrength,
      potential,
      sweepDirection: directionRef.current,
      dataPoints,
    });
  }, [
    onSnapshotChange,
    time,
    chargeStrength,
    chargeSeparation,
    probeDistance,
    probeX,
    fieldStrength,
    potential,
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

    const { leftX, rightX } = getElectricField(chargeStrength, chargeSeparation, probeX);

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bg.addColorStop(0, '#eff6ff');
    bg.addColorStop(1, '#dbeafe');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 40; x < CANVAS_WIDTH; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 40; y < CANVAS_HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    drawRoundRect(ctx, 20, 20, 230, 90, 16);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fill();
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Electric Field Map', 40, 50);
    ctx.font = '13px Arial';
    ctx.fillStyle = '#334155';
    ctx.fillText(`Field: ${fieldStrength.toFixed(3)}`, 40, 76);
    ctx.fillText(`Potential: ${potential.toFixed(3)}`, 40, 96);

    ctx.strokeStyle = '#94a3b8';
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(CENTER_X, 120);
    ctx.lineTo(CENTER_X, 360);
    ctx.stroke();
    ctx.setLineDash([]);

    const leftChargeX = CENTER_X + leftX;
    const rightChargeX = CENTER_X + rightX;
    const probeCanvasX = CENTER_X + probeX;

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(leftChargeX, CENTER_Y, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.fillText('+', leftChargeX - 8, CENTER_Y + 10);

    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(rightChargeX, CENTER_Y, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText('-', rightChargeX - 6, CENTER_Y + 10);

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(probeCanvasX, CENTER_Y - 90, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('Probe', probeCanvasX - 16, CENTER_Y - 110);

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(probeCanvasX, CENTER_Y - 78);
    ctx.lineTo(probeCanvasX, CENTER_Y - 12);
    ctx.stroke();

    const arrowLength = clamp(fieldStrength * FIELD_SCALE, 30, 120);
    ctx.strokeStyle = '#16a34a';
    ctx.fillStyle = '#16a34a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(probeCanvasX, CENTER_Y - 90);
    ctx.lineTo(probeCanvasX + arrowLength, CENTER_Y - 90);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(probeCanvasX + arrowLength, CENTER_Y - 90);
    ctx.lineTo(probeCanvasX + arrowLength - 12, CENTER_Y - 98);
    ctx.lineTo(probeCanvasX + arrowLength - 12, CENTER_Y - 82);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#475569';
    ctx.font = '12px Arial';
    ctx.fillText('Positive charge', leftChargeX - 34, CENTER_Y + 55);
    ctx.fillText('Negative charge', rightChargeX - 38, CENTER_Y + 55);
    ctx.fillText(`Probe x = ${probeX.toFixed(0)} px`, probeCanvasX - 40, CENTER_Y - 130);
  }, [chargeStrength, chargeSeparation, probeX, fieldStrength, potential]);

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
    directionRef.current = 1;
    setTime(0);
    setProbeX(0);
    clearData();
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="lg:w-80 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Electric Fields</h2>
              <p className="text-sm text-gray-600 mt-1">
                Sweep a probe through a dipole-like field and compare the readings with theory.
              </p>
            </div>

            <Slider
              label="Charge Strength"
              min={1}
              max={10}
              step={0.5}
              unit=" uC"
              value={chargeStrength}
              onChange={(e) => setChargeStrength(Number(e.target.value))}
            />
            <Slider
              label="Charge Separation"
              min={80}
              max={260}
              step={10}
              unit=" px"
              value={chargeSeparation}
              onChange={(e) => setChargeSeparation(Number(e.target.value))}
            />
            <Slider
              label="Probe Sweep Distance"
              min={60}
              max={220}
              step={10}
              unit=" px"
              value={probeDistance}
              onChange={(e) => {
                const value = Number(e.target.value);
                setProbeDistance(value);
                setProbeX((prev: number) => clamp(prev, -value, value));
              }}
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
              className="w-full rounded-2xl border border-blue-100 shadow-sm"
            />

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-red-50 border-red-100">
                <div className="flex items-center gap-3">
                  <Magnet className="text-red-500" size={20} />
                  <div>
                    <div className="text-sm text-gray-600">Field Strength</div>
                    <div className="text-xl font-bold text-gray-900">{fieldStrength.toFixed(3)}</div>
                  </div>
                </div>
              </Card>
              <Card className="bg-blue-50 border-blue-100">
                <div className="text-sm text-gray-600">Potential</div>
                <div className="text-xl font-bold text-gray-900">{potential.toFixed(3)}</div>
              </Card>
              <Card className="bg-slate-50 border-slate-200">
                <div className="text-sm text-gray-600">Probe Position</div>
                <div className="text-xl font-bold text-gray-900">{probeX.toFixed(0)} px</div>
              </Card>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <LiveChart
          data={dataPoints}
          config={{
            title: 'Field Strength vs Time',
            xKey: 'time',
            yKey: 'fieldStrength',
            xLabel: 'Time (s)',
            yLabel: 'Field Strength',
            color: '#ef4444',
          }}
        />
        <LiveChart
          data={dataPoints}
          config={{
            title: 'Field Strength vs Probe Position',
            xKey: 'probeX',
            yKey: 'fieldStrength',
            xLabel: 'Probe Position',
            yLabel: 'Field Strength',
            color: '#2563eb',
          }}
        />
      </div>

      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Measurements</h3>
            <p className="text-sm text-gray-600">Export the captured probe readings for reports and evidence.</p>
          </div>
          <ExportBtn data={dataPoints} experimentName="electricfields" />
        </div>
      </Card>
    </div>
  );
}
