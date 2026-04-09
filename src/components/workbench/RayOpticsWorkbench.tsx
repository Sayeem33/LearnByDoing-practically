'use client';

import React, { useEffect, useRef, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Slider from '@/components/ui/Slider';
import LiveChart from '@/components/analysis/LiveChart';
import ExportBtn from '@/components/analysis/ExportBtn';
import { Play, Pause, RotateCcw, Lightbulb } from 'lucide-react';
import { useDataStream } from '@/hooks/useDataStream';
import { WorkbenchPersistenceProps } from '@/components/workbench/persistence';

const CANVAS_WIDTH = 860;
const CANVAS_HEIGHT = 420;
const CENTER_X = CANVAS_WIDTH / 2;
const CENTER_Y = CANVAS_HEIGHT / 2;

function toRadians(angle: number) {
  return (angle * Math.PI) / 180;
}

function toDegrees(angle: number) {
  return (angle * 180) / Math.PI;
}

function getOpticsValues(incidentAngle: number, refractiveIndex: number) {
  const reflectedAngle = incidentAngle;
  const refractedAngle = toDegrees(
    Math.asin(Math.min(1, Math.sin(toRadians(incidentAngle)) / refractiveIndex))
  );

  return {
    reflectedAngle,
    refractedAngle,
  };
}

export default function RayOpticsWorkbench({
  initialSnapshot,
  onSnapshotChange,
}: WorkbenchPersistenceProps<any>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { dataPoints, capture, clearData, startCapture, stopCapture } = useDataStream({
    captureInterval: 140,
    initialDataPoints: initialSnapshot?.dataPoints || [],
  });

  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(initialSnapshot?.time ?? 0);
  const [incidentAngle, setIncidentAngle] = useState(initialSnapshot?.incidentAngle ?? 45);
  const [refractiveIndex, setRefractiveIndex] = useState(initialSnapshot?.refractiveIndex ?? 1.5);
  const [pulseOffset, setPulseOffset] = useState(initialSnapshot?.pulseOffset ?? 0);
  const [reflectedAngle, setReflectedAngle] = useState(initialSnapshot?.reflectedAngle ?? 45);
  const [refractedAngle, setRefractedAngle] = useState(initialSnapshot?.refractedAngle ?? 28);

  useEffect(() => {
    const values = getOpticsValues(incidentAngle, refractiveIndex);
    setReflectedAngle(values.reflectedAngle);
    setRefractedAngle(values.refractedAngle);
  }, [incidentAngle, refractiveIndex]);

  useEffect(() => {
    if (!running) {
      return;
    }

    const interval = window.setInterval(() => {
      setTime((prev: number) => Number((prev + 0.14).toFixed(2)));
      setPulseOffset((prev: number) => (prev + 16) % 180);
    }, 140);

    return () => window.clearInterval(interval);
  }, [running]);

  useEffect(() => {
    if (!running) {
      return;
    }

    capture({
      time,
      incidentAngle: Number(incidentAngle.toFixed(2)),
      reflectedAngle: Number(reflectedAngle.toFixed(2)),
      refractedAngle: Number(refractedAngle.toFixed(2)),
    });
  }, [running, time, incidentAngle, reflectedAngle, refractedAngle, capture]);

  useEffect(() => {
    onSnapshotChange?.({
      time,
      incidentAngle,
      refractiveIndex,
      reflectedAngle,
      refractedAngle,
      pulseOffset,
      dataPoints,
    });
  }, [
    onSnapshotChange,
    time,
    incidentAngle,
    refractiveIndex,
    reflectedAngle,
    refractedAngle,
    pulseOffset,
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
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CENTER_Y);
    ctx.fillStyle = '#dbeafe';
    ctx.fillRect(0, CENTER_Y, CANVAS_WIDTH, CENTER_Y);

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, CENTER_Y);
    ctx.lineTo(CANVAS_WIDTH, CENTER_Y);
    ctx.stroke();
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(CENTER_X, 40);
    ctx.lineTo(CENTER_X, CANVAS_HEIGHT - 40);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Ray Optics Boundary', 30, 38);
    ctx.font = '13px Arial';
    ctx.fillStyle = '#475569';
    ctx.fillText(`n₁ = 1.00 (air), n₂ = ${refractiveIndex.toFixed(2)}`, 30, 62);
    ctx.fillText(`Incident: ${incidentAngle.toFixed(1)}°`, 30, 82);

    const incidentLength = 180;
    const reflectedLength = 160;
    const refractedLength = 180;
    const incidentRad = toRadians(incidentAngle);
    const refractedRad = toRadians(refractedAngle);

    const incidentStartX = CENTER_X - incidentLength * Math.sin(incidentRad);
    const incidentStartY = CENTER_Y - incidentLength * Math.cos(incidentRad);
    const reflectedEndX = CENTER_X + reflectedLength * Math.sin(incidentRad);
    const reflectedEndY = CENTER_Y - reflectedLength * Math.cos(incidentRad);
    const refractedEndX = CENTER_X + refractedLength * Math.sin(refractedRad);
    const refractedEndY = CENTER_Y + refractedLength * Math.cos(refractedRad);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(incidentStartX, incidentStartY);
    ctx.lineTo(CENTER_X, CENTER_Y);
    ctx.stroke();

    ctx.strokeStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(CENTER_X, CENTER_Y);
    ctx.lineTo(reflectedEndX, reflectedEndY);
    ctx.stroke();

    ctx.strokeStyle = '#2563eb';
    ctx.beginPath();
    ctx.moveTo(CENTER_X, CENTER_Y);
    ctx.lineTo(refractedEndX, refractedEndY);
    ctx.stroke();

    const pulseRatio = pulseOffset / 180;
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(
      incidentStartX + (CENTER_X - incidentStartX) * pulseRatio,
      incidentStartY + (CENTER_Y - incidentStartY) * pulseRatio,
      8,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(
      CENTER_X + (reflectedEndX - CENTER_X) * pulseRatio,
      CENTER_Y + (reflectedEndY - CENTER_Y) * pulseRatio,
      7,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(
      CENTER_X + (refractedEndX - CENTER_X) * pulseRatio,
      CENTER_Y + (refractedEndY - CENTER_Y) * pulseRatio,
      7,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = '12px Arial';
    ctx.fillText('Incident', incidentStartX - 10, incidentStartY - 10);
    ctx.fillText('Reflected', reflectedEndX - 20, reflectedEndY - 10);
    ctx.fillText('Refracted', refractedEndX + 10, refractedEndY + 4);
  }, [incidentAngle, refractiveIndex, refractedAngle, pulseOffset]);

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
    setPulseOffset(0);
    clearData();
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="lg:w-80 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Ray Optics</h2>
              <p className="text-sm text-gray-600 mt-1">
                Compare reflection and refraction as light crosses from air into another medium.
              </p>
            </div>

            <Slider
              label="Incident Angle"
              min={5}
              max={80}
              step={1}
              unit=" °"
              value={incidentAngle}
              onChange={(e) => setIncidentAngle(Number(e.target.value))}
            />
            <Slider
              label="Lower Medium Refractive Index"
              min={1}
              max={2}
              step={0.05}
              value={refractiveIndex}
              onChange={(e) => setRefractiveIndex(Number(e.target.value))}
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
              className="w-full rounded-2xl border border-cyan-100 shadow-sm"
            />

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-amber-50 border-amber-100">
                <div className="flex items-center gap-3">
                  <Lightbulb className="text-amber-500" size={20} />
                  <div>
                    <div className="text-sm text-gray-600">Incident Angle</div>
                    <div className="text-xl font-bold text-gray-900">{incidentAngle.toFixed(1)}°</div>
                  </div>
                </div>
              </Card>
              <Card className="bg-red-50 border-red-100">
                <div className="text-sm text-gray-600">Reflected Angle</div>
                <div className="text-xl font-bold text-gray-900">{reflectedAngle.toFixed(1)}°</div>
              </Card>
              <Card className="bg-blue-50 border-blue-100">
                <div className="text-sm text-gray-600">Refracted Angle</div>
                <div className="text-xl font-bold text-gray-900">{refractedAngle.toFixed(1)}°</div>
              </Card>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <LiveChart
          data={dataPoints}
          config={{
            title: 'Reflected Angle vs Time',
            xKey: 'time',
            yKey: 'reflectedAngle',
            xLabel: 'Time (s)',
            yLabel: 'Reflected Angle (°)',
            color: '#ef4444',
          }}
        />
        <LiveChart
          data={dataPoints}
          config={{
            title: 'Refracted Angle vs Time',
            xKey: 'time',
            yKey: 'refractedAngle',
            xLabel: 'Time (s)',
            yLabel: 'Refracted Angle (°)',
            color: '#2563eb',
          }}
        />
      </div>

      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Measurements</h3>
            <p className="text-sm text-gray-600">Export the angle readings to include them in validation and reports.</p>
          </div>
          <ExportBtn data={dataPoints} experimentName="rayoptics" />
        </div>
      </Card>
    </div>
  );
}
