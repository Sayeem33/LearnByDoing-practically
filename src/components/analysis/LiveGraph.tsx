import React from 'react';
import LiveChart from './LiveChart';

export default function LiveGraph({ data = [], xKey = 'time', yKey = 'value', title = 'Live Graph' }: { data?: any[]; xKey?: string; yKey?: string; title?: string }) {
  return <LiveChart data={data} config={{ xKey, yKey, title, xLabel: xKey, yLabel: yKey }} />;
}
