import { useEffect, useRef } from "react";

interface EmailStepProps {
  email: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailStep({ email, onChange, onNext, onBack }: EmailStepProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const valid = EMAIL_RE.test(email);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && valid) onNext();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">What's your email?</h2>
        <p className="text-slate-500 mt-1">We'll use this to follow up with you.</p>
      </div>

      <input
        ref={ref}
        type="email"
        placeholder="you@hospital.org"
        value={email}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="rounded-lg border border-slate-300 bg-white/70 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/40 focus:border-emerald-700"
      />

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          &larr; Back
        </button>
        <button
          onClick={onNext}
          disabled={!valid}
          className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-lg text-white px-6 py-2.5 font-medium"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
