import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = (current / total) * 100;

  return (
    <div className="h-1 w-full bg-slate-200/60 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-emerald-700 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      />
    </div>
  );
}
