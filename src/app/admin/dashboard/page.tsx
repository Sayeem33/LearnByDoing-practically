import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardDescription, CardTitle } from '@/components/ui/Card';
import { getServerSession } from '@/lib/auth';
import { Database, Users, BookOpen, ShieldAlert, PlusCircle } from 'lucide-react';

export default async function AdminDashboardPage() {
  const session = await getServerSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-cyan-50">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Database Console</h1>
            <p className="text-sm text-gray-500">
              Welcome{session?.user?.name ? `, ${session.user.name}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/students/dashboard">
              <Button variant="outline" size="sm" leftIcon={<Users size={16} />}>
                Manage Students
              </Button>
            </Link>
            <Link href="/lab/new">
              <Button variant="primary" size="sm" leftIcon={<PlusCircle size={16} />}>
                Add Experiment
              </Button>
            </Link>
            <Link href="/logout">
              <Button variant="danger" size="sm">Logout</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-5">
          <Card hover padding="lg">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
              <Database className="text-emerald-700" size={22} />
            </div>
            <CardTitle className="mb-2">Database Operations</CardTitle>
            <CardDescription>
              All create, update, and delete database operations are restricted to admin.
            </CardDescription>
          </Card>

          <Card hover padding="lg">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
              <Users className="text-blue-700" size={22} />
            </div>
            <CardTitle className="mb-2">Student Records</CardTitle>
            <CardDescription className="mb-4">
              Create, edit, and remove student accounts and profile records.
            </CardDescription>
            <Link href="/students/dashboard">
              <Button className="w-full" variant="outline">Open Student Records</Button>
            </Link>
          </Card>

          <Card hover padding="lg">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
              <BookOpen className="text-amber-700" size={22} />
            </div>
            <CardTitle className="mb-2">Content Governance</CardTitle>
            <CardDescription className="mb-4">
              Manage experiment tutorials and core learning content with admin control.
            </CardDescription>
            <Link href="/tutorials">
              <Button className="w-full" variant="outline">Open Tutorials</Button>
            </Link>
          </Card>
        </div>

        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <ShieldAlert className="text-amber-700 mt-0.5" size={18} />
          <p className="text-sm text-amber-900">
            Security policy: database write operations are admin-only. Teachers and students have read-limited access.
          </p>
        </div>
      </main>
    </div>
  );
}
