import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export interface ChartConfig {
  xKey: string;
  yKey: string;
  xLabel?: string;
  yLabel?: string;
  title?: string;
  color?: string;
}

export interface LiveChartProps {
  data: any[];
  config: ChartConfig;
  className?: string;
}

const LiveChart: React.FC<LiveChartProps> = ({ data, config, className }) => {
  const {
    xKey,
    yKey,
    xLabel = 'X',
    yLabel = 'Y',
    title = 'Data Chart',
    color = '#3b82f6',
  } = config;

  return (
    <Card className={cn('', className)}>
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">
          Real-time data visualization
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey={xKey}
            label={{ value: xLabel, position: 'insideBottom', offset: -5 }}
            stroke="#6b7280"
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis
            label={{ value: yLabel, angle: -90, position: 'insideLeft' }}
            stroke="#6b7280"
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
            labelStyle={{ color: '#374151', fontWeight: 600 }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '10px',
            }}
          />
          <Line
            type="monotone"
            dataKey={yKey}
            stroke={color}
            strokeWidth={3}
            dot={false}
            isAnimationActive={false}
            name={yLabel}
          />
        </LineChart>
      </ResponsiveContainer>

      {data.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div>
            <div className="text-xs text-gray-500 uppercase">Data Points</div>
            <div className="text-lg font-bold text-gray-800">{data.length}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase">Min {yLabel}</div>
            <div className="text-lg font-bold text-gray-800">
              {Math.min(...data.map((d) => d[yKey])).toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase">Max {yLabel}</div>
            <div className="text-lg font-bold text-gray-800">
              {Math.max(...data.map((d) => d[yKey])).toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default LiveChart;