import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Beaker, BookOpen, CheckCircle2, ClipboardCheck, Compass, FlaskConical, GraduationCap, LineChart, Presentation, ShieldCheck, Sparkles, Users, Zap } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getServerSession } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import { EXPERIMENT_DEFINITIONS } from '@/lib/experimentDefinitions';
import ConceptDefinition from '@/models/ConceptDefinition';
import Tutorial from '@/models/Tutorial';
import Experiment from '@/models/Experiment';
import UserProgress from '@/models/UserProgress';
import Assignment from '@/models/Assignment';
import User from '@/models/User';

function countByCategory(items: Array<{ category: string }>) {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});
}

export default async function InstructorShowcasePage() {
  const session = await getServerSession();

  if (!session?.user || !['teacher', 'admin'].includes(session.user.role)) {
    redirect('/login');
  }

  await dbConnect();

  const builtInModules = Object.values(EXPERIMENT_DEFINITIONS);
  const authoredDefinitions = await ConceptDefinition.find({ isPublished: true })
    .select('conceptId name category validationRules charts controls')
    .lean();
  const tutorials = await Tutorial.find({})
    .select('category')
    .lean();
  const experiments = await Experiment.find({})
    .select('category status labReport state review')
    .lean();
  const progressDocs = await UserProgress.find({})
    .select('achievements stats tutorialProgress labProgress')
    .lean();
  const assignments = await Assignment.find({})
    .select('sourceType sourceCategory')
    .lean();
  const studentCount = await User.countDocuments({ role: 'student' });

  const supportedDomains = countByCategory([
    ...builtInModules.map((module) => ({ category: module.category })),
    ...authoredDefinitions.map((definition) => ({ category: definition.category })),
  ]);

  const builtInValidationCount = builtInModules.filter(
    (module) => module.validationRules.some((rule) => rule.implemented)
  ).length;
  const authoredValidationCount = authoredDefinitions.filter(
    (definition) => definition.validationRules?.some((rule: any) => rule.implemented)
  ).length;
  const validationRuns = experiments.filter(
    (experiment: any) => experiment.state?.validation?.metrics?.length
  ).length;
  const evidenceArtifacts = experiments.filter(
    (experiment: any) => experiment.labReport?.trim() && experiment.state?.validation?.metrics?.length
  ).length;
  const reviewRecords = experiments.filter(
    (experiment: any) => experiment.review?.status && experiment.review.status !== 'not_reviewed'
  );
  const approvedReviews = reviewRecords.filter((experiment: any) => experiment.review?.status === 'approved').length;
  const pendingReviews = reviewRecords.filter((experiment: any) => experiment.review?.status === 'pending_review').length;
  const changesRequested = reviewRecords.filter((experiment: any) => experiment.review?.status === 'changes_requested').length;
  const totalAchievements = progressDocs.reduce(
    (sum, progress: any) => sum + (progress.achievements?.length || 0),
    0
  );
  const completedTutorials = progressDocs.reduce(
    (sum, progress: any) => sum + (progress.stats?.completedTutorialsCount || 0),
    0
  );
  const submittedLabs = progressDocs.reduce(
    (sum, progress: any) => sum + (progress.stats?.submittedLabsCount || 0),
    0
  );
  const averageTutorialCompletion =
    progressDocs.length > 0
      ? progressDocs.reduce((sum, progress: any) => sum + (progress.stats?.tutorialCompletionRate || 0), 0) /
        progressDocs.length
      : 0;
  const averageLabCompletion =
    progressDocs.length > 0
      ? progressDocs.reduce((sum, progress: any) => sum + (progress.stats?.labCompletionRate || 0), 0) /
        progressDocs.length
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Demo Showcase Dashboard</h1>
            <p className="text-sm text-gray-500">
              A concise overview of the project&apos;s real modules, learning data, and demo evidence.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/instructor/authoring">
              <Button variant="outline" size="sm">Authoring Studio</Button>
            </Link>
            <Link href={session.user.role === 'admin' ? '/admin/dashboard' : '/instructor/dashboard'}>
              <Button variant="outline" size="sm">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <section className="grid gap-5 md:grid-cols-3 xl:grid-cols-6">
          <Card className="bg-white border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Built-in Modules</p>
            <p className="text-3xl font-bold text-gray-900">{builtInModules.length}</p>
          </Card>
          <Card className="bg-white border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Authored Modules</p>
            <p className="text-3xl font-bold text-gray-900">{authoredDefinitions.length}</p>
          </Card>
          <Card className="bg-white border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Tutorials</p>
            <p className="text-3xl font-bold text-gray-900">{tutorials.length}</p>
          </Card>
          <Card className="bg-white border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Assignments</p>
            <p className="text-3xl font-bold text-gray-900">{assignments.length}</p>
          </Card>
          <Card className="bg-white border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Students Reached</p>
            <p className="text-3xl font-bold text-gray-900">{studentCount}</p>
          </Card>
          <Card className="bg-white border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Saved Experiments</p>
            <p className="text-3xl font-bold text-gray-900">{experiments.length}</p>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-white border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-xl bg-blue-100 p-2">
                <FlaskConical className="text-blue-600" size={18} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Major Modules</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
                <div className="flex items-center gap-2 text-blue-700 font-semibold"><Zap size={16} /> Physics Labs</div>
                <p className="text-2xl font-bold text-gray-900 mt-2">{supportedDomains.physics || 0}</p>
              </div>
              <div className="rounded-2xl bg-purple-50 border border-purple-100 p-4">
                <div className="flex items-center gap-2 text-purple-700 font-semibold"><Beaker size={16} /> Chemistry Labs</div>
                <p className="text-2xl font-bold text-gray-900 mt-2">{supportedDomains.chemistry || 0}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold"><Compass size={16} /> Math Concepts</div>
                <p className="text-2xl font-bold text-gray-900 mt-2">{supportedDomains.math || 0}</p>
              </div>
              <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
                <div className="flex items-center gap-2 text-amber-700 font-semibold"><BookOpen size={16} /> Guided Tutorials</div>
                <p className="text-2xl font-bold text-gray-900 mt-2">{tutorials.length}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-xl bg-indigo-100 p-2">
                <Presentation className="text-indigo-600" size={18} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Supported Domains</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="rounded-2xl border border-gray-200 p-4 flex items-center justify-between">
                <span className="font-medium text-gray-700">Virtual labs and concept visualizations</span>
                <span className="font-bold text-gray-900">{builtInModules.length + authoredDefinitions.length}</span>
              </div>
              <div className="rounded-2xl border border-gray-200 p-4 flex items-center justify-between">
                <span className="font-medium text-gray-700">Assignment-ready sources</span>
                <span className="font-bold text-gray-900">{builtInModules.length + authoredDefinitions.length + tutorials.length}</span>
              </div>
              <div className="rounded-2xl border border-gray-200 p-4 flex items-center justify-between">
                <span className="font-medium text-gray-700">MongoDB-backed authored definitions</span>
                <span className="font-bold text-gray-900">{authoredDefinitions.length}</span>
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="bg-white border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-xl bg-emerald-100 p-2">
                <CheckCircle2 className="text-emerald-600" size={18} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Validation Coverage</h2>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <p>Built-in modules with implemented validation rules: <strong className="text-gray-900">{builtInValidationCount}</strong></p>
              <p>Authored modules with at least one implemented rule: <strong className="text-gray-900">{authoredValidationCount}</strong></p>
              <p>Saved experiment runs with validation results: <strong className="text-gray-900">{validationRuns}</strong></p>
            </div>
          </Card>

          <Card className="bg-white border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-xl bg-amber-100 p-2">
                <Sparkles className="text-amber-700" size={18} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Evidence Artifacts</h2>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <p>Evidence-ready labs with report and validation: <strong className="text-gray-900">{evidenceArtifacts}</strong></p>
              <p>Reviewable saved submissions: <strong className="text-gray-900">{reviewRecords.length}</strong></p>
              <p>Exportable artifacts come from the existing report, evidence, and validation pipeline already in the project.</p>
            </div>
          </Card>

          <Card className="bg-white border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-xl bg-rose-100 p-2">
                <ClipboardCheck className="text-rose-600" size={18} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Review Records</h2>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <p>Approved reviews: <strong className="text-gray-900">{approvedReviews}</strong></p>
              <p>Pending review: <strong className="text-gray-900">{pendingReviews}</strong></p>
              <p>Changes requested: <strong className="text-gray-900">{changesRequested}</strong></p>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-white border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-xl bg-cyan-100 p-2">
                <LineChart className="text-cyan-600" size={18} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Learning Analytics</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Tracked Learners</p>
                <p className="text-2xl font-bold text-gray-900">{progressDocs.length}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Achievements Earned</p>
                <p className="text-2xl font-bold text-gray-900">{totalAchievements}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Completed Tutorials</p>
                <p className="text-2xl font-bold text-gray-900">{completedTutorials}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Submitted Labs</p>
                <p className="text-2xl font-bold text-gray-900">{submittedLabs}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p>Average tutorial completion rate: <strong className="text-gray-900">{averageTutorialCompletion.toFixed(1)}%</strong></p>
              <p>Average lab completion rate: <strong className="text-gray-900">{averageLabCompletion.toFixed(1)}%</strong></p>
            </div>
          </Card>

          <Card className="bg-white border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-xl bg-slate-100 p-2">
                <ShieldCheck className="text-slate-700" size={18} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Demo Talking Points</h2>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <p>The project covers virtual labs, concept tutorials, assignments, progress tracking, validation, evidence export, and instructor review in one system.</p>
              <p>The authoring studio now lets teachers/admins add new module definitions through MongoDB instead of hardcoding every new idea.</p>
              <p>The assignment workflow connects those modules directly to students and classes using the existing progress and review data.</p>
              <p>This dashboard is intentionally built from existing project data so it stays useful for viva/demo without creating a second fake reporting system.</p>
            </div>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <Link href="/instructor/assignments">
            <Card className="bg-white border border-gray-100 hover:border-indigo-200">
              <div className="flex items-center gap-3">
                <GraduationCap className="text-indigo-600" size={18} />
                <span className="font-semibold text-gray-900">Assignments</span>
              </div>
            </Card>
          </Link>
          <Link href="/instructor/reviews">
            <Card className="bg-white border border-gray-100 hover:border-amber-200">
              <div className="flex items-center gap-3">
                <ClipboardCheck className="text-amber-700" size={18} />
                <span className="font-semibold text-gray-900">Review Queue</span>
              </div>
            </Card>
          </Link>
          <Link href="/instructor/authoring">
            <Card className="bg-white border border-gray-100 hover:border-blue-200">
              <div className="flex items-center gap-3">
                <FlaskConical className="text-blue-600" size={18} />
                <span className="font-semibold text-gray-900">Authoring Studio</span>
              </div>
            </Card>
          </Link>
          <Link href="/dashboard">
            <Card className="bg-white border border-gray-100 hover:border-emerald-200">
              <div className="flex items-center gap-3">
                <Users className="text-emerald-600" size={18} />
                <span className="font-semibold text-gray-900">Student View</span>
              </div>
            </Card>
          </Link>
        </section>
      </main>
    </div>
  );
}
