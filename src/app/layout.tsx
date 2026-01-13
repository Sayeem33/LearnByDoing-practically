import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SimuLab - Virtual Science Laboratory',
  description: 'Interactive physics and chemistry simulations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}