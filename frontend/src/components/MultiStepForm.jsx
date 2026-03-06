import { useMemo, useState } from "react";

const steps = [
  {
    title: "Project Profile",
    fields: ["project_name", "building_type"],
  },
  {
    title: "Location",
    fields: ["location"],
  },
  {
    title: "Structure",
    fields: ["structure"],
  },
  {
    title: "Budget",
    fields: ["budget"],
  },
  {
    title: "Targets",
    fields: ["certifications", "notes"],
  },
];

const certificationOptions = [
  "LEED Gold",
  "LEED Platinum",
  "BREEAM Excellent",
  "Living Building Challenge",
  "Passive House",
  "WELL",
];

export function MultiStepForm({ onSubmit, onPreviewClimate, climatePreview, loading }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    project_name: "Harbor Edge Office",
    building_type: "Mixed-use commercial",
    location: "Singapore",
    structure: "Steel composite frame",
    budget: "$14M - $18M",
    certifications: ["LEED Gold", "WELL"],
    notes: "Prioritize low embodied carbon materials without extending schedule beyond 6 months.",
  });

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toggleCertification(value) {
    const current = new Set(form.certifications);
    if (current.has(value)) {
      current.delete(value);
    } else {
      current.add(value);
    }
    updateField("certifications", [...current]);
  }

  function next() {
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function back() {
    setStep((current) => Math.max(current - 1, 0));
  }

  const currentStep = steps[step];

  return (
    <section className="rounded-[40px] glass p-10 shadow-glow xl:p-12 animate-reveal">
      <div className="mb-10 flex items-center justify-between gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent">
            Intake workflow
          </p>
          <h2 className="mt-4 font-heading text-4xl text-white tracking-tight">{currentStep.title}</h2>
        </div>
        <div className="text-right">
          <div className="font-heading text-4xl text-white/10 tracking-tighter">{String(step + 1).padStart(2, "0")}</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Step</div>
        </div>
      </div>

      <div className="mb-12 h-1 overflow-hidden rounded-full bg-white/5">
        <div className="h-full rounded-full bg-accent transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
      </div>

      <div className="space-y-8">
        {step === 0 && (
          <>
            <Field label="Project core name">
              <Input value={form.project_name} onChange={(event) => updateField("project_name", event.target.value)} />
            </Field>
            <Field label="Building typology">
              <Input value={form.building_type} onChange={(event) => updateField("building_type", event.target.value)} />
            </Field>
          </>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <Field label="Global location">
              <Input value={form.location} onChange={(event) => updateField("location", event.target.value)} />
            </Field>
            <button
              type="button"
              onClick={() => onPreviewClimate(form.location)}
              className="group flex items-center gap-3 rounded-full bg-white/5 border border-white/10 px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10 hover:border-accent/40"
            >
              <span>Verify Live Climate</span>
              <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            </button>
            {climatePreview && (
              <div className="rounded-3xl border border-accent/20 bg-accent/5 p-6 animate-reveal">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-accent mb-2">Atmospheric Basis</p>
                <p className="font-heading text-2xl text-white">{climatePreview.location_label}</p>
                <p className="mt-2 text-white/50 leading-relaxed font-medium">
                  {climatePreview.temperature_c}°C avg temperature • Humidity {climatePreview.humidity_pct}%
                </p>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <Field label="Primary structural system">
            <Input value={form.structure} onChange={(event) => updateField("structure", event.target.value)} />
          </Field>
        )}

        {step === 3 && (
          <Field label="Total budget range">
            <Input value={form.budget} onChange={(event) => updateField("budget", event.target.value)} />
          </Field>
        )}

        {step === 4 && (
          <>
            <Field label="Target certifications">
              <div className="flex flex-wrap gap-2">
                {certificationOptions.map((option) => {
                  const active = form.certifications.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleCertification(option)}
                      className={`rounded-full border px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all ${
                        active ? "border-accent bg-accent text-bg" : "border-white/10 text-white/40 hover:border-white/30 hover:text-white"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </Field>
            <Field label="Strategic design brief">
              <textarea
                rows="4"
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                className="w-full rounded-[24px] border border-white/10 bg-white/5 px-6 py-4 text-white outline-none transition-all focus:border-accent focus:bg-white/10"
              />
            </Field>
          </>
        )}
      </div>

      <div className="mt-12 flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="rounded-full border border-white/10 px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-white/40 transition-all hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
        >
          Back
        </button>
        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={next}
            className="rounded-full bg-accent px-10 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-bg transition-all hover:scale-[1.03] active:scale-[0.98]"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSubmit(form)}
            disabled={loading}
            className="rounded-full bg-white px-10 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-bg transition-all hover:scale-[1.03] active:scale-[0.98] disabled:cursor-wait disabled:opacity-50"
          >
            {loading ? "Optimizing Logic..." : "Analyze with Gemini"}
          </button>
        )}
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-4 block text-[10px] font-black uppercase tracking-[0.3em] text-white/30">{label}</span>
      {children}
    </label>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="w-full rounded-full border border-white/10 bg-white/5 px-6 py-4 text-white outline-none transition-all focus:border-accent focus:bg-white/10 placeholder:text-white/20"
    />
  );
}

