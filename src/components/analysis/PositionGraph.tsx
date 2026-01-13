import React from 'react';
import LiveChart from './LiveChart';

export default function PositionGraph({ data }: { data: any[] }) {
  return <LiveChart data={data} config={{ xKey: 'time', yKey: 'y', xLabel: 'Time', yLabel: 'Position (px)', title: 'Position vs Time', color: '#3b82f6' }} />;
}
