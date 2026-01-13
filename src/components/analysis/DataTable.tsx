import React from 'react';
import Card from '@/components/ui/Card';

export default function DataTable({ data = [] }: { data: any[] }) {
  return (
    <Card>
      <div className="overflow-auto max-h-64">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {data.length > 0 && Object.keys(data[0]).map((k) => (
                <th key={k} className="px-2 py-1 text-left">{k}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {Object.keys(row).map((k) => (
                  <td key={k} className="px-2 py-1">{String(row[k])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
