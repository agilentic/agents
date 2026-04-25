import type { ReactNode } from 'react';

export default function HermesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      <aside className="w-56 shrink-0 border-r border-gray-800 p-6 flex flex-col gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
            Agent Network
          </p>
          <h1 className="text-xl font-bold">Hermes</h1>
        </div>
        <nav className="flex flex-col gap-1 text-sm">
          <a
            href="/hermes"
            className="rounded-md px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            Dashboard
          </a>
          <a
            href="/hermes/agents"
            className="rounded-md px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            Agents
          </a>
          <a
            href="/hermes/routes"
            className="rounded-md px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            Routes
          </a>
          <a
            href="/tracker"
            className="rounded-md px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            Tracker
          </a>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
