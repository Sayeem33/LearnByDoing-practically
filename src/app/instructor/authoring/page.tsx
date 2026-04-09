import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import AuthoringStudio from '@/components/instructor/AuthoringStudio';

export default async function InstructorAuthoringPage() {
  const session = await getServerSession();

  if (!session?.user || !['teacher', 'admin'].includes(session.user.role)) {
    redirect('/login');
  }

  return <AuthoringStudio creatorRole={session.user.role as 'teacher' | 'admin'} />;
}
