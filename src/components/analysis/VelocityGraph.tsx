import React from 'react';
import LiveChart from './LiveChart';

export default function VelocityGraph({ data }: { data: any[] }) {
  return <LiveChart data={data} config={{ xKey: 'time', yKey: 'vy', xLabel: 'Time', yLabel: 'Velocity (px/s)', title: 'Velocity vs Time', color: '#ef4444' }} />;
}
