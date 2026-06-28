import { useMemo, useState } from "react";

export default function Home() {
  const [token, setToken] = useState("");
  const [projectName, setProjectName] = useState("");
  const [status, setStatus] = useState("Ready.");
  const [projects, setProjects] = useState([]);
  const [deploying, setDeploying] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [log, setLog] = useState(
    "Welcome. Masukkan Vercel API Token lalu klik Load Projects atau Deploy."
  );

  const stats = useMemo(
    () => [
      { label: "Token", value: token ? "Loaded" : "Empty" },
      { label: "Projects", value: projects.length.toString() },
      { label: "State", value: deploying ? "Deploying" : "Idle" }
    ],
    [token, projects.length, deploying]
  );

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      setStatus("Loading projects...");
      setLog("Fetching projects from Vercel API...");
      const res = await fetch("/api/projects", {
        headers: { "x-vercel-token": token }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load projects");
      setProjects(data.projects || []);
      setSelectedProject(data.projects?.[0]?.name || "");
      setLog(JSON.stringify(data, null, 2));
      setStatus("Projects loaded.");
    } catch (error) {
      setStatus("Error");
      setLog(String(error.message || error));
    } finally {
      setLoadingProjects(false);
    }
  };

  const deploySample = async () => {
    try {
      setDeploying(true);
      setStatus("Deploying...");
      setLog("Preparing deployment payload...");

      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-vercel-token": token
        },
        body: JSON.stringify({
          name: selectedProject || projectName,
          files: [
            {
              file: "index.html",
              data: btoa(
                `<!doctype html><html><body style="font-family:Arial;background:#0b1020;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh"><div><h1>Hello from Vercel Deployer</h1><p>Deployed successfully.</p></div></body></html>`
              ),
              encoding: "base64"
            }
          ]
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Deploy failed");
      setLog(JSON.stringify(data, null, 2));
      setStatus("Deployment created.");
    } catch (error) {
      setStatus("Error");
      setLog(String(error.message || error));
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b18] text-slate-100">
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #070b18; }
        .glass {
          background: rgba(12, 17, 34, 0.72);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          border: 1px solid rgba(148, 163, 184, 0.14);
          box-shadow: 0 30px 80px rgba(0,0,0,0.35);
        }
        .glow {
          position: absolute;
          inset: auto;
          border-radius: 9999px;
          filter: blur(80px);
          opacity: .35;
          pointer-events: none;
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="glow left-[-120px] top-[-120px] h-72 w-72 bg-violet-600" />
        <div className="glow right-[-120px] top-[120px] h-72 w-72 bg-cyan-500" />
        <div className="glow bottom-[-140px] left-[20%] h-96 w-96 bg-fuchsia-500" />
      </div>

      <div className="relative flex min-h-screen">
        <aside className="hidden w-24 flex-col items-center border-r border-white/10 bg-black/20 py-6 md:flex">
          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-black font-bold">
            V
          </div>
          <div className="mb-3 h-2 w-2 rounded-full bg-cyan-400" />
          <div className="mb-3 h-2 w-2 rounded-full bg-violet-400" />
          <div className="mb-3 h-2 w-2 rounded-full bg-slate-500" />
          <div className="mb-3 h-2 w-2 rounded-full bg-emerald-400" />
        </aside>

        <main className="flex-1">
          <header className="glass flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Vercel Deployer
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Dark dashboard to deploy and monitor projects
              </p>
            </div>
            <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
              {status}
            </div>
          </header>

          <section className="grid gap-6 p-6 xl:grid-cols-3">
            <div className="xl:col-span-2 space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                {stats.map((item) => (
                  <div
                    key={item.label}
                    className="glass rounded-3xl p-5 transition hover:-translate-y-1"
                  >
                    <p className="text-sm text-slate-400">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="glass rounded-3xl p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Deploy Panel</h2>
                    <p className="text-sm text-slate-400">
                      Input token, load projects, lalu deploy.
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                    Next.js ready
                  </div>
                </div>

                <div className="grid gap-4">
                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      Vercel API Token
                    </label>
                    <input
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="vrl_..."
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-violet-400"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm text-slate-400">
                        Project Name
                      </label>
                      <input
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="my-project"
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-violet-400"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm text-slate-400">
                        Selected Project
                      </label>
                      <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 outline-none focus:border-violet-400"
                      >
                        <option value="">Choose project</option>
                        {projects.map((p) => (
                          <option key={p.id} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={loadProjects}
                      disabled={loadingProjects || !token}
                      className="rounded-2xl bg-white/10 px-5 py-3 font-medium text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loadingProjects ? "Loading..." : "Load Projects"}
                    </button>
                    <button
                      onClick={deploySample}
                      disabled={deploying || !token}
                      className="rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deploying ? "Deploying..." : "Deploy Sample"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="glass rounded-3xl p-6">
                <h3 className="mb-4 text-lg font-semibold">Projects</h3>
                <div className="space-y-3">
                  {projects.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-5 text-sm text-slate-400">
                      Belum ada project. Masukkan token lalu klik Load Projects.
                    </div>
                  ) : (
                    projects.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3"
                      >
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-slate-400">{p.id}</p>
                        </div>
                        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                          ready
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="glass rounded-3xl p-6">
              <h3 className="mb-4 text-lg font-semibold">Live Log</h3>
              <pre className="min-h-[420px] overflow-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/40 p-4 text-xs leading-6 text-cyan-300">
                {log}
              </pre>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
