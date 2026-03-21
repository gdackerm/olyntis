import { cn } from "@/lib/utils";

const ROLES = ["CEO", "CFO", "CIO", "Clinical Director", "IT Director", "Other"];

interface RoleStepProps {
  role: string;
  onSelect: (role: string) => void;
  onBack: () => void;
}

export function RoleStep({ role, onSelect, onBack }: RoleStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">What's your role?</h2>
        <p className="text-slate-500 mt-1">Select the one that best describes you.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {ROLES.map((r) => (
          <button
            key={r}
            onClick={() => onSelect(r)}
            className={cn(
              "rounded-full px-5 py-2.5 text-sm font-medium border transition-colors",
              role === r
                ? "bg-emerald-700 text-white border-emerald-700"
                : "bg-white/60 text-slate-700 border-slate-300 hover:border-emerald-700/50"
            )}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          &larr; Back
        </button>
        <div />
      </div>
    </div>
  );
}
