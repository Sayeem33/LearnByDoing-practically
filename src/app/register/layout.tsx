import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';

export default async function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (session) {
    if (session.user.role === 'admin') {
      redirect('/admin/dashboard');
    }

    if (session.user.role === 'teacher') {
      redirect('/instructor/dashboard');
    }

    redirect('/dashboard');
  }

  return <>{children}</>;
}
