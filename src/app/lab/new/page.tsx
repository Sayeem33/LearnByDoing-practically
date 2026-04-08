import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import NewLabSessionForm from '@/components/lab/NewLabSessionForm';

export default async function NewLabSessionPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== 'teacher' && session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  return <NewLabSessionForm creatorRole={session.user.role} />;
}
