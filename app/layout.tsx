import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import { MorninProvider } from '@/context/MorninContext';
import { AppShell } from '@/components/layout/AppShell';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MORNIN. — Wake Up. Get Ready. Get Going.',
  description:
    'A calmer way to start your day. Personal morning companion for wake-up alarms, daily priorities, breakfast inspiration, and essentials.',
  openGraph: {
    title: 'MORNIN. — Wake Up. Get Ready. Get Going.',
    description:
      'A calmer way to start your day. Personal morning companion for wake-up alarms, daily priorities, breakfast inspiration, and essentials.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MORNIN. — Wake Up. Get Ready. Get Going.',
    description:
      'A calmer way to start your day. Personal morning companion for wake-up alarms, daily priorities, breakfast inspiration, and essentials.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={manrope.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <MorninProvider>
          <AppShell>{children}</AppShell>
        </MorninProvider>
      </body>
    </html>
  );
}
