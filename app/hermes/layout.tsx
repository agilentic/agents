import type { ReactNode } from 'react';

const NAV: { section: string; items: { label: string; href: string }[] }[] = [
  {
    section: 'Platform',
    items: [
      { label: 'Home', href: '/' },
      { label: 'Jobs', href: '/jobs' },
      { label: 'Applications', href: '/applications' },
    ],
  },
  {
    section: 'AI Agents',
    items: [{ label: 'Hermes Studio', href: '/hermes' }],
  },
  {
    section: 'Career',
    items: [
      { label: 'Career Plan', href: '/career' },
      { label: 'Tracker', href: '/tracker' },
      { label: 'Trading', href: '/trading' },
    ],
  },
];

export default function HermesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      <aside className="w-56 shrink-0 border-r border-gray-800 bg-gray-900 flex flex-col">
        <div className="px-5 py-5 border-b border-gray-800">
          <a href="/" className="no-underline">
            <p className="text-base font-semibold text-white">Hermes</p>
            <p className="text-xs text-indigo-400 mt-0.5">Agent Network</p>
          </a>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV.map(({ section, items }) => (
            <div key={section} className="mb-5">
              <p className="px-5 mb-1 text-xs font-semibold uppercase tracking-widest text-gray-500">
                {section}
              </p>
              {items.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block px-5 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
