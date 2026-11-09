export default function AgentTrace({ steps }: { steps: string[] }) {
  if (!steps.length) return null;
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Agent activity</h2>
      <ol className="mt-3 space-y-2 text-sm text-slate-700">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-emerald-600">✓</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
