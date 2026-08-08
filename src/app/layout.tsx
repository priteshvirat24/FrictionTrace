import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

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
        <meta name="theme-color" content="#06080f" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <div className="page-container">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
