export default function AgentTrace({ steps }: { steps: string[] }) {
  if (!steps.length) return null;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/50 p-6 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500" />
          </span>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Agent Reasoning Trace
          </h2>
        </div>
        <span className="rounded-full border border-slate-800 bg-slate-800/40 px-2.5 py-0.5 text-[10px] font-mono text-slate-400">
          {steps.length} Steps Completed
        </span>
      </div>

      <ol className="mt-5 space-y-3.5">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-[11px] font-semibold text-cyan-400 border border-cyan-500/20">
              ✓
            </div>
            <span className="leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
