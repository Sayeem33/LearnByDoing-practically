'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/Card';
import { 
  Plus, Beaker, Zap, Clock, Trash2, Eye, 
  BookOpen, FlaskConical, Atom, TrendingUp, 
  Award, Target, Flame, Droplets, Sparkles,
  GraduationCap, Play, ArrowRight, Star, FileText, ShieldCheck, ClipboardCheck, MessageSquare, Compass
} from 'lucide-react';
import { EXPERIMENT_TEMPLATES } from '@/lib/constants';
import { ValidationSummary, VALIDATION_STATUS_META } from '@/lib/validation';

interface Experiment {
  _id: string;
  title: string;
  category: string;
  experimentType: string;
  status: 'draft' | 'completed' | 'submitted';
  labReport?: string;
  review?: {
    status: 'not_reviewed' | 'pending_review' | 'approved' | 'changes_requested';
    feedback?: string;
    reviewedBy?: string;
    reviewedAt?: string | null;
  };
  state?: {
    validation?: ValidationSummary;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProgressAchievement {
  achievementId: string;
  title: string;
  description: string;
  kind: 'tutorial' | 'lab' | 'progress';
  earnedAt: string;
}

interface TutorialProgressEntry {
  tutorialId: string;
  experimentName: string;
  category: 'physics' | 'chemistry' | 'technology' | 'math';
  totalChapters: number;
  completedChapters: number[];
  completionPercent: number;
  completedAt?: string | null;
}

interface LabProgressEntry {
  experimentType: string;
  experimentName: string;
  category: 'physics' | 'chemistry' | 'technology' | 'math';
  status: 'draft' | 'completed' | 'submitted';
  completionPercent: number;
  reportSaved: boolean;
  savedExperimentId?: string;
}

interface UserProgressData {
  achievements: ProgressAchievement[];
  tutorialProgress: TutorialProgressEntry[];
  labProgress: LabProgressEntry[];
  stats: {
    completedStepsCount: number;
    achievementsCount: number;
    completedTutorialsCount: number;
    tutorialsInProgressCount: number;
    completedLabsCount: number;
    submittedLabsCount: number;
    tutorialCompletionRate: number;
    labCompletionRate: number;
  };
}

interface StudentAssignment {
  _id: string;
  title: string;
  description?: string;
  sourceType: 'lab' | 'tutorial';
  sourceId: string;
  sourceName: string;
  sourceCategory: 'physics' | 'chemistry' | 'technology' | 'math';
  dueDate: string;
  studentStatus: {
    started: boolean;
    completed: boolean;
    submitted: boolean;
    completionPercent: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [progress, setProgress] = useState<UserProgressData | null>(null);
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'physics' | 'chemistry' | 'math'>('all');

  // Fetch user experiments
  useEffect(() => {
    fetchExperiments();
    fetchProgress();
    fetchAssignments();
  }, []);

  const fetchExperiments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/experiments');

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        setExperiments(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch experiments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/progress');

      if (response.status === 401) {
        return;
      }

      const result = await response.json();
      if (result.success) {
        setProgress(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/assignments');

      if (response.status === 401) {
        return;
      }

      const result = await response.json();
      if (result.success) {
        setAssignments(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experiment?')) return;

    try {
      const response = await fetch(`/api/experiments/${id}`, {
        method: 'DELETE',
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      const result = await response.json();

      if (response.ok && result.success) {
        setExperiments((prev) => prev.filter((exp) => exp._id !== id));
        fetchProgress();
        return;
      }

      alert(result.error || 'Failed to delete experiment');
    } catch (error) {
      console.error('Failed to delete experiment:', error);
      alert('Failed to delete experiment');
    }
  };

  const handleStatusUpdate = async (
    id: string,
    status: Experiment['status']
  ) => {
    try {
      const response = await fetch(`/api/experiments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      const result = await response.json();
      if (!response.ok || !result.success) {
        alert(result.error || 'Failed to update experiment status');
        return;
      }

      setExperiments((prev) =>
        prev.map((exp) =>
          exp._id === id ? { ...exp, status: result.data.status } : exp
        )
      );
      fetchProgress();
    } catch (error) {
      console.error('Failed to update experiment status:', error);
      alert('Failed to update experiment status');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Continue with client cleanup even if API call fails.
    }

    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    router.push('/login');
  };

  const filteredExperiments =
    filter === 'all'
      ? experiments
      : experiments.filter((exp) => exp.category === filter);

  const templates = Object.entries(EXPERIMENT_TEMPLATES);
  const physicsTemplates = templates.filter(([_, t]) => t.category === 'physics');
  const chemistryTemplates = templates.filter(([_, t]) => t.category === 'chemistry');
  const mathTemplates = templates.filter(([_, t]) => t.category === 'math');

  // Stats
  const totalExperiments = experiments.length;
  const completedExperiments = experiments.filter(e => e.status === 'completed').length;
  const physicsCount = experiments.filter(e => e.category === 'physics').length;
  const chemistryCount = experiments.filter(e => e.category === 'chemistry').length;
  const mathCount = experiments.filter(e => e.category === 'math').length;
  const experimentsWithValidation = experiments.filter(
    (experiment) => experiment.state?.validation?.supported
  );
  const completedValidationRuns = experimentsWithValidation.filter(
    (experiment) => (experiment.state?.validation?.metrics.length || 0) > 0
  );
  const validatedExperiments = experimentsWithValidation.filter(
    (experiment) => experiment.state?.validation?.status === 'validated'
  ).length;
  const averageAccuracy =
    completedValidationRuns.length > 0
      ? completedValidationRuns.reduce((total, experiment) => {
          return total + (experiment.state?.validation?.accuracyScore || 0);
        }, 0) / completedValidationRuns.length
      : null;
  const averagePassRate =
    completedValidationRuns.length > 0
      ? completedValidationRuns.reduce((total, experiment) => {
          return total + (experiment.state?.validation?.passRate || 0);
        }, 0) / completedValidationRuns.length
      : null;
  const recentValidationRuns = [...completedValidationRuns].slice(0, 3);
  const evidenceReadyExperiments = experiments.filter(
    (experiment) => Boolean(experiment.labReport?.trim()) && Boolean(experiment.state?.validation?.metrics.length)
  );
  const reviewedExperiments = experiments.filter(
    (experiment) => experiment.review && experiment.review.status !== 'not_reviewed'
  );
  const pendingReviewExperiments = experiments.filter(
    (experiment) => experiment.review?.status === 'pending_review'
  );
  const recentReviewedExperiments = [...reviewedExperiments]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);
  const upcomingAssignments = [...assignments]
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);
  const recentAchievements = [...(progress?.achievements || [])]
    .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
    .slice(0, 4);
  const tutorialProgressEntries = [...(progress?.tutorialProgress || [])]
    .sort((a, b) => b.completionPercent - a.completionPercent)
    .slice(0, 3);
  const labProgressEntries = [...(progress?.labProgress || [])]
    .sort((a, b) => b.completionPercent - a.completionPercent)
    .slice(0, 3);

  // Get icon for experiment type
  const getExperimentIcon = (key: string, category: string) => {
    const icons: Record<string, React.ReactNode> = {
      freefall: <Droplets className="text-blue-500" size={28} />,
      projectilemotion: <Target className="text-red-500" size={28} />,
      pendulum: <Atom className="text-purple-500" size={28} />,
      collision: <Sparkles className="text-amber-500" size={28} />,
      acidbase: <FlaskConical className="text-green-500" size={28} />,
      titration: <Beaker className="text-pink-500" size={28} />,
      electrolysis: <Zap className="text-yellow-500" size={28} />,
      flametest: <Flame className="text-orange-500" size={28} />,
      crystallization: <Sparkles className="text-cyan-500" size={28} />,
      displacement: <TrendingUp className="text-indigo-500" size={28} />,
      pythagorean: <Compass className="text-emerald-500" size={28} />,
      trigonometry: <Target className="text-lime-500" size={28} />,
      circletheorems: <Sparkles className="text-emerald-600" size={28} />,
      derivativeintuition: <TrendingUp className="text-cyan-500" size={28} />,
    };
    return icons[key] || (
      category === 'physics'
        ? <Zap className="text-blue-600" size={28} />
        : category === 'chemistry'
          ? <Beaker className="text-purple-600" size={28} />
          : <Compass className="text-emerald-600" size={28} />
    );
  };

  // Get difficulty badge
  const getDifficultyBadge = (key: string) => {
    const difficulties: Record<string, { level: string; color: string }> = {
      freefall: { level: 'Beginner', color: 'bg-green-100 text-green-700' },
      acidbase: { level: 'Beginner', color: 'bg-green-100 text-green-700' },
      pendulum: { level: 'Beginner', color: 'bg-green-100 text-green-700' },
      projectilemotion: { level: 'Intermediate', color: 'bg-yellow-100 text-yellow-700' },
      collision: { level: 'Intermediate', color: 'bg-yellow-100 text-yellow-700' },
      titration: { level: 'Intermediate', color: 'bg-yellow-100 text-yellow-700' },
      electrolysis: { level: 'Intermediate', color: 'bg-yellow-100 text-yellow-700' },
      flametest: { level: 'Beginner', color: 'bg-green-100 text-green-700' },
      crystallization: { level: 'Beginner', color: 'bg-green-100 text-green-700' },
      displacement: { level: 'Intermediate', color: 'bg-yellow-100 text-yellow-700' },
      pythagorean: { level: 'Beginner', color: 'bg-green-100 text-green-700' },
      trigonometry: { level: 'Beginner', color: 'bg-green-100 text-green-700' },
      circletheorems: { level: 'Intermediate', color: 'bg-yellow-100 text-yellow-700' },
      derivativeintuition: { level: 'Intermediate', color: 'bg-yellow-100 text-yellow-700' },
    };
    const diff = difficulties[key] || { level: 'Beginner', color: 'bg-green-100 text-green-700' };
    return <span className={`text-xs font-semibold px-2 py-1 rounded-full ${diff.color}`}>{diff.level}</span>;
  };

  const getStatusBadge = (status: Experiment['status']) => {
    const styles: Record<Experiment['status'], string> = {
      draft: 'bg-amber-100 text-amber-700',
      completed: 'bg-green-100 text-green-700',
      submitted: 'bg-indigo-100 text-indigo-700',
    };

    const labels: Record<Experiment['status'], string> = {
      draft: 'Draft',
      completed: 'Completed',
      submitted: 'Submitted',
    };

    return (
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status]}`}>
        {status === 'completed' ? '✓ ' : status === 'submitted' ? '↑ ' : '⏳ '}
        {labels[status]}
      </span>
    );
  };

  const getValidationBadge = (summary?: ValidationSummary) => {
    if (!summary?.supported || summary.metrics.length === 0) {
      return (
        <span className="text-xs font-semibold text-slate-500">
          Validation pending
        </span>
      );
    }

    const meta = VALIDATION_STATUS_META[summary.status];

    return (
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${meta.className}`}>
        {meta.label}
      </span>
    );
  };

  const getAssignmentLink = (assignment: StudentAssignment) => {
    return assignment.sourceType === 'tutorial'
      ? `/tutorials/${assignment.sourceId}`
      : `/lab/${assignment.sourceId}`;
  };

  const getAssignmentStatusLabel = (assignment: StudentAssignment) => {
    if (assignment.studentStatus.submitted) return 'Submitted';
    if (assignment.studentStatus.completed) return 'Completed';
    if (assignment.studentStatus.started) return 'In Progress';
    return 'Not Started';
  };

  const getAssignmentStatusClass = (assignment: StudentAssignment) => {
    if (assignment.studentStatus.submitted) return 'bg-indigo-100 text-indigo-700';
    if (assignment.studentStatus.completed) return 'bg-green-100 text-green-700';
    if (assignment.studentStatus.started) return 'bg-amber-100 text-amber-700';
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <FlaskConical className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  SimuLab Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  Your virtual science laboratory
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/tutorials">
                <Button variant="ghost" size="sm" leftIcon={<BookOpen size={16} />}>
                  Tutorials
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="sm">← Home</Button>
              </Link>
              <Button variant="danger" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <section className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FlaskConical className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalExperiments}</p>
                  <p className="text-sm text-gray-500">Total Experiments</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Award className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{completedExperiments}</p>
                  <p className="text-sm text-gray-500">Completed</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Zap className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{physicsCount}</p>
                  <p className="text-sm text-gray-500">Physics Labs</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-pink-100 rounded-xl">
                  <Beaker className="text-pink-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{chemistryCount}</p>
                  <p className="text-sm text-gray-500">Chemistry Labs</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Compass className="text-emerald-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{mathCount}</p>
                  <p className="text-sm text-gray-500">Math Modules</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <ClipboardCheck className="text-indigo-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Assigned Work</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {assignments.length} active
            </span>
          </div>

          {upcomingAssignments.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">
                No assignments yet. When a teacher assigns a lab or tutorial, it will appear here.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
              {upcomingAssignments.map((assignment) => (
                <div
                  key={assignment._id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="p-3 bg-indigo-50 rounded-xl">
                      {getExperimentIcon(assignment.sourceId, assignment.sourceCategory)}
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getAssignmentStatusClass(
                        assignment
                      )}`}
                    >
                      {getAssignmentStatusLabel(assignment)}
                    </span>
                  </div>

                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                    {assignment.sourceType} • {assignment.sourceCategory}
                  </p>
                  <h3 className="font-bold text-gray-900 mb-1">{assignment.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{assignment.sourceName}</p>

                  {assignment.description ? (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{assignment.description}</p>
                  ) : null}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Deadline</span>
                      <span>{new Date(assignment.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Progress</span>
                      <span>{assignment.studentStatus.completionPercent.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-600"
                        style={{ width: `${assignment.studentStatus.completionPercent}%` }}
                      />
                    </div>
                  </div>

                  <Link href={getAssignmentLink(assignment)}>
                    <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
                      {assignment.sourceType === 'tutorial' ? <BookOpen size={14} /> : <Play size={14} />}
                      Open {assignment.sourceType === 'tutorial' ? 'Tutorial' : 'Lab'}
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Award className="text-emerald-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Progress Tracker</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              MongoDB-backed
            </span>
          </div>

          <div className="grid md:grid-cols-4 gap-5 mb-5">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Completed Steps</p>
              <p className="text-2xl font-bold text-gray-900">
                {progress?.stats.completedStepsCount ?? 0}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Achievements Earned</p>
              <p className="text-2xl font-bold text-gray-900">
                {progress?.stats.achievementsCount ?? 0}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Tutorial Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {progress ? `${progress.stats.tutorialCompletionRate.toFixed(1)}%` : '--'}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Lab Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {progress ? `${progress.stats.labCompletionRate.toFixed(1)}%` : '--'}
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Recent Achievements</h3>
              {recentAchievements.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Start tutorials and labs to unlock achievements here.
                </p>
              ) : (
                <div className="space-y-3">
                  {recentAchievements.map((achievement) => (
                    <div key={achievement.achievementId} className="rounded-xl bg-amber-50 border border-amber-100 p-3">
                      <p className="font-semibold text-gray-900">{achievement.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Tutorial Progress</h3>
              {tutorialProgressEntries.length === 0 ? (
                <p className="text-sm text-gray-500">No tutorial progress recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {tutorialProgressEntries.map((entry) => (
                    <div key={entry.tutorialId}>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-medium text-gray-900">{entry.experimentName}</span>
                        <span className="text-gray-500">{entry.completionPercent.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                          style={{ width: `${entry.completionPercent}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {entry.completedChapters.length} of {entry.totalChapters} chapters viewed
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Lab Progress</h3>
              {labProgressEntries.length === 0 ? (
                <p className="text-sm text-gray-500">No lab progress recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {labProgressEntries.map((entry) => (
                    <div key={`${entry.savedExperimentId || entry.experimentType}-lab`}>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-medium text-gray-900">{entry.experimentName}</span>
                        <span className="text-gray-500">{entry.completionPercent.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600"
                          style={{ width: `${entry.completionPercent}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Status: {entry.status} {entry.reportSaved ? '• report saved' : ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Compass className="text-emerald-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Math Concepts</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {mathTemplates.length} available
            </span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {mathTemplates.map(([key, template]) => (
              <div
                key={key}
                className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-emerald-200 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-50 to-cyan-100 rounded-xl group-hover:scale-110 transition-transform">
                    {getExperimentIcon(key, 'math')}
                  </div>
                  {getDifficultyBadge(key)}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{template.name}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{template.description}</p>
                <div className="flex gap-2">
                  <Link href={`/lab/${key}`} className="flex-1">
                    <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors">
                      <Play size={14} />
                      Start Lab
                    </button>
                  </Link>
                  <Link href={`/tutorials/${key}`}>
                    <button className="p-2 border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 rounded-lg transition-colors">
                      <BookOpen size={16} className="text-gray-600" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tab Navigation */}
        <section className="mb-6">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
            <button
              className="px-6 py-2.5 rounded-lg font-semibold text-sm transition-all bg-white text-blue-600 shadow-sm"
            >
              <span className="flex items-center gap-2">
                <FlaskConical size={16} />
                Experiments
              </span>
            </button>
            <Link
              href="/tutorials"
              className="px-6 py-2.5 rounded-lg font-semibold text-sm transition-all text-gray-600 hover:text-gray-900"
            >
              <span className="flex items-center gap-2">
                <GraduationCap size={16} />
                Tutorials
              </span>
            </Link>
          </div>
        </section>

        {/* Physics Experiments Section */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="text-blue-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Physics Experiments</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {physicsTemplates.length} available
            </span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {physicsTemplates.map(([key, template]) => (
              <div
                key={key}
                className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl group-hover:scale-110 transition-transform">
                    {getExperimentIcon(key, 'physics')}
                  </div>
                  {getDifficultyBadge(key)}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{template.name}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{template.description}</p>
                <div className="flex gap-2">
                  <Link href={`/lab/${key}`} className="flex-1">
                    <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
                      <Play size={14} />
                      Start Lab
                    </button>
                  </Link>
                  <Link href={`/tutorials/${key}`}>
                    <button className="p-2 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-lg transition-colors">
                      <BookOpen size={16} className="text-gray-600" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Chemistry Experiments Section */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Beaker className="text-purple-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Chemistry Experiments</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {chemistryTemplates.length} available
            </span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {chemistryTemplates.map(([key, template]) => (
              <div
                key={key}
                className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-purple-200 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl group-hover:scale-110 transition-transform">
                    {getExperimentIcon(key, 'chemistry')}
                  </div>
                  {getDifficultyBadge(key)}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{template.name}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{template.description}</p>
                <div className="flex gap-2">
                  <Link href={`/lab/${key}`} className="flex-1">
                    <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors">
                      <Play size={14} />
                      Start Lab
                    </button>
                  </Link>
                  <Link href={`/tutorials/${key}`}>
                    <button className="p-2 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 rounded-lg transition-colors">
                      <BookOpen size={16} className="text-gray-600" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Tutorial Banner */}
        <section className="mb-10">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="text-yellow-300" size={20} fill="currentColor" />
                  <span className="text-sm font-semibold text-white/80">Featured</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">New to SimuLab?</h3>
                <p className="text-white/80 max-w-md">
                  Start with our beginner-friendly Free Fall tutorial to learn the basics of physics simulations.
                </p>
              </div>
              <Link href="/tutorials">
                <button className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
                  Browse Tutorials
                  <ArrowRight size={18} />
                </button>
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <ShieldCheck className="text-emerald-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Validation & Verification</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              demo-ready metrics
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mb-5">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Validated Labs</p>
              <p className="text-2xl font-bold text-gray-900">{validatedExperiments}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Average Accuracy</p>
              <p className="text-2xl font-bold text-gray-900">
                {averageAccuracy !== null ? `${averageAccuracy.toFixed(1)}%` : '--'}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Average Passed Checks</p>
              <p className="text-2xl font-bold text-gray-900">
                {averagePassRate !== null ? `${averagePassRate.toFixed(1)}%` : '--'}
              </p>
            </div>
          </div>

          {recentValidationRuns.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">No validation runs yet</h3>
              <p className="text-gray-500 max-w-2xl mx-auto">
                Save a supported lab such as Free Fall, Projectile Motion, Pendulum, Collision, or Electrolysis to see theoretical comparisons, error percentages, and verification status here.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {recentValidationRuns.map((experiment) => {
                const summary = experiment.state?.validation;

                if (!summary) return null;

                return (
                  <div
                    key={`${experiment._id}-validation`}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          {experiment.category}
                        </p>
                        <h3 className="font-bold text-gray-900">{experiment.title}</h3>
                      </div>
                      {getValidationBadge(summary)}
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-sm mb-4">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-gray-500 mb-1">Accuracy</p>
                        <p className="font-bold text-gray-900">
                          {summary.accuracyScore !== null ? `${summary.accuracyScore.toFixed(1)}%` : '--'}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-gray-500 mb-1">Checks</p>
                        <p className="font-bold text-gray-900">{summary.passRate.toFixed(1)}%</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-gray-500 mb-1">Metrics</p>
                        <p className="font-bold text-gray-900">{summary.metrics.length}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      {summary.metrics.slice(0, 2).map((metric) => (
                        <div key={metric.key} className="flex items-center justify-between gap-3">
                          <span className="text-gray-600">{metric.label}</span>
                          <span className={metric.withinTolerance ? 'text-green-600 font-semibold' : 'text-amber-600 font-semibold'}>
                            {metric.errorPercent !== null ? `${metric.errorPercent.toFixed(2)}%` : '--'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-amber-100 rounded-lg">
              <ClipboardCheck className="text-amber-700" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Evidence & Review Readiness</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              export-ready outputs
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mb-5">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Evidence Ready Labs</p>
              <p className="text-2xl font-bold text-gray-900">{evidenceReadyExperiments.length}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Reviewed Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{reviewedExperiments.length}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Pending Instructor Review</p>
              <p className="text-2xl font-bold text-gray-900">{pendingReviewExperiments.length}</p>
            </div>
          </div>

          {recentReviewedExperiments.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">No instructor feedback yet</h3>
              <p className="text-gray-500 max-w-2xl mx-auto">
                Submit a lab with a report to make it available in the instructor review queue. Review status and feedback will appear here when a teacher or admin updates it.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {recentReviewedExperiments.map((experiment) => (
                <div
                  key={`${experiment._id}-review`}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {experiment.category}
                      </p>
                      <h3 className="font-bold text-gray-900">{experiment.title}</h3>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        experiment.review?.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : experiment.review?.status === 'changes_requested'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {experiment.review?.status?.replace(/_/g, ' ') || 'pending review'}
                    </span>
                  </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <MessageSquare size={14} className="text-amber-600" />
                    <span>{experiment.review?.reviewedBy || 'Instructor'} feedback available</span>
                  </div>

                  <p className="rounded-xl bg-slate-50 p-3 text-sm text-gray-700 line-clamp-4">
                    {experiment.review?.feedback?.trim() || 'No written feedback was provided.'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Saved Experiments */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="text-amber-600" size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Your Saved Experiments</h2>
            </div>
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('physics')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  filter === 'physics' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Physics
              </button>
              <button
                onClick={() => setFilter('chemistry')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  filter === 'chemistry' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Chemistry
              </button>
              <button
                onClick={() => setFilter('math')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  filter === 'math' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Math
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600">Loading your experiments...</p>
            </div>
          ) : filteredExperiments.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  No experiments saved yet
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Start your scientific journey by running an experiment from the templates above. Your progress will be saved here.
                </p>
                <Link href="/lab/freefall">
                  <Button variant="primary" leftIcon={<Play size={16} />}>
                    Start Your First Experiment
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredExperiments.map((exp) => (
                <div key={exp._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  {(() => {
                    const hasReport = Boolean(exp.labReport?.trim());
                    const validation = exp.state?.validation;

                    return (
                      <>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {exp.category === 'physics' ? (
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Zap className="text-blue-600" size={18} />
                        </div>
                      ) : exp.category === 'chemistry' ? (
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Beaker className="text-purple-600" size={18} />
                        </div>
                      ) : (
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <Compass className="text-emerald-600" size={18} />
                        </div>
                      )}
                      <span className="text-xs font-semibold text-gray-500 uppercase">
                        {exp.category}
                      </span>
                    </div>
                    {getStatusBadge(exp.status)}
                  </div>

                  <h3 className="font-bold text-gray-900 mb-2">{exp.title}</h3>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Clock size={14} />
                    <span>
                      {new Date(exp.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <FileText size={14} className={hasReport ? 'text-green-600' : 'text-amber-500'} />
                    <span>{hasReport ? 'Lab report saved' : 'Lab report not started'}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck
                        size={14}
                        className={validation?.status === 'validated' ? 'text-green-600' : 'text-slate-500'}
                      />
                      <span>
                        {validation?.metrics.length
                          ? `${validation.metrics.length} verification checks`
                          : 'Verification not generated'}
                      </span>
                    </div>
                    {getValidationBadge(validation)}
                  </div>

                  <div className="flex items-center justify-between gap-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck
                        size={14}
                        className={
                          exp.review?.status === 'approved'
                            ? 'text-green-600'
                            : exp.review?.status === 'changes_requested'
                              ? 'text-rose-600'
                              : 'text-slate-500'
                        }
                      />
                      <span>
                        {exp.review?.status
                          ? exp.review.status.replace(/_/g, ' ')
                          : 'Not reviewed'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {hasReport && validation?.metrics.length ? 'Evidence ready' : 'Evidence incomplete'}
                    </span>
                  </div>

                  {exp.review?.feedback?.trim() ? (
                    <div className="mb-4 rounded-xl bg-amber-50 border border-amber-100 p-3 text-sm text-amber-900 line-clamp-3">
                      {exp.review.feedback}
                    </div>
                  ) : null}

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <Link href={`/lab/${exp.experimentType}?saved=${exp._id}`} className="flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        leftIcon={<Eye size={14} />}
                      >
                        Continue
                      </Button>
                    </Link>
                    {exp.status !== 'completed' && exp.status !== 'submitted' && (
                      <button
                        onClick={() => handleStatusUpdate(exp._id, 'completed')}
                        className="px-3 py-2 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                      >
                        Complete
                      </button>
                    )}
                    {exp.status !== 'submitted' && (
                      hasReport ? (
                        <button
                          onClick={() => handleStatusUpdate(exp._id, 'submitted')}
                          className="px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                        >
                          Submit
                        </button>
                      ) : (
                        <span className="px-3 py-2 text-xs font-semibold text-amber-700 bg-amber-50 rounded-lg">
                          Report Required
                        </span>
                      )
                    )}
                    {!hasReport && exp.status !== 'submitted' && (
                      <Link href={`/lab/${exp.experimentType}?saved=${exp._id}`}>
                        <button className="px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                          Add Report
                        </button>
                      </Link>
                    )}
                    <button
                      onClick={() => handleDelete(exp._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                      </>
                    );
                  })()}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            SimuLab - Interactive Science Simulations for Education
          </p>
          <p className="text-gray-400 text-xs mt-2">
            © 2026 SimuLab. Learn science through virtual experiments.
          </p>
        </div>
      </footer>
    </div>
  );
}
