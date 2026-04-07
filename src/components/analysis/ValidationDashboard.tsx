'use client';

import Card from '@/components/ui/Card';
import {
  formatValidationValue,
  ValidationSummary,
  VALIDATION_STATUS_META,
} from '@/lib/validation';
import { CheckCircle2, FlaskConical, Sigma, Target } from 'lucide-react';

interface ValidationDashboardProps {
  summary: ValidationSummary;
}

export default function ValidationDashboard({ summary }: ValidationDashboardProps) {
  const meta = VALIDATION_STATUS_META[summary.status];
  const hasMetrics = summary.metrics.length > 0;

  return (
    <Card className="border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-blue-100 p-2">
              <FlaskConical className="text-blue-600" size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{summary.title}</h3>
              <p className="text-sm text-gray-600">
                Compare measured values with theoretical expectations for this lab run.
              </p>
            </div>
          </div>
        </div>

        <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}>
          {meta.label}
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-blue-100 bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600">
            <Target className="text-blue-500" size={16} />
            Accuracy Score
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {summary.accuracyScore !== null ? `${summary.accuracyScore.toFixed(1)}%` : '--'}
          </div>
        </div>

        <div className="rounded-2xl border border-green-100 bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600">
            <CheckCircle2 className="text-green-500" size={16} />
            Passed Checks
          </div>
          <div className="text-2xl font-bold text-gray-900">{summary.passRate.toFixed(1)}%</div>
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600">
            <Sigma className="text-indigo-500" size={16} />
            Metrics Compared
          </div>
          <div className="text-2xl font-bold text-gray-900">{summary.metrics.length}</div>
        </div>
      </div>

      {hasMetrics ? (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="py-3 pr-4 font-semibold">Metric</th>
                <th className="py-3 pr-4 font-semibold">Theoretical</th>
                <th className="py-3 pr-4 font-semibold">Measured</th>
                <th className="py-3 pr-4 font-semibold">Error</th>
                <th className="py-3 font-semibold">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.metrics.map((metric) => (
                <tr key={metric.key} className="align-top">
                  <td className="py-3 pr-4">
                    <div className="font-semibold text-gray-900">{metric.label}</div>
                    {metric.note ? (
                      <p className="mt-1 max-w-md text-xs text-gray-500">{metric.note}</p>
                    ) : null}
                  </td>
                  <td className="py-3 pr-4 text-gray-700">
                    {formatValidationValue(metric.theoretical, metric.unit)}
                  </td>
                  <td className="py-3 pr-4 text-gray-700">
                    {formatValidationValue(metric.measured, metric.unit)}
                  </td>
                  <td className="py-3 pr-4 text-gray-700">
                    {metric.errorPercent !== null ? `${metric.errorPercent.toFixed(2)}%` : '--'}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        metric.withinTolerance
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {metric.withinTolerance
                        ? `Within ${metric.tolerancePercent}%`
                        : `Outside ${metric.tolerancePercent}%`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {summary.notes.length ? (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-900">Verification Notes</h4>
          <div className="space-y-2 text-sm text-gray-600">
            {summary.notes.map((note, index) => (
              <p key={`${note}-${index}`}>{note}</p>
            ))}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
