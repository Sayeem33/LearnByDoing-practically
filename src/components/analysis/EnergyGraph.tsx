import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '@/components/ui/Card';

export default function EnergyGraph({ data = [] }: { data: any[] }) {
  return (
    <Card>
      <h3 className="text-lg font-bold mb-2">Energy vs Time</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" hide />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="pe" stroke="#f97316" dot={false} name="Potential Energy" />
          <Line type="monotone" dataKey="ke" stroke="#06b6d4" dot={false} name="Kinetic Energy" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
