import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { Download, Image } from 'lucide-react';
import { exportToCSV } from '@/lib/utils';
import html2canvas from 'html2canvas';

export interface ExportBtnProps {
  data: any[];
  chartRef?: React.RefObject<HTMLDivElement>;
  experimentName?: string;
}

const ExportBtn: React.FC<ExportBtnProps> = ({
  data,
  chartRef,
  experimentName = 'experiment',
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = () => {
    if (data.length === 0) {
      alert('No data to export!');
      return;
    }

    exportToCSV(data, `${experimentName}_data_${Date.now()}.csv`);
  };

  const handleExportChart = async () => {
    if (!chartRef?.current) {
      alert('Chart not available for export!');
      return;
    }

    setIsExporting(true);

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = `${experimentName}_chart_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to export chart:', error);
      alert('Failed to export chart');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportCSV}
        leftIcon={<Download size={16} />}
        disabled={data.length === 0}
      >
        Export CSV
      </Button>

      {chartRef && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportChart}
          leftIcon={<Image size={16} />}
          isLoading={isExporting}
          disabled={!chartRef.current}
        >
          Export Chart
        </Button>
      )}

    </div>
  );
};

export default ExportBtn;
