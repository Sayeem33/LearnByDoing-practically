'use client';

import { useEffect, useRef, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Slider from '@/components/ui/Slider';
import LiveChart from '@/components/analysis/LiveChart';
import ExportBtn from '@/components/analysis/ExportBtn';
import { Calculator, RotateCcw, PlusCircle } from 'lucide-react';
import { useDataStream } from '@/hooks/useDataStream';
import { WorkbenchPersistenceProps } from '@/components/workbench/persistence';

const CANVAS_WIDTH = 860;
const CANVAS_HEIGHT = 420;

export default function PythagoreanWorkbench({
  initialSnapshot,
  onSnapshotChange,
}: WorkbenchPersistenceProps<any>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { dataPoints, capture, clearData } = useDataStream({
    initialDataPoints: initialSnapshot?.dataPoints || [],
    captureInterval: 0,
  });

  const [triangleBase, setTriangleBase] = useState(initialSnapshot?.triangleBase || 6);
  const [triangleHeight, setTriangleHeight] = useState(initialSnapshot?.triangleHeight || 8);
  const [sample, setSample] = useState(initialSnapshot?.sample || 0);

  const hypotenuse = Math.sqrt(triangleBase ** 2 + triangleHeight ** 2);
  const theoremLeft = triangleBase ** 2 + triangleHeight ** 2;
  const theoremRight = hypotenuse ** 2;

  useEffect(() => {
    onSnapshotChange?.({
      triangleBase,
      triangleHeight,
      hypotenuse,
      theoremLeft,
      theoremRight,
      sample,
      dataPoints,
    });
  }, [onSnapshotChange, triangleBase, triangleHeight, hypotenuse, theoremLeft, theoremRight, sample, dataPoints]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#eff6ff');
    gradient.addColorStop(1, '#f8fafc');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const scale = 22;
    const originX = 160;
    const originY = 320;
    const basePx = triangleBase * scale;
    const heightPx = triangleHeight * scale;

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Pythagorean Theorem Visualization', 24, 36);
    ctx.font = '13px Arial';
    ctx.fillStyle = '#475569';
    ctx.fillText('The squares on the legs combine to match the square on the hypotenuse.', 24, 58);

    ctx.fillStyle = 'rgba(59, 130, 246, 0.16)';
    ctx.fillRect(originX, originY - 40, basePx, 40);
    ctx.fillStyle = '#2563eb';
    ctx.fillText(`a² = ${(triangleBase ** 2).toFixed(2)}`, originX + basePx / 2 - 22, originY - 12);

    ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';
    ctx.fillRect(originX - 40, originY - heightPx, 40, heightPx);
    ctx.save();
    ctx.translate(originX - 10, originY - heightPx / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#059669';
    ctx.fillText(`b² = ${(triangleHeight ** 2).toFixed(2)}`, -28, 0);
    ctx.restore();

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX + basePx, originY);
    ctx.lineTo(originX, originY - heightPx);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`a = ${triangleBase.toFixed(1)}`, originX + basePx / 2 - 18, originY + 24);
    ctx.fillText(`b = ${triangleHeight.toFixed(1)}`, originX - 62, originY - heightPx / 2);
    ctx.fillText(`c = ${hypotenuse.toFixed(2)}`, originX + basePx / 2 + 10, originY - heightPx / 2 - 12);

    ctx.fillStyle = 'rgba(245, 158, 11, 0.16)';
    ctx.save();
    ctx.translate(470, 110);
    ctx.rotate(-Math.atan2(heightPx, basePx));
    ctx.fillRect(0, 0, hypotenuse * scale, hypotenuse * scale);
    ctx.restore();

    ctx.fillStyle = '#92400e';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`c² = ${theoremRight.toFixed(2)}`, 550, 110);
    ctx.fillText(`a² + b² = ${theoremLeft.toFixed(2)}`, 540, 138);
  }, [triangleBase, triangleHeight, hypotenuse, theoremLeft, theoremRight]);

  const recordSample = () => {
    const nextSample = sample + 1;
    setSample(nextSample);
    capture({
      time: nextSample,
      sample: nextSample,
      base: Number(triangleBase.toFixed(2)),
      height: Number(triangleHeight.toFixed(2)),
      hypotenuse: Number(hypotenuse.toFixed(3)),
      theoremLeft: Number(theoremLeft.toFixed(3)),
      theoremRight: Number(theoremRight.toFixed(3)),
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Pythagorean Theorem</h2>
            <p className="text-sm text-gray-600">
              Change the two legs of the right triangle and compare the area equality.
            </p>
            <Slider label="Base" min={2} max={12} step={0.5} value={triangleBase} onChange={(e) => setTriangleBase(Number(e.target.value))} />
            <Slider label="Height" min={2} max={12} step={0.5} value={triangleHeight} onChange={(e) => setTriangleHeight(Number(e.target.value))} />
            <div className="flex flex-wrap gap-2">
              <Button onClick={recordSample} leftIcon={<PlusCircle size={16} />}>Record Sample</Button>
              <Button variant="ghost" onClick={() => { clearData(); setSample(0); }} leftIcon={<RotateCcw size={16} />}>Reset Samples</Button>
            </div>
            <div className="grid gap-3">
              <Card className="bg-blue-50 border-blue-100">
                <p className="text-sm text-gray-500">Hypotenuse</p>
                <p className="text-2xl font-bold text-gray-900">{hypotenuse.toFixed(3)}</p>
              </Card>
              <Card className="bg-amber-50 border-amber-100">
                <p className="text-sm text-gray-500">Balance Check</p>
                <p className="text-lg font-bold text-gray-900">{theoremLeft.toFixed(2)} = {theoremRight.toFixed(2)}</p>
              </Card>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="w-full rounded-2xl border border-slate-200"
          />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <LiveChart
          data={dataPoints}
          config={{ title: 'a² + b² Across Samples', xKey: 'sample', yKey: 'theoremLeft', xLabel: 'Sample', yLabel: 'a² + b²', color: '#2563eb' }}
        />
        <LiveChart
          data={dataPoints}
          config={{ title: 'Hypotenuse Across Samples', xKey: 'sample', yKey: 'hypotenuse', xLabel: 'Sample', yLabel: 'c', color: '#f59e0b' }}
        />
      </div>

      <Card>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calculator className="text-indigo-600" size={18} />
            <div>
              <h3 className="font-semibold text-gray-900">Export Measurements</h3>
              <p className="text-sm text-gray-600">Use the captured triangle values in reports and evidence.</p>
            </div>
          </div>
          <ExportBtn data={dataPoints} experimentName="pythagorean" />
        </div>
      </Card>
    </div>
  );
}
