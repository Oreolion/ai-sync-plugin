import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'ai-sync Dashboard',
  description: 'Team handoff synchronization analytics',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-muted/40 text-foreground antialiased">
        <div className="flex min-h-screen">
          {/* Sidebar navigation */}
          <aside className="hidden w-64 shrink-0 border-r border-border bg-background md:block">
            <div className="flex h-14 items-center border-b border-border px-6">
              <Link href="/" className="text-lg font-bold tracking-tight">
                ai-sync
              </Link>
            </div>
            <nav className="space-y-1 p-4">
              <Link
                href="/"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
                Projects
              </Link>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-auto">
            <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
