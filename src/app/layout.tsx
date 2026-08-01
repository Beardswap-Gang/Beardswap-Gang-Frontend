import type { Metadata } from 'next';
import { ToastProvider } from '@/components/Toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'beardswap Gang DAO — Governance',
  description: 'Governance dashboard and voting interface for the beardswap Gang DAO.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-900">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
