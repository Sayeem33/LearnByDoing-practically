'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ValidationSummary, VALIDATION_STATUS_META } from '@/lib/validation';
import { CheckCircle2, ClipboardCheck, Eye, FileText, MessageSquare, RefreshCcw } from 'lucide-react';

type ReviewStatus = 'not_reviewed' | 'pending_review' | 'approved' | 'changes_requested';

interface ReviewExperiment {
  _id: string;
  title: string;
  description?: string;
  category: string;
  experimentType: string;
  status: 'submitted';
  updatedAt: string;
  createdAt: string;
  labReport?: string;
  state?: {
    dataPoints?: Record<string, any>[];
    validation?: ValidationSummary;
    [key: string]: any;
  };
  review?: {
    status: ReviewStatus;
    feedback?: string;
    reviewedBy?: string;
    reviewerRole?: string;
    reviewedAt?: string | null;
  };
  student?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

const REVIEW_BADGES: Record<ReviewStatus, string> = {
  not_reviewed: 'bg-slate-100 text-slate-700',
  pending_review: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  changes_requested: 'bg-rose-100 text-rose-700',
};

export default function ReviewQueue() {
  const [submissions, setSubmissions] = useState<ReviewExperiment[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reviewStatusFilter, setReviewStatusFilter] = useState<'all' | ReviewStatus>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<'pending_review' | 'approved' | 'changes_requested'>('pending_review');
  const [feedback, setFeedback] = useState('');

  const fetchSubmissions = async (nextFilter = reviewStatusFilter) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (nextFilter !== 'all') {
        params.set('reviewStatus', nextFilter);
      }

      const response = await fetch(`/api/reviews${params.toString() ? `?${params.toString()}` : ''}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to load review queue');
      }

      const nextItems = result.data as ReviewExperiment[];
      setSubmissions(nextItems);
      setSelectedId((current) => current && nextItems.some((item) => item._id === current) ? current : nextItems[0]?._id || null);
    } catch (error) {
      console.error('Failed to load review queue:', error);
      alert('Failed to load submitted experiments for review.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions(reviewStatusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewStatusFilter]);

  const selectedSubmission = useMemo(
    () => submissions.find((submission) => submission._id === selectedId) || null,
    [selectedId, submissions]
  );

  useEffect(() => {
    if (!selectedSubmission) {
      setReviewStatus('pending_review');
      setFeedback('');
      return;
    }

    const currentStatus = selectedSubmission.review?.status || 'pending_review';
    setReviewStatus(
      currentStatus === 'approved' || currentStatus === 'changes_requested'
        ? currentStatus
        : 'pending_review'
    );
    setFeedback(selectedSubmission.review?.feedback || '');
  }, [selectedSubmission]);

  const handleSaveReview = async () => {
    if (!selectedSubmission) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/reviews/${selectedSubmission._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewStatus,
          feedback,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to save review');
      }

      setSubmissions((current) =>
        current.map((submission) =>
          submission._id === selectedSubmission._id ? { ...submission, ...result.data } : submission
        )
      );
      alert('Review updated successfully.');
    } catch (error) {
      console.error('Failed to save review:', error);
      alert('Failed to update review.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Submission Review Queue</h1>
            <p className="mt-2 text-gray-600">
              Browse submitted experiments, inspect reports and validation data, and record review feedback.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(['all', 'pending_review', 'approved', 'changes_requested'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setReviewStatusFilter(status)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  reviewStatusFilter === status
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {status === 'all' ? 'All submissions' : status.replace(/_/g, ' ')}
              </button>
            ))}
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCcw size={16} />}
              onClick={() => fetchSubmissions(reviewStatusFilter)}
            >
              Refresh
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
          <Card className="border border-slate-200 bg-white">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Submitted Experiments</h2>
            {loading ? (
              <div className="py-10 text-center text-sm text-gray-500">Loading review queue...</div>
            ) : submissions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-gray-500">
                No submissions match this filter yet.
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((submission) => {
                  const status = submission.review?.status || 'pending_review';
                  const validationMeta = submission.state?.validation
                    ? VALIDATION_STATUS_META[submission.state.validation.status]
                    : null;

                  return (
                    <button
                      key={submission._id}
                      onClick={() => setSelectedId(submission._id)}
                      className={`w-full rounded-2xl border p-4 text-left transition-all ${
                        selectedId === submission._id
                          ? 'border-blue-300 bg-blue-50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-500 uppercase">
                            {submission.category}
                          </div>
                          <div className="mt-1 font-bold text-gray-900">{submission.title}</div>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${REVIEW_BADGES[status]}`}>
                          {status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="mt-3 text-sm text-gray-600">
                        <div>{submission.student?.name || 'Unknown student'}</div>
                        <div>{submission.student?.email || 'No email available'}</div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {submission.state?.dataPoints?.length || 0} samples
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {submission.labReport?.trim() ? 'Report ready' : 'No report'}
                        </span>
                        {validationMeta ? (
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${validationMeta.className}`}>
                            {validationMeta.label}
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="border border-slate-200 bg-white">
            {!selectedSubmission ? (
              <div className="flex min-h-[420px] items-center justify-center text-sm text-gray-500">
                Select a submission to review.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="text-blue-600" size={20} />
                      <h2 className="text-2xl font-bold text-gray-900">{selectedSubmission.title}</h2>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Submitted by {selectedSubmission.student?.name || 'Unknown student'} for {selectedSubmission.experimentType}.
                    </p>
                    {selectedSubmission.description ? (
                      <p className="mt-3 text-sm text-gray-700">{selectedSubmission.description}</p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link href={`/lab/${selectedSubmission.experimentType}?saved=${selectedSubmission._id}`}>
                      <Button variant="outline" size="sm" leftIcon={<Eye size={16} />}>
                        Open Full Lab
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-medium text-gray-500">Samples</div>
                    <div className="mt-2 text-2xl font-bold text-gray-900">
                      {selectedSubmission.state?.dataPoints?.length || 0}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-medium text-gray-500">Validation Accuracy</div>
                    <div className="mt-2 text-2xl font-bold text-gray-900">
                      {selectedSubmission.state?.validation?.accuracyScore !== null &&
                      selectedSubmission.state?.validation?.accuracyScore !== undefined
                        ? `${selectedSubmission.state.validation.accuracyScore.toFixed(1)}%`
                        : '--'}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-medium text-gray-500">Checks Passed</div>
                    <div className="mt-2 text-2xl font-bold text-gray-900">
                      {selectedSubmission.state?.validation
                        ? `${selectedSubmission.state.validation.passRate.toFixed(1)}%`
                        : '--'}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-medium text-gray-500">Current Review</div>
                    <div className="mt-2 text-base font-bold text-gray-900">
                      {(selectedSubmission.review?.status || 'pending_review').replace(/_/g, ' ')}
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-900">
                        <FileText className="text-indigo-600" size={18} />
                        Lab Report
                      </h3>
                      <div className="max-h-[340px] overflow-auto rounded-xl bg-white p-4 text-sm leading-6 text-gray-700 whitespace-pre-wrap">
                        {selectedSubmission.labReport?.trim() || 'No report submitted yet.'}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-900">
                        <CheckCircle2 className="text-green-600" size={18} />
                        Validation Summary
                      </h3>
                      {selectedSubmission.state?.validation?.metrics.length ? (
                        <div className="space-y-3">
                          {selectedSubmission.state.validation.metrics.map((metric) => (
                            <div
                              key={metric.key}
                              className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-gray-700"
                            >
                              <div className="font-semibold text-gray-900">{metric.label}</div>
                              <div className="mt-1">
                                theoretical {metric.theoretical} {metric.unit || ''} | measured {metric.measured} {metric.unit || ''}
                              </div>
                              <div className="mt-1">
                                error {metric.errorPercent?.toFixed(2) || '0.00'}% | tolerance {metric.tolerancePercent}%
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No validation metrics were captured for this submission.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-900">
                      <MessageSquare className="text-amber-600" size={18} />
                      Review Decision
                    </h3>

                    <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={reviewStatus}
                      onChange={(event) =>
                        setReviewStatus(event.target.value as 'pending_review' | 'approved' | 'changes_requested')
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="pending_review">Pending review</option>
                      <option value="approved">Approved</option>
                      <option value="changes_requested">Changes requested</option>
                    </select>

                    <label className="mb-2 mt-4 block text-sm font-medium text-gray-700">Feedback</label>
                    <textarea
                      value={feedback}
                      onChange={(event) => setFeedback(event.target.value)}
                      placeholder="Write what was done well, what needs improvement, and what the student should fix next."
                      className="min-h-[220px] w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />

                    {selectedSubmission.review?.reviewedAt ? (
                      <p className="mt-3 text-xs text-gray-500">
                        Last reviewed by {selectedSubmission.review.reviewedBy || 'reviewer'} on{' '}
                        {new Date(selectedSubmission.review.reviewedAt).toLocaleString()}.
                      </p>
                    ) : null}

                    <Button
                      className="mt-4 w-full"
                      variant="primary"
                      isLoading={saving}
                      onClick={handleSaveReview}
                    >
                      Save Review
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
