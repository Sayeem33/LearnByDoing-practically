import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import AssignmentManager from '@/components/instructor/AssignmentManager';

export default async function InstructorAssignmentsPage() {
  const session = await getServerSession();

  if (!session?.user || !['teacher', 'admin'].includes(session.user.role)) {
    redirect('/login');
  }

  return <AssignmentManager creatorRole={session.user.role as 'teacher' | 'admin'} />;
}
