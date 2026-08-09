import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar'; // Still called Sidebar internally, but acts as Navigation

export const metadata: Metadata = {
  title: 'FrictionTrace — Stop measuring the child. Start measuring the friction.',
  description:
    'A student-controlled AI accessibility layer that discovers where school is creating friction and turns those moments into actionable accommodation evidence.',
  keywords: ['accessibility', 'neurodiversity', 'accommodation', 'student', 'friction', 'school'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#FAF0E8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body>
        <Sidebar />
        <main style={{ minHeight: '100vh', width: '100%' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
