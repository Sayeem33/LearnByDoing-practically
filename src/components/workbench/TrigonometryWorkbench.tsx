'use client';

import { useEffect, useRef, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Slider from '@/components/ui/Slider';
import LiveChart from '@/components/analysis/LiveChart';
import ExportBtn from '@/components/analysis/ExportBtn';
import { Compass, PlusCircle, RotateCcw } from 'lucide-react';
import { useDataStream } from '@/hooks/useDataStream';
import { WorkbenchPersistenceProps } from '@/components/workbench/persistence';

const CANVAS_WIDTH = 860;
const CANVAS_HEIGHT = 420;

export default function TrigonometryWorkbench({
  initialSnapshot,
  onSnapshotChange,
}: WorkbenchPersistenceProps<any>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { dataPoints, capture, clearData } = useDataStream({
    initialDataPoints: initialSnapshot?.dataPoints || [],
    captureInterval: 0,
  });

  const [trigAngle, setTrigAngle] = useState(initialSnapshot?.trigAngle || 35);
  const [sample, setSample] = useState(initialSnapshot?.sample || 0);

  const radians = (trigAngle * Math.PI) / 180;
  const hypotenuse = 10;
  const adjacent = hypotenuse * Math.cos(radians);
  const opposite = hypotenuse * Math.sin(radians);
  const sinValue = opposite / hypotenuse;
  const cosValue = adjacent / hypotenuse;
  const tanValue = opposite / adjacent;

  useEffect(() => {
    onSnapshotChange?.({
      trigAngle,
      adjacent,
      opposite,
      hypotenuse,
      sinValue,
      cosValue,
      tanValue,
      sample,
      dataPoints,
    });
  }, [onSnapshotChange, trigAngle, adjacent, opposite, hypotenuse, sinValue, cosValue, tanValue, sample, dataPoints]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#f0fdf4');
    gradient.addColorStop(1, '#eff6ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const originX = 130;
    const originY = 320;
    const scale = 22;
    const basePx = adjacent * scale;
    const heightPx = opposite * scale;

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Trigonometric Ratio Visualization', 24, 36);

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX + basePx, originY);
    ctx.lineTo(originX + basePx, originY - heightPx);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = '#2563eb';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`adjacent = ${adjacent.toFixed(2)}`, originX + basePx / 2 - 30, originY + 24);
    ctx.fillText(`opposite = ${opposite.toFixed(2)}`, originX + basePx + 18, originY - heightPx / 2);
    ctx.fillText(`hypotenuse = ${hypotenuse.toFixed(2)}`, originX + basePx / 2 - 8, originY - heightPx / 2 - 12);
    ctx.fillStyle = '#059669';
    ctx.fillText(`θ = ${trigAngle}°`, originX + 26, originY - 10);

    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`sin θ = ${sinValue.toFixed(3)}`, 520, 110);
    ctx.fillText(`cos θ = ${cosValue.toFixed(3)}`, 520, 150);
    ctx.fillText(`tan θ = ${tanValue.toFixed(3)}`, 520, 190);
  }, [trigAngle, adjacent, opposite, hypotenuse, sinValue, cosValue, tanValue]);

  const recordSample = () => {
    const nextSample = sample + 1;
    setSample(nextSample);
    capture({
      time: nextSample,
      sample: nextSample,
      angle: trigAngle,
      sinValue: Number(sinValue.toFixed(4)),
      cosValue: Number(cosValue.toFixed(4)),
      tanValue: Number(tanValue.toFixed(4)),
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Trigonometric Ratios</h2>
            <p className="text-sm text-gray-600">Move the angle and see how sine, cosine, and tangent change.</p>
            <Slider label="Angle" min={10} max={80} step={1} unit=" °" value={trigAngle} onChange={(e) => setTrigAngle(Number(e.target.value))} />
            <div className="flex flex-wrap gap-2">
              <Button onClick={recordSample} leftIcon={<PlusCircle size={16} />}>Record Sample</Button>
              <Button variant="ghost" onClick={() => { clearData(); setSample(0); }} leftIcon={<RotateCcw size={16} />}>Reset Samples</Button>
            </div>
            <div className="grid gap-3">
              <Card className="bg-emerald-50 border-emerald-100"><p className="text-sm text-gray-500">sin θ</p><p className="text-2xl font-bold text-gray-900">{sinValue.toFixed(3)}</p></Card>
              <Card className="bg-blue-50 border-blue-100"><p className="text-sm text-gray-500">cos θ</p><p className="text-2xl font-bold text-gray-900">{cosValue.toFixed(3)}</p></Card>
              <Card className="bg-amber-50 border-amber-100"><p className="text-sm text-gray-500">tan θ</p><p className="text-2xl font-bold text-gray-900">{tanValue.toFixed(3)}</p></Card>
            </div>
          </div>
          <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full rounded-2xl border border-slate-200" />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <LiveChart data={dataPoints} config={{ title: 'sin θ vs Angle', xKey: 'angle', yKey: 'sinValue', xLabel: 'Angle (°)', yLabel: 'sin θ', color: '#059669' }} />
        <LiveChart data={dataPoints} config={{ title: 'cos θ vs Angle', xKey: 'angle', yKey: 'cosValue', xLabel: 'Angle (°)', yLabel: 'cos θ', color: '#2563eb' }} />
      </div>

      <Card>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Compass className="text-green-600" size={18} />
            <div>
              <h3 className="font-semibold text-gray-900">Export Ratio Samples</h3>
              <p className="text-sm text-gray-600">Store angle-to-ratio snapshots for reports and evidence.</p>
            </div>
          </div>
          <ExportBtn data={dataPoints} experimentName="trigonometry" />
        </div>
      </Card>
    </div>
  );
}
