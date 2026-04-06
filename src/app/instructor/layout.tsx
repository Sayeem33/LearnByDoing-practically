import { redirect } from 'next/navigation';
import { getServerSession, isPrivilegedRole } from '@/lib/auth';

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  if (!isPrivilegedRole(session.user.role)) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
