import { ValidationSummary } from '@/lib/validation';

export interface ResultStatistic {
  key: string;
  count: number;
  min: number;
  max: number;
  mean: number;
  last: number;
}

export interface StoredOutputStatus {
  key: string;
  label: string;
  available: boolean;
  details: string;
}

export interface ReviewEvidenceSummary {
  status: 'not_reviewed' | 'pending_review' | 'approved' | 'changes_requested';
  feedback?: string;
  reviewedBy?: string;
  reviewerRole?: string;
  reviewedAt?: string | null;
}

export interface EvidenceSummary {
  title: string;
  experimentType: string;
  category?: string;
  experimentStatus?: string;
  generatedAt: string;
  sampleCount: number;
  numericVariableCount: number;
  timeWindow: {
    start: number;
    end: number;
    duration: number;
  } | null;
  statistics: ResultStatistic[];
  validation: ValidationSummary | null;
  toolsUsed: string[];
  storedOutputs: StoredOutputStatus[];
  review: ReviewEvidenceSummary | null;
}

interface BuildEvidenceSummaryInput {
  title: string;
  experimentType: string;
  category?: string;
  experimentStatus?: string;
  results?: Record<string, any>[];
  snapshot?: Record<string, any> | null;
  validation?: ValidationSummary | null;
  labReport?: string;
  savedExperimentId?: string | null;
  review?: ReviewEvidenceSummary | null;
}

export function computeResultStatistics(results: Record<string, any>[] = []) {
  if (!results.length) return [] as ResultStatistic[];

  const allKeys = Array.from(new Set(results.flatMap((row) => Object.keys(row))));

  return allKeys.reduce<ResultStatistic[]>((acc, key) => {
    const values = results
      .map((row) => row[key])
      .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

    if (!values.length) {
      return acc;
    }

    const sum = values.reduce((total, value) => total + value, 0);

    acc.push({
      key,
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      mean: sum / values.length,
      last: values[values.length - 1],
    });

    return acc;
  }, []);
}

function getTimeWindow(results: Record<string, any>[] = []) {
  const times = results
    .map((row) => row.time)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

  if (!times.length) {
    return null;
  }

  const start = times[0];
  const end = times[times.length - 1];

  return {
    start,
    end,
    duration: end - start,
  };
}

function inferToolsUsed({
  results,
  validation,
  labReport,
  savedExperimentId,
  review,
}: Omit<BuildEvidenceSummaryInput, 'title' | 'experimentType' | 'category' | 'experimentStatus' | 'snapshot'>) {
  const tools = ['Simulation workspace'];

  if (results && results.length) {
    tools.push('Live data logger', 'Chart visualisation');
  }

  if (validation?.supported) {
    tools.push('Validation engine');
  }

  if (labReport?.trim()) {
    tools.push('Lab report generator');
  }

  if (savedExperimentId) {
    tools.push('MongoDB persistence');
  }

  if (review && review.status !== 'not_reviewed') {
    tools.push('Instructor review module');
  }

  return tools;
}

function buildStoredOutputs({
  results,
  validation,
  labReport,
  savedExperimentId,
  review,
  snapshot,
}: Omit<BuildEvidenceSummaryInput, 'title' | 'experimentType' | 'category' | 'experimentStatus'>) {
  return [
    {
      key: 'saved_session',
      label: 'Saved experiment session',
      available: Boolean(savedExperimentId),
      details: savedExperimentId ? 'Draft/session stored in MongoDB.' : 'Not stored yet.',
    },
    {
      key: 'measurement_dataset',
      label: 'Measurement dataset',
      available: Boolean(results?.length),
      details: results?.length ? `${results.length} measurement rows captured.` : 'No measurements captured yet.',
    },
    {
      key: 'validation_summary',
      label: 'Validation summary',
      available: Boolean(validation?.metrics.length),
      details: validation?.metrics.length
        ? `${validation.metrics.length} verification checks available.`
        : validation?.supported
          ? 'Validation is supported but no checks are ready yet.'
          : 'Validation not configured for this experiment.',
    },
    {
      key: 'lab_report',
      label: 'Lab report',
      available: Boolean(labReport?.trim()),
      details: labReport?.trim() ? 'Structured report saved for submission/export.' : 'Report not saved yet.',
    },
    {
      key: 'state_snapshot',
      label: 'State snapshot',
      available: Boolean(snapshot && Object.keys(snapshot).length),
      details:
        snapshot && Object.keys(snapshot).length
          ? 'Workbench state and settings are available for restoration.'
          : 'No state snapshot available yet.',
    },
    {
      key: 'review',
      label: 'Instructor review',
      available: Boolean(review && review.status !== 'not_reviewed'),
      details:
        review && review.status !== 'not_reviewed'
          ? `Current review status: ${review.status.replace(/_/g, ' ')}.`
          : 'No instructor review recorded yet.',
    },
  ];
}

export function buildEvidenceSummary({
  title,
  experimentType,
  category,
  experimentStatus,
  results = [],
  snapshot,
  validation = null,
  labReport,
  savedExperimentId,
  review = null,
}: BuildEvidenceSummaryInput): EvidenceSummary {
  const statistics = computeResultStatistics(results);
  const timeWindow = getTimeWindow(results);

  return {
    title,
    experimentType,
    category,
    experimentStatus,
    generatedAt: new Date().toISOString(),
    sampleCount: results.length,
    numericVariableCount: statistics.length,
    timeWindow,
    statistics,
    validation,
    toolsUsed: inferToolsUsed({ results, validation, labReport, savedExperimentId, review }),
    storedOutputs: buildStoredOutputs({
      results,
      validation,
      labReport,
      savedExperimentId,
      review,
      snapshot,
    }),
    review,
  };
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(3);
}

export function evidenceSummaryToMarkdown(summary: EvidenceSummary) {
  const lines = [
    `# Verification Evidence: ${summary.title}`,
    '',
    `Generated: ${new Date(summary.generatedAt).toLocaleString()}`,
    `Experiment Type: ${summary.experimentType}`,
    `Category: ${summary.category || 'N/A'}`,
    `Experiment Status: ${summary.experimentStatus || 'draft'}`,
    '',
    '## Demo Snapshot',
    `- Samples captured: ${summary.sampleCount}`,
    `- Numeric variables analysed: ${summary.numericVariableCount}`,
    `- Tools used: ${summary.toolsUsed.join(', ') || 'N/A'}`,
    summary.timeWindow
      ? `- Time window: ${formatNumber(summary.timeWindow.start)}s to ${formatNumber(summary.timeWindow.end)}s`
      : '- Time window: N/A',
    '',
    '## Validation Metrics',
    summary.validation
      ? `- Validation status: ${summary.validation.status}`
      : '- Validation status: not available',
    summary.validation?.accuracyScore !== null && summary.validation?.accuracyScore !== undefined
      ? `- Accuracy score: ${summary.validation.accuracyScore.toFixed(1)}%`
      : '- Accuracy score: N/A',
    summary.validation ? `- Pass rate: ${summary.validation.passRate.toFixed(1)}%` : '- Pass rate: N/A',
    '',
    '## Stored Outputs',
    ...summary.storedOutputs.map(
      (output) => `- ${output.label}: ${output.available ? 'Available' : 'Missing'} (${output.details})`
    ),
    '',
    '## Result Statistics',
    ...(summary.statistics.length
      ? summary.statistics.map(
          (metric) =>
            `- ${metric.key}: count ${metric.count}, mean ${formatNumber(metric.mean)}, min ${formatNumber(metric.min)}, max ${formatNumber(metric.max)}, last ${formatNumber(metric.last)}`
        )
      : ['- No numeric result statistics available yet.']),
  ];

  if (summary.review) {
    lines.push(
      '',
      '## Review Status',
      `- Status: ${summary.review.status.replace(/_/g, ' ')}`,
      `- Reviewer: ${summary.review.reviewedBy || 'N/A'}`,
      `- Feedback: ${summary.review.feedback || 'No feedback yet.'}`
    );
  }

  return lines.join('\n');
}

export function evidenceSummaryToJson(summary: EvidenceSummary) {
  return JSON.stringify(summary, null, 2);
}
