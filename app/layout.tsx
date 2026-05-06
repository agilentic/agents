import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Hermes — Career Transition Platform',
  description: 'AI-powered job discovery, CV optimisation, and auto-apply',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
