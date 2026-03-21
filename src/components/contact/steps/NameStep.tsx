import { useEffect, useRef } from "react";

interface NameStepProps {
  firstName: string;
  lastName: string;
  onChange: (field: "firstName" | "lastName", value: string) => void;
  onNext: () => void;
}

export function NameStep({ firstName, lastName, onChange, onNext }: NameStepProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const valid = firstName.trim() !== "" && lastName.trim() !== "";

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && valid) onNext();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">What's your name?</h2>
        <p className="text-slate-500 mt-1">Let us know who we're talking to.</p>
      </div>

      <div className="flex gap-3">
        <input
          ref={ref}
          type="text"
          placeholder="First name"
          value={firstName}
          onChange={(e) => onChange("firstName", e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 rounded-lg border border-slate-300 bg-white/70 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/40 focus:border-emerald-700"
        />
        <input
          type="text"
          placeholder="Last name"
          value={lastName}
          onChange={(e) => onChange("lastName", e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 rounded-lg border border-slate-300 bg-white/70 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/40 focus:border-emerald-700"
        />
      </div>

      <button
        onClick={onNext}
        disabled={!valid}
        className="self-end bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-lg text-white px-6 py-2.5 font-medium"
      >
        Continue
      </button>
    </div>
  );
}
