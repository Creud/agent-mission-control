export default function Home() {
  const agents = [
    { name: "main", status: "idle", lastSeen: "just now" },
    { name: "research", status: "running", lastSeen: "2m ago" },
    { name: "ops", status: "idle", lastSeen: "10m ago" },
  ];

  const tiles = [
    { title: "Inbox", desc: "Unread + urgent pings" },
    { title: "Runs", desc: "Recent jobs + failures" },
    { title: "Notes", desc: "Scratchpad + decisions" },
    { title: "Links", desc: "Docs, repos, dashboards" },
  ];

  return (
    <main className="min-h-screen p-6 bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">Mission Control</h1>
          <p className="text-neutral-400">Your virtual office for agents.</p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 md:col-span-2">
            <h2 className="text-lg font-medium">Agents</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {agents.map((a) => (
                <div
                  key={a.name}
                  className="rounded-lg border border-neutral-800 bg-neutral-950 p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{a.name}</div>
                    <span
                      className={
                        "text-xs rounded-full px-2 py-1 border " +
                        (a.status === "running"
                          ? "border-emerald-700 text-emerald-300"
                          : "border-neutral-700 text-neutral-300")
                      }
                    >
                      {a.status}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-neutral-400">
                    last seen: {a.lastSeen}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <h2 className="text-lg font-medium">Today</h2>
            <ul className="mt-3 space-y-2 text-sm text-neutral-300">
              <li>• Review failures</li>
              <li>• Triage inbox</li>
              <li>• Ship one improvement</li>
            </ul>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {tiles.map((t) => (
            <div
              key={t.title}
              className="rounded-xl border border-neutral-800 bg-neutral-900 p-4"
            >
              <div className="font-medium">{t.title}</div>
              <div className="mt-2 text-sm text-neutral-400">{t.desc}</div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
