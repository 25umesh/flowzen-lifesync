import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster"
import { Sidebar, MobileSidebar } from '@/components/sidebar';

export const metadata: Metadata = {
  title: 'FlowZen',
  description: 'Organize your life, seamlessly.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased', 'min-h-screen bg-background')}>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <header className="flex h-14 items-center gap-4 border-b bg-card px-4 md:px-6 md:hidden">
              <MobileSidebar />
            </header>
            {children}
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
