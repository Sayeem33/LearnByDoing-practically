'use client';

import { useEffect, useRef, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Slider from '@/components/ui/Slider';
import LiveChart from '@/components/analysis/LiveChart';
import ExportBtn from '@/components/analysis/ExportBtn';
import { Circle, PlusCircle, RotateCcw } from 'lucide-react';
import { useDataStream } from '@/hooks/useDataStream';
import { WorkbenchPersistenceProps } from '@/components/workbench/persistence';

const CANVAS_WIDTH = 860;
const CANVAS_HEIGHT = 420;

export default function CircleTheoremsWorkbench({
  initialSnapshot,
  onSnapshotChange,
}: WorkbenchPersistenceProps<any>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { dataPoints, capture, clearData } = useDataStream({
    initialDataPoints: initialSnapshot?.dataPoints || [],
    captureInterval: 0,
  });

  const [circleCentralAngle, setCircleCentralAngle] = useState(initialSnapshot?.circleCentralAngle || 80);
  const [sample, setSample] = useState(initialSnapshot?.sample || 0);

  const centralAngle = circleCentralAngle;
  const inscribedAngle = circleCentralAngle / 2;

  useEffect(() => {
    onSnapshotChange?.({
      circleCentralAngle,
      centralAngle,
      inscribedAngle,
      sample,
      dataPoints,
    });
  }, [onSnapshotChange, circleCentralAngle, centralAngle, inscribedAngle, sample, dataPoints]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#fefce8');
    gradient.addColorStop(1, '#eff6ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const centerX = 270;
    const centerY = 220;
    const radius = 120;
    const halfAngle = (centralAngle / 2) * (Math.PI / 180);
    const pointA = { x: centerX + radius * Math.cos(-Math.PI / 2 - halfAngle), y: centerY + radius * Math.sin(-Math.PI / 2 - halfAngle) };
    const pointB = { x: centerX + radius * Math.cos(-Math.PI / 2 + halfAngle), y: centerY + radius * Math.sin(-Math.PI / 2 + halfAngle) };
    const pointC = { x: centerX + radius * Math.cos(Math.PI / 3), y: centerY + radius * Math.sin(Math.PI / 3) };

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Circle Theorem Visualization', 24, 36);

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(pointA.x, pointA.y);
    ctx.lineTo(pointB.x, pointB.y);
    ctx.closePath();
    ctx.strokeStyle = '#2563eb';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(pointC.x, pointC.y);
    ctx.lineTo(pointA.x, pointA.y);
    ctx.lineTo(pointB.x, pointB.y);
    ctx.strokeStyle = '#059669';
    ctx.stroke();

    [pointA, pointB, pointC, { x: centerX, y: centerY }].forEach((point) => {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`Central angle = ${centralAngle.toFixed(1)}°`, 520, 120);
    ctx.fillText(`Inscribed angle = ${inscribedAngle.toFixed(1)}°`, 520, 160);
    ctx.fillText('The theorem says the first is exactly double the second.', 520, 200);
  }, [centralAngle, inscribedAngle]);

  const recordSample = () => {
    const nextSample = sample + 1;
    setSample(nextSample);
    capture({
      time: nextSample,
      sample: nextSample,
      centralAngle: Number(centralAngle.toFixed(2)),
      inscribedAngle: Number(inscribedAngle.toFixed(2)),
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Circle Theorems</h2>
            <p className="text-sm text-gray-600">Compare a central angle with the angle standing on the same arc.</p>
            <Slider label="Central Angle" min={20} max={160} step={2} unit=" °" value={circleCentralAngle} onChange={(e) => setCircleCentralAngle(Number(e.target.value))} />
            <div className="flex flex-wrap gap-2">
              <Button onClick={recordSample} leftIcon={<PlusCircle size={16} />}>Record Sample</Button>
              <Button variant="ghost" onClick={() => { clearData(); setSample(0); }} leftIcon={<RotateCcw size={16} />}>Reset Samples</Button>
            </div>
            <div className="grid gap-3">
              <Card className="bg-blue-50 border-blue-100"><p className="text-sm text-gray-500">Central Angle</p><p className="text-2xl font-bold text-gray-900">{centralAngle.toFixed(1)}°</p></Card>
              <Card className="bg-emerald-50 border-emerald-100"><p className="text-sm text-gray-500">Inscribed Angle</p><p className="text-2xl font-bold text-gray-900">{inscribedAngle.toFixed(1)}°</p></Card>
            </div>
          </div>
          <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full rounded-2xl border border-slate-200" />
        </div>
      </Card>

      <LiveChart data={dataPoints} config={{ title: 'Central vs Inscribed Angle', xKey: 'centralAngle', yKey: 'inscribedAngle', xLabel: 'Central Angle (°)', yLabel: 'Inscribed Angle (°)', color: '#2563eb' }} />

      <Card>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Circle className="text-blue-600" size={18} />
            <div>
              <h3 className="font-semibold text-gray-900">Export Geometry Samples</h3>
              <p className="text-sm text-gray-600">Save angle pairs for reports, evidence, and review.</p>
            </div>
          </div>
          <ExportBtn data={dataPoints} experimentName="circletheorems" />
        </div>
      </Card>
    </div>
  );
}
