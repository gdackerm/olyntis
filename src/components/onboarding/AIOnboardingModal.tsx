import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import { IconSparkles, IconX } from '@tabler/icons-react';
import { OnboardingClipCarousel } from './OnboardingClipCarousel';

interface AIOnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

export function AIOnboardingModal({ open, onClose }: AIOnboardingModalProps) {
  const navigate = useNavigate();

  // Escape key to close
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  function handleCTA() {
    navigate('/consult');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-[520px] bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Carousel */}
        <OnboardingClipCarousel />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-[calc(56.25%+24px+12px)] right-3 p-1.5 rounded-full text-[var(--oly-stone-dark)] hover:bg-black/5 transition-colors"
        >
          <IconX size={18} />
        </button>

        {/* Content */}
        <div className="px-8 pt-5 pb-8">
          <h2 className="flex items-center gap-2 text-xl font-semibold font-[Lora] text-[var(--oly-charcoal)]">
            <IconSparkles size={22} className="text-[var(--oly-ai-glow)]" />
            A new way to start your day
          </h2>

          <p className="mt-3 text-[15px] leading-relaxed text-[var(--oly-ink)] font-['DM_Sans']">
            Describe what you need — charts reviewed, risks flagged, care plans
            drafted. Your AI co-pilot handles the rest.
          </p>

          <button
            onClick={handleCTA}
            className="mt-6 w-full py-3 rounded-lg text-white font-semibold text-[15px]
              bg-gradient-to-r from-[var(--oly-forest)] to-[var(--oly-forest-light)]
              hover:shadow-[0_4px_20px_rgba(109,181,160,0.35)] transition-shadow duration-200"
          >
            Start with AI
          </button>
        </div>
      </motion.div>
    </div>
  );
}
