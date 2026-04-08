import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardDescription, CardTitle } from '@/components/ui/Card';
import { getServerSession } from '@/lib/auth';
import { ClipboardCheck, FlaskConical, Users, BookOpen, PlusCircle } from 'lucide-react';

export default async function InstructorDashboardPage() {
  const session = await getServerSession();
  const isAdmin = session?.user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
            <p className="text-sm text-gray-500">
              Welcome{session?.user?.name ? `, ${session.user.name}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">Student View</Button>
            </Link>
            {isAdmin ? (
              <Link href="/lab/new">
                <Button variant="primary" size="sm" leftIcon={<PlusCircle size={16} />}>
                  Add Experiment
                </Button>
              </Link>
            ) : null}
            <Link href="/logout">
              <Button variant="danger" size="sm">Logout</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-5">
          <Card hover padding="lg">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
              <FlaskConical className="text-blue-600" size={22} />
            </div>
            <CardTitle className="mb-2">Create Lab Session</CardTitle>
            <CardDescription className="mb-4">
              Start and configure a new experiment workspace for your class.
            </CardDescription>
            <Link href="/lab/new">
              <Button className="w-full" variant="primary">Add Experiment</Button>
            </Link>
          </Card>

          {isAdmin ? (
            <Card hover padding="lg">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                <Users className="text-emerald-600" size={22} />
              </div>
              <CardTitle className="mb-2">Manage Students</CardTitle>
              <CardDescription className="mb-4">
                Open student management dashboard for edits, updates, and monitoring.
              </CardDescription>
              <Link href="/students/dashboard">
                <Button className="w-full" variant="outline">Open Students Dashboard</Button>
              </Link>
            </Card>
          ) : (
            <Card hover padding="lg">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                <Users className="text-emerald-600" size={22} />
              </div>
              <CardTitle className="mb-2">Database Permissions</CardTitle>
              <CardDescription className="mb-4">
                Database create, update, and delete operations are restricted to admin role.
              </CardDescription>
              <Button className="w-full" variant="outline" disabled>
                Admin Access Required
              </Button>
            </Card>
          )}

          <Card hover padding="lg">
            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-4">
              <BookOpen className="text-violet-600" size={22} />
            </div>
            <CardTitle className="mb-2">Open Tutorials</CardTitle>
            <CardDescription className="mb-4">
              Review experiment tutorials before delivering practical sessions.
            </CardDescription>
            <Link href="/tutorials">
              <Button className="w-full" variant="outline">Go to Tutorials</Button>
            </Link>
          </Card>

          <Card hover padding="lg">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
              <ClipboardCheck className="text-amber-700" size={22} />
            </div>
            <CardTitle className="mb-2">Review Submissions</CardTitle>
            <CardDescription className="mb-4">
              Open the instructor review queue to inspect reports, validation data, and give feedback.
            </CardDescription>
            <Link href="/instructor/reviews">
              <Button className="w-full" variant="outline">Open Review Queue</Button>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  );
}
