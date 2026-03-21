interface ThankYouStepProps {
  firstName: string;
  onClose: () => void;
}

export function ThankYouStep({ firstName, onClose }: ThankYouStepProps) {
  return (
    <div className="flex flex-col gap-6 items-center text-center py-4">
      <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
        <svg className="w-7 h-7 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Thanks, {firstName}!
        </h2>
        <p className="text-slate-500 mt-2 max-w-sm">
          We've received your info and will be in touch soon. We're excited to
          show you what Olyntis AI can do for your facility.
        </p>
      </div>

      <button
        onClick={onClose}
        className="bg-emerald-700 hover:bg-emerald-800 transition-colors rounded-lg text-white px-6 py-2.5 font-medium"
      >
        Back to Home
      </button>
    </div>
  );
}
