'use client';

import React, { useEffect, useRef, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Slider from '@/components/ui/Slider';
import LiveChart from '@/components/analysis/LiveChart';
import ExportBtn from '@/components/analysis/ExportBtn';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useDataStream } from '@/hooks/useDataStream';
import { WorkbenchPersistenceProps } from '@/components/workbench/persistence';

const CANVAS_WIDTH = 860;
const CANVAS_HEIGHT = 420;

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

function getCircuitValues(
  voltage: number,
  resistanceA: number,
  resistanceB: number,
  mode: 'series' | 'parallel'
) {
  const totalResistance =
    mode === 'series'
      ? resistanceA + resistanceB
      : 1 / (1 / resistanceA + 1 / resistanceB);
  const current = voltage / totalResistance;
  const currentA = mode === 'series' ? current : voltage / resistanceA;
  const currentB = mode === 'series' ? current : voltage / resistanceB;
  const voltageDropA = mode === 'series' ? current * resistanceA : voltage;
  const voltageDropB = mode === 'series' ? current * resistanceB : voltage;
  const power = voltage * current;

  return {
    totalResistance,
    current,
    currentA,
    currentB,
    voltageDropA,
    voltageDropB,
    power,
  };
}

export default function SimpleCircuitsWorkbench({
  initialSnapshot,
  onSnapshotChange,
}: WorkbenchPersistenceProps<any>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { dataPoints, capture, clearData, startCapture, stopCapture } = useDataStream({
    captureInterval: 120,
    initialDataPoints: initialSnapshot?.dataPoints || [],
  });

  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(initialSnapshot?.time ?? 0);
  const [voltage, setVoltage] = useState(initialSnapshot?.voltage ?? 12);
  const [resistanceA, setResistanceA] = useState(initialSnapshot?.circuitResistanceA ?? 4);
  const [resistanceB, setResistanceB] = useState(initialSnapshot?.circuitResistanceB ?? 6);
  const [mode, setMode] = useState<'series' | 'parallel'>(initialSnapshot?.circuitMode ?? 'series');
  const [flowOffset, setFlowOffset] = useState(initialSnapshot?.flowOffset ?? 0);
  const [current, setCurrent] = useState(initialSnapshot?.current ?? 0);
  const [currentA, setCurrentA] = useState(initialSnapshot?.currentA ?? 0);
  const [currentB, setCurrentB] = useState(initialSnapshot?.currentB ?? 0);
  const [totalResistance, setTotalResistance] = useState(initialSnapshot?.totalResistance ?? 0);
  const [power, setPower] = useState(initialSnapshot?.power ?? 0);
  const [voltageDropA, setVoltageDropA] = useState(initialSnapshot?.voltageDropA ?? 0);
  const [voltageDropB, setVoltageDropB] = useState(initialSnapshot?.voltageDropB ?? 0);

  useEffect(() => {
    const values = getCircuitValues(voltage, resistanceA, resistanceB, mode);
    setTotalResistance(values.totalResistance);
    setCurrent(values.current);
    setCurrentA(values.currentA);
    setCurrentB(values.currentB);
    setVoltageDropA(values.voltageDropA);
    setVoltageDropB(values.voltageDropB);
    setPower(values.power);
  }, [voltage, resistanceA, resistanceB, mode]);

  useEffect(() => {
    if (!running) {
      return;
    }

    const interval = window.setInterval(() => {
      setTime((prev: number) => Number((prev + 0.12).toFixed(2)));
      setFlowOffset((prev: number) => (prev + current * 12) % 260);
    }, 120);

    return () => window.clearInterval(interval);
  }, [running, current]);

  useEffect(() => {
    if (!running) {
      return;
    }

    capture({
      time,
      current: Number(current.toFixed(4)),
      totalResistance: Number(totalResistance.toFixed(3)),
      power: Number(power.toFixed(3)),
      voltageDropA: Number(voltageDropA.toFixed(3)),
      voltageDropB: Number(voltageDropB.toFixed(3)),
    });
  }, [running, time, current, totalResistance, power, voltageDropA, voltageDropB, capture]);

  useEffect(() => {
    onSnapshotChange?.({
      time,
      voltage,
      circuitResistanceA: resistanceA,
      circuitResistanceB: resistanceB,
      circuitMode: mode,
      totalResistance,
      current,
      currentA,
      currentB,
      power,
      voltageDropA,
      voltageDropB,
      flowOffset,
      dataPoints,
    });
  }, [
    onSnapshotChange,
    time,
    voltage,
    resistanceA,
    resistanceB,
    mode,
    totalResistance,
    current,
    currentA,
    currentB,
    power,
    voltageDropA,
    voltageDropB,
    flowOffset,
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

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bg.addColorStop(0, '#f8fafc');
    bg.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    drawRoundRect(ctx, 24, 24, 260, 92, 16);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Circuit Overview', 44, 54);
    ctx.font = '13px Arial';
    ctx.fillStyle = '#334155';
    ctx.fillText(`Mode: ${mode}`, 44, 78);
    ctx.fillText(`Current: ${current.toFixed(3)} A`, 44, 98);

    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(130, 170);
    ctx.lineTo(130, 320);
    ctx.lineTo(730, 320);
    ctx.lineTo(730, 110);
    ctx.lineTo(210, 110);
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    drawRoundRect(ctx, 70, 190, 60, 110, 8);
    ctx.fill();
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`${voltage}V`, 84, 250);

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    drawRoundRect(ctx, 260, 90, 120, 40, 12);
    ctx.fill();
    ctx.stroke();
    drawRoundRect(ctx, mode === 'series' ? 500 : 260, mode === 'series' ? 90 : 220, 120, 40, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`R₁ = ${resistanceA} Ω`, 288, 115);
    if (mode === 'series') {
      ctx.fillText(`R₂ = ${resistanceB} Ω`, 528, 115);
    } else {
      ctx.fillText(`R₂ = ${resistanceB} Ω`, 288, 245);
      ctx.beginPath();
      ctx.moveTo(440, 110);
      ctx.lineTo(440, 260);
      ctx.lineTo(260, 260);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(380, 110);
      ctx.lineTo(560, 110);
      ctx.lineTo(560, 260);
      ctx.lineTo(380, 260);
      ctx.stroke();
    }

    if (running) {
      ctx.fillStyle = '#22c55e';
      for (let i = 0; i < 4; i += 1) {
        const x = 200 + ((flowOffset + i * 60) % 520);
        const y = mode === 'series' || i % 2 === 0 ? 110 : 260;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = '#475569';
    ctx.font = '13px Arial';
    ctx.fillText(`Equivalent Resistance: ${totalResistance.toFixed(2)} Ω`, 520, 360);
    ctx.fillText(`Voltage Drops: ${voltageDropA.toFixed(2)} V / ${voltageDropB.toFixed(2)} V`, 520, 382);
  }, [voltage, resistanceA, resistanceB, mode, flowOffset, current, totalResistance, voltageDropA, voltageDropB, running]);

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
    setFlowOffset(0);
    clearData();
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="lg:w-80 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Simple Circuits</h2>
              <p className="text-sm text-gray-600 mt-1">
                Compare series and parallel resistor combinations using Ohm’s law.
              </p>
            </div>

            <Slider
              label="Supply Voltage"
              min={1}
              max={24}
              step={1}
              unit=" V"
              value={voltage}
              onChange={(e) => setVoltage(Number(e.target.value))}
            />
            <Slider
              label="Resistor A"
              min={1}
              max={20}
              step={1}
              unit=" Ω"
              value={resistanceA}
              onChange={(e) => setResistanceA(Number(e.target.value))}
            />
            <Slider
              label="Resistor B"
              min={1}
              max={20}
              step={1}
              unit=" Ω"
              value={resistanceB}
              onChange={(e) => setResistanceB(Number(e.target.value))}
            />

            <div>
              <label className="text-sm font-medium text-gray-700">Circuit Mode</label>
              <div className="mt-2 flex gap-2">
                <Button
                  variant={mode === 'series' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setMode('series')}
                >
                  Series
                </Button>
                <Button
                  variant={mode === 'parallel' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setMode('parallel')}
                >
                  Parallel
                </Button>
              </div>
            </div>

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
              className="w-full rounded-2xl border border-slate-200 shadow-sm"
            />

            <div className="grid gap-4 md:grid-cols-4">
              <Card className="bg-amber-50 border-amber-100">
                <div className="text-sm text-gray-600">Current</div>
                <div className="text-xl font-bold text-gray-900">{current.toFixed(3)} A</div>
              </Card>
              <Card className="bg-blue-50 border-blue-100">
                <div className="text-sm text-gray-600">Equivalent R</div>
                <div className="text-xl font-bold text-gray-900">{totalResistance.toFixed(2)} Ω</div>
              </Card>
              <Card className="bg-green-50 border-green-100">
                <div className="text-sm text-gray-600">Power</div>
                <div className="text-xl font-bold text-gray-900">{power.toFixed(2)} W</div>
              </Card>
              <Card className="bg-slate-50 border-slate-200">
                <div className="text-sm text-gray-600">Branch Currents</div>
                <div className="text-base font-bold text-gray-900">
                  {currentA.toFixed(2)} A / {currentB.toFixed(2)} A
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <LiveChart
          data={dataPoints}
          config={{
            title: 'Current vs Time',
            xKey: 'time',
            yKey: 'current',
            xLabel: 'Time (s)',
            yLabel: 'Current (A)',
            color: '#f59e0b',
          }}
        />
        <LiveChart
          data={dataPoints}
          config={{
            title: 'Power vs Time',
            xKey: 'time',
            yKey: 'power',
            xLabel: 'Time (s)',
            yLabel: 'Power (W)',
            color: '#22c55e',
          }}
        />
      </div>

      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Measurements</h3>
            <p className="text-sm text-gray-600">Use the captured values in validation, reports, and evidence exports.</p>
          </div>
          <ExportBtn data={dataPoints} experimentName="simplecircuits" />
        </div>
      </Card>
    </div>
  );
}
