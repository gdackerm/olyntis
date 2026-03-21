import { useEffect, useRef } from "react";

interface InterestStepProps {
  interest: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  submitting: boolean;
  error: string | null;
}

export function InterestStep({ interest, onChange, onSubmit, onBack, submitting, error }: InterestStepProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Anything else?</h2>
        <p className="text-slate-500 mt-1">Tell us what you're interested in, or just hit submit.</p>
      </div>

      <textarea
        ref={ref}
        rows={4}
        placeholder="E.g. we're looking at replacing our current EHR..."
        value={interest}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-300 bg-white/70 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/40 focus:border-emerald-700 resize-none"
      />

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          &larr; Back
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 transition-colors rounded-lg text-white px-6 py-2.5 font-medium"
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
}
