import { useEffect, useMemo, useState } from "react";
import { Route, Routes, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChatWidget } from "./components/ChatWidget";
import { MultiStepForm } from "./components/MultiStepForm";
import { ProcessingScreen } from "./components/ProcessingScreen";
import { ResultsDashboard } from "./components/ResultsDashboard";
import { api } from "./lib/api";

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-white">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/results/:slug" element={<ResultsPage />} />
      </Routes>
    </div>
  );
}

function LandingPage() {
  const navigate = useNavigate();
  const [climatePreview, setClimatePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleClimatePreview(location) {
    try {
      const data = await api.climate(location);
      setClimatePreview(data);
    } catch (error) {
      setClimatePreview(null);
    }
  }

  async function handleSubmit(form) {
    setLoading(true);
    try {
      const response = await api.analyze(form);
      navigate(`/results/${response.slug}?job=${response.job_id}`);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Failed to start analysis. Please ensure the backend is running at " + api.base + "\n\nError: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative overflow-hidden">
      <Backdrop />
      <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-8 md:px-8 lg:px-10">
        <header className="flex items-center justify-between py-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-accent flex items-center justify-center font-heading font-bold text-bg">G</div>
            <div>
              <p className="font-heading text-xl text-white tracking-tight">GreenBuild AI</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">Carbon Intelligence</p>
            </div>
          </div>
          <a
            href="#builder"
            className="rounded-full bg-white/5 border border-white/10 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-white/10 hover:border-white/20 active:scale-[0.98]"
          >
            Start Project
          </a>
        </header>

        <section className="grid gap-16 py-20 xl:grid-cols-[1.1fr,0.9fr] xl:items-center">
          <div className="animate-reveal">
            <div className="inline-flex rounded-full border border-accent/20 bg-accent/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.4em] text-accent">
              Gemini 1.5 Pro + Climate Engine
            </div>
            <h1 className="mt-8 max-w-4xl font-heading text-6xl leading-[1.05] text-white md:text-8xl tracking-tighter">
              Sustainable <span className="text-accent">logic</span> rendered as a live system.
            </h1>
            <p className="mt-10 max-w-2xl text-xl leading-relaxed text-white/50">
              GreenBuild AI turns a simple intake into high-performance material options, carbon impact tracking, and delivery implications in seconds.
            </p>

            <div className="mt-16 grid gap-6 md:grid-cols-3">
              <FeatureCard title="Component Matrix" text="10+ systems ranked with ranked green alternatives." />
              <FeatureCard title="Climate Sync" text="Direct integration with live environmental data." />
              <FeatureCard title="Carbon Index" text="Materialized embodied carbon reduction tracking." />
            </div>
          </div>

          <div className="relative animate-reveal animation-delay-200">
            <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-accent/10 blur-[120px]" />
            <div className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-emerald-500/10 blur-[120px]" />
            <div className="relative rounded-[48px] glass p-10 shadow-glow">
              <div className="grid gap-6">
                {[
                  ["Carbon Logic", "-31.4%", "Lifecycle saving"],
                  ["Budget Shift", "+4.8%", "Premium offset"],
                  ["ISC Score", "84.6", "Sustainability rank"],
                ].map(([label, value, sub]) => (
                  <div key={label} className="group rounded-[32px] bg-white/5 border border-white/5 p-8 transition-all hover:bg-white/10">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">{label}</p>
                    <p className="mt-4 font-heading text-5xl text-white tracking-tighter group-hover:text-accent transition-colors">{value}</p>
                    <p className="mt-1 text-[11px] font-bold text-white/30 truncate">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="builder" className="grid gap-10 xl:grid-cols-[0.8fr,1.2fr] xl:items-start">
          <div className="pt-4">
            <p className="text-xs uppercase tracking-[0.35em] text-accent/70">Workflow</p>
            <h2 className="mt-4 font-heading text-4xl text-white">Capture the project. Let Gemini structure the sustainable path.</h2>
            <p className="mt-5 max-w-xl text-white/60">
              The backend enriches your form with climate data, generates a structured alternatives matrix, stores the result locally, and makes it available for dashboards, PDFs, and chat.
            </p>
          </div>

          <MultiStepForm
            climatePreview={climatePreview}
            loading={loading}
            onPreviewClimate={handleClimatePreview}
            onSubmit={handleSubmit}
          />
        </section>
      </div>
    </main>
  );
}

function ResultsPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("job");
  const [result, setResult] = useState(null);
  const [job, setJob] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let intervalId;

    async function loadResult() {
      try {
        const data = await api.results(slug);
        if (!active) {
          return;
        }
        setResult(data);
        setSelectedComponent(data.components[0]?.component || "");
        setChatHistory(data.chat_history || []);
      } catch (loadError) {
        if (!jobId) {
          if (active) {
            setError("Result not found.");
          }
          return;
        }

        intervalId = window.setInterval(async () => {
          try {
            const status = await api.status(jobId);
            if (!active) {
              return;
            }
            setJob(status);
            if (status.status === "completed") {
              window.clearInterval(intervalId);
              const resolved = await api.results(slug);
              if (!active) {
                return;
              }
              setResult(resolved);
              setSelectedComponent(resolved.components[0]?.component || "");
              setChatHistory(resolved.chat_history || []);
            }
            if (status.status === "failed") {
              window.clearInterval(intervalId);
              setError(status.error || "Analysis failed.");
            }
          } catch (statusError) {
            window.clearInterval(intervalId);
            setError("Status polling failed.");
          }
        }, 2500);
      }
    }

    loadResult();

    return () => {
      active = false;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [jobId, slug]);

  const processingLocation = useMemo(() => job?.request?.location || "your selected location", [job]);

  function appendChat(message, replaceLast = false) {
    setChatHistory((current) => {
      if (replaceLast) {
        return [...current.slice(0, -1), message];
      }
      return [...current, message];
    });
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-8 md:px-8 lg:px-10 animate-reveal">
      <Backdrop />
      <div className="relative mx-auto max-w-7xl">
        {error && (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-200">
            {error}
          </div>
        )}

        {!error && !result && <ProcessingScreen jobStatus={job?.status} location={processingLocation} />}

        {result && (
          <>
            <ResultsDashboard
              result={result}
              selectedComponent={selectedComponent}
              onSelectComponent={setSelectedComponent}
            />
            <ChatWidget
              apiBase={api.base}
              history={chatHistory}
              onAppend={appendChat}
              slug={result.slug}
            />
          </>
        )}
      </div>
    </main>
  );
}

function FeatureCard({ title, text }) {
  return (
    <div className="rounded-[32px] glass p-8 hover-lift cursor-default group transition-all">
      <div className="h-0.5 w-6 bg-accent/40 group-hover:w-10 transition-all mb-6" />
      <p className="font-heading text-xl text-white tracking-tight">{title}</p>
      <p className="mt-4 text-sm leading-relaxed text-white/40">{text}</p>
    </div>
  );
}

function Backdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-[-10%] top-[-10%] h-80 w-80 rounded-full bg-accent/12 blur-3xl" />
      <div className="absolute right-[-8%] top-[15%] h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="absolute bottom-[-15%] left-[25%] h-96 w-96 rounded-full bg-lime-500/10 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] opacity-[0.16]" />
    </div>
  );
}

