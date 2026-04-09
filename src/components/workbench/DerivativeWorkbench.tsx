'use client';

import { useEffect, useRef, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Slider from '@/components/ui/Slider';
import LiveChart from '@/components/analysis/LiveChart';
import ExportBtn from '@/components/analysis/ExportBtn';
import { TrendingUp, PlusCircle, RotateCcw } from 'lucide-react';
import { useDataStream } from '@/hooks/useDataStream';
import { WorkbenchPersistenceProps } from '@/components/workbench/persistence';

const CANVAS_WIDTH = 860;
const CANVAS_HEIGHT = 420;

export default function DerivativeWorkbench({
  initialSnapshot,
  onSnapshotChange,
}: WorkbenchPersistenceProps<any>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { dataPoints, capture, clearData } = useDataStream({
    initialDataPoints: initialSnapshot?.dataPoints || [],
    captureInterval: 0,
  });

  const [derivativePointX, setDerivativePointX] = useState(initialSnapshot?.derivativePointX || 1.5);
  const [derivativeScale, setDerivativeScale] = useState(initialSnapshot?.derivativeScale || 1);
  const [sample, setSample] = useState(initialSnapshot?.sample || 0);

  const pointX = derivativePointX;
  const pointY = derivativeScale * pointX * pointX;
  const tangentSlope = 2 * derivativeScale * pointX;

  useEffect(() => {
    onSnapshotChange?.({
      derivativePointX,
      derivativeScale,
      pointX,
      pointY,
      tangentSlope,
      sample,
      dataPoints,
    });
  }, [onSnapshotChange, derivativePointX, derivativeScale, pointX, pointY, tangentSlope, sample, dataPoints]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#eff6ff');
    gradient.addColorStop(1, '#f0fdf4');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const originX = 350;
    const originY = 320;
    const scaleX = 50;
    const scaleY = 18;

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, originY);
    ctx.lineTo(760, originY);
    ctx.moveTo(originX, 40);
    ctx.lineTo(originX, 380);
    ctx.stroke();

    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = -5; x <= 5; x += 0.1) {
      const canvasX = originX + x * scaleX;
      const y = derivativeScale * x * x;
      const canvasY = originY - y * scaleY;
      if (x === -5) ctx.moveTo(canvasX, canvasY);
      else ctx.lineTo(canvasX, canvasY);
    }
    ctx.stroke();

    const pointCanvasX = originX + pointX * scaleX;
    const pointCanvasY = originY - pointY * scaleY;
    const tangentIntercept = pointY - tangentSlope * pointX;
    const tangentStartX = -4.5;
    const tangentEndX = 4.5;

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(originX + tangentStartX * scaleX, originY - (tangentSlope * tangentStartX + tangentIntercept) * scaleY);
    ctx.lineTo(originX + tangentEndX * scaleX, originY - (tangentSlope * tangentEndX + tangentIntercept) * scaleY);
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(pointCanvasX, pointCanvasY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Derivative and Slope Intuition', 24, 36);
    ctx.font = '13px Arial';
    ctx.fillStyle = '#475569';
    ctx.fillText(`At x = ${pointX.toFixed(2)}, the tangent slope is ${tangentSlope.toFixed(2)}.`, 24, 58);
  }, [pointX, pointY, tangentSlope, derivativeScale]);

  const recordSample = () => {
    const nextSample = sample + 1;
    setSample(nextSample);
    capture({
      time: nextSample,
      sample: nextSample,
      pointX: Number(pointX.toFixed(3)),
      pointY: Number(pointY.toFixed(3)),
      tangentSlope: Number(tangentSlope.toFixed(3)),
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Derivative and Slope</h2>
            <p className="text-sm text-gray-600">Move along the curve and compare the tangent line with the derivative formula.</p>
            <Slider label="Point x" min={-4} max={4} step={0.1} value={derivativePointX} onChange={(e) => setDerivativePointX(Number(e.target.value))} />
            <Slider label="Curve Scale a" min={0.5} max={2} step={0.1} value={derivativeScale} onChange={(e) => setDerivativeScale(Number(e.target.value))} />
            <div className="flex flex-wrap gap-2">
              <Button onClick={recordSample} leftIcon={<PlusCircle size={16} />}>Record Sample</Button>
              <Button variant="ghost" onClick={() => { clearData(); setSample(0); }} leftIcon={<RotateCcw size={16} />}>Reset Samples</Button>
            </div>
            <div className="grid gap-3">
              <Card className="bg-blue-50 border-blue-100"><p className="text-sm text-gray-500">Point y</p><p className="text-2xl font-bold text-gray-900">{pointY.toFixed(3)}</p></Card>
              <Card className="bg-amber-50 border-amber-100"><p className="text-sm text-gray-500">Tangent Slope</p><p className="text-2xl font-bold text-gray-900">{tangentSlope.toFixed(3)}</p></Card>
            </div>
          </div>
          <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full rounded-2xl border border-slate-200" />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <LiveChart data={dataPoints} config={{ title: 'Slope vs x', xKey: 'pointX', yKey: 'tangentSlope', xLabel: 'x', yLabel: 'Slope', color: '#f59e0b' }} />
        <LiveChart data={dataPoints} config={{ title: 'Point Height vs x', xKey: 'pointX', yKey: 'pointY', xLabel: 'x', yLabel: 'y', color: '#2563eb' }} />
      </div>

      <Card>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-amber-600" size={18} />
            <div>
              <h3 className="font-semibold text-gray-900">Export Tangent Samples</h3>
              <p className="text-sm text-gray-600">Save derivative measurements for reports, review, and evidence.</p>
            </div>
          </div>
          <ExportBtn data={dataPoints} experimentName="derivativeintuition" />
        </div>
      </Card>
    </div>
  );
}
