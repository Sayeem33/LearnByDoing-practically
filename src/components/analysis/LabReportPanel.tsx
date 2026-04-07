import React from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { CheckCircle2, Download, FileText, Save, Sparkles } from 'lucide-react';

interface LabReportPanelProps {
  report: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  onSave: () => void;
  onDownload: () => void;
  isGenerating?: boolean;
  isSaving?: boolean;
  hasSavedExperiment: boolean;
  isDirty: boolean;
  experimentStatus: 'draft' | 'completed' | 'submitted';
}

export default function LabReportPanel({
  report,
  onChange,
  onGenerate,
  onSave,
  onDownload,
  isGenerating = false,
  isSaving = false,
  hasSavedExperiment,
  isDirty,
  experimentStatus,
}: LabReportPanelProps) {
  const hasReport = report.trim().length > 0;

  return (
    <Card>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <FileText className="text-indigo-600" size={20} />
            Lab Report
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Generate a structured report from the current experiment data, then review and edit it before submitting.
          </p>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            experimentStatus === 'submitted'
              ? 'bg-indigo-100 text-indigo-700'
              : hasReport
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
          }`}
        >
          {experimentStatus === 'submitted' ? 'Submitted' : hasReport ? 'Report Ready' : 'Report Needed'}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onGenerate}
          leftIcon={<Sparkles size={16} />}
          isLoading={isGenerating}
        >
          Generate Report
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onSave}
          leftIcon={<Save size={16} />}
          isLoading={isSaving}
          disabled={!hasReport}
        >
          {hasSavedExperiment ? 'Save Report' : 'Create Draft & Save Report'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDownload}
          leftIcon={<Download size={16} />}
          disabled={!hasReport}
        >
          Download Report
        </Button>
      </div>

      <div className="mb-3 flex items-center gap-2 text-sm">
        <CheckCircle2 size={16} className={hasReport ? 'text-green-600' : 'text-gray-400'} />
        <span className="text-gray-700">
          {hasReport
            ? isDirty
              ? 'You have unsaved report changes.'
              : 'Report is ready and synced with the experiment workflow.'
            : 'Generate a report before submitting this experiment.'}
        </span>
      </div>

      <textarea
        value={report}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Generate a report from your current measurements, then refine the observations and conclusion here."
        className="w-full min-h-[360px] rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
    </Card>
  );
}
