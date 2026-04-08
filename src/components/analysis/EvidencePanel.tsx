'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  EvidenceSummary,
  evidenceSummaryToJson,
  evidenceSummaryToMarkdown,
} from '@/lib/evidence';
import { Database, Download, FileJson, Microscope, ShieldCheck } from 'lucide-react';

interface EvidencePanelProps {
  summary: EvidenceSummary;
}

function downloadTextFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function EvidencePanel({ summary }: EvidencePanelProps) {
  const reviewed = summary.review && summary.review.status !== 'not_reviewed';

  return (
    <Card className="border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-emerald-50">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-emerald-100 p-2">
              <Microscope className="text-emerald-700" size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Evidence & Demo Panel</h3>
              <p className="text-sm text-gray-600">
                Export reusable proof of validation, recorded outputs, and result statistics for demo or report use.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download size={16} />}
            onClick={() =>
              downloadTextFile(
                evidenceSummaryToMarkdown(summary),
                `${summary.experimentType}_verification_evidence.md`,
                'text/markdown;charset=utf-8'
              )
            }
          >
            Export Markdown
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<FileJson size={16} />}
            onClick={() =>
              downloadTextFile(
                evidenceSummaryToJson(summary),
                `${summary.experimentType}_verification_evidence.json`,
                'application/json;charset=utf-8'
              )
            }
          >
            Export JSON
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-500">Samples Captured</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{summary.sampleCount}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-500">Numeric Variables</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{summary.numericVariableCount}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-500">Validation Accuracy</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {summary.validation?.accuracyScore !== null && summary.validation?.accuracyScore !== undefined
              ? `${summary.validation.accuracyScore.toFixed(1)}%`
              : '--'}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-500">Review State</div>
          <div className="mt-2 text-base font-semibold text-gray-900">
            {reviewed ? summary.review?.status.replace(/_/g, ' ') : 'Not reviewed'}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h4 className="mb-3 text-sm font-semibold text-gray-900">Tools Used</h4>
          <div className="flex flex-wrap gap-2">
            {summary.toolsUsed.map((tool) => (
              <span
                key={tool}
                className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
              >
                {tool}
              </span>
            ))}
          </div>

          <h4 className="mb-3 mt-5 text-sm font-semibold text-gray-900">Result Statistics</h4>
          <div className="space-y-2 text-sm text-gray-700">
            {summary.statistics.length ? (
              summary.statistics.slice(0, 6).map((metric) => (
                <div
                  key={metric.key}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                >
                  <span className="font-medium text-gray-900">{metric.key}</span>
                  <span>mean {metric.mean.toFixed(3)}, last {metric.last.toFixed(3)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Capture more measurements to generate reusable evidence statistics.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h4 className="mb-3 text-sm font-semibold text-gray-900">Stored Outputs</h4>
          <div className="space-y-3">
            {summary.storedOutputs.map((output) => (
              <div
                key={output.key}
                className="rounded-xl border border-slate-100 bg-slate-50 p-3"
              >
                <div className="flex items-center gap-2">
                  {output.available ? (
                    <ShieldCheck className="text-green-600" size={16} />
                  ) : (
                    <Database className="text-slate-400" size={16} />
                  )}
                  <div className="font-medium text-gray-900">{output.label}</div>
                </div>
                <p className="mt-1 text-sm text-gray-600">{output.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
