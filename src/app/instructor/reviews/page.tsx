import { redirect } from 'next/navigation';
import ReviewQueue from '@/components/instructor/ReviewQueue';
import { getServerSession } from '@/lib/auth';

export default async function InstructorReviewsPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== 'teacher' && session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  return <ReviewQueue />;
}
