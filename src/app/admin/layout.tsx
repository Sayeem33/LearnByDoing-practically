import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== 'admin') {
    if (session.user.role === 'teacher') {
      redirect('/instructor/dashboard');
    }

    redirect('/dashboard');
  }

  return <>{children}</>;
}
