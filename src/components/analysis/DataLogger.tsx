import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface DataLoggerProps {
  data: any[];
  columns: string[];
  className?: string;
}

const DataLogger: React.FC<DataLoggerProps> = ({ data, columns, className }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayData = isExpanded ? data : data.slice(-10);

  return (
    <Card className={cn('', className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Data Logger</h3>
          <p className="text-sm text-gray-500">
            {data.length} data points captured
          </p>
        </div>
        {data.length > 10 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            rightIcon={isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          >
            {isExpanded ? 'Show Less' : 'Show All'}
          </Button>
        )}
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No data collected yet. Start the simulation to collect data.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-2 text-left font-semibold text-gray-700 uppercase tracking-wide"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayData.map((row, idx) => (
                <tr
                  key={idx}
                  className={cn(
                    'border-b border-gray-100 hover:bg-gray-50 transition-colors',
                    idx === displayData.length - 1 && 'bg-blue-50'
                  )}
                >
                  {columns.map((col) => (
                    <td key={col} className="px-4 py-2 text-gray-800 font-mono">
                      {typeof row[col] === 'number'
                        ? row[col].toFixed(3)
                        : row[col]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            {!isExpanded && data.length > 10 && (
              <span>Showing last 10 of {data.length} entries</span>
            )}
            {isExpanded && <span>Showing all {data.length} entries</span>}
          </div>
        </div>
      )}
    </Card>
  );
};

export default DataLogger;