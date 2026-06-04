import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Model Pricing Dashboard — Real-time LLM Cost Intelligence',
  description:
    'Compare token pricing, benchmark quality scores, and cost-adjusted efficiency across 28+ large language models from OpenAI, Anthropic, Google, Mistral, Meta, DeepSeek, Cohere, and Microsoft.',
  keywords: ['AI pricing', 'LLM cost', 'GPT pricing', 'Claude pricing', 'Gemini pricing', 'token cost calculator'],
  openGraph: {
    title: 'AI Model Pricing Dashboard',
    description: 'Find your model\'s sweet spot — cost, quality, and efficiency in one view.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-[#060814] text-slate-100 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
