import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IconFileSearch, IconNotes, IconPill } from '@tabler/icons-react';
import type { ComponentType } from 'react';

interface Clip {
  id: string;
  title: string;
  description: string;
  Icon: ComponentType<{ size?: number; stroke?: number; className?: string }>;
}

const CLIPS: Clip[] = [
  {
    id: 'chart-prep',
    title: 'AI Chart Prep',
    description: 'Every record reviewed before you walk in',
    Icon: IconFileSearch,
  },
  {
    id: 'note-drafting',
    title: 'Smart Note Drafting',
    description: 'Describe what happened, AI writes the note',
    Icon: IconNotes,
  },
  {
    id: 'treatment-lookup',
    title: 'Treatment Lookup',
    description: 'Drug interactions, guidelines, protocols — just ask',
    Icon: IconPill,
  },
];

export function OnboardingClipCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % CLIPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const clip = CLIPS[activeIndex];

  return (
    <div>
      {/* Clip area — 16:9 aspect ratio */}
      <div className="relative aspect-video overflow-hidden rounded-t-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={clip.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1a2e28] to-[#2d5449]"
          >
            {/* Shimmer overlay */}
            <motion.div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 55%, transparent 60%)',
                backgroundSize: '200% 100%',
              }}
              animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />

            <clip.Icon size={48} stroke={1.4} className="text-white/90 mb-3" />
            <p className="text-white text-lg font-semibold font-[Lora]">{clip.title}</p>
            <p className="text-white/60 text-sm mt-1">{clip.description}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 py-3 bg-gradient-to-br from-[#1a2e28] to-[#2d5449]">
        {CLIPS.map((c, i) => (
          <button
            key={c.id}
            onClick={() => setActiveIndex(i)}
            aria-label={`Show ${c.title}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === activeIndex
                ? 'w-5 bg-[var(--oly-ai-glow)]'
                : 'w-2 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
