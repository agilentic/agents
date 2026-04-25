export default function HomePage() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Agentic Automation Hub</h1>
      <p>Available control rooms:</p>
      <ul className="list-disc pl-6">
        <li><a className="text-blue-600 underline" href="/hermes">Hermes Autoresearch Studio</a></li>
        <li><a className="text-blue-600 underline" href="/trading">LLM Trading Cockpit</a></li>
        <li><a className="text-blue-600 underline" href="/tracker">Application Tracker</a></li>
      </ul>
    </main>
  );
}
