import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { ProgressBar } from "./ProgressBar";
import { NameStep } from "./steps/NameStep";
import { EmailStep } from "./steps/EmailStep";
import { RoleStep } from "./steps/RoleStep";
import { OrganizationStep } from "./steps/OrganizationStep";
import { InterestStep } from "./steps/InterestStep";
import { ThankYouStep } from "./steps/ThankYouStep";

interface ContactFormModalProps {
  open: boolean;
  onClose: () => void;
}

const TOTAL_STEPS = 5;

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  orgName: string;
  bedCount: string;
  interest: string;
}

const INITIAL_DATA: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  role: "",
  orgName: "",
  bedCount: "",
  interest: "",
};

export function ContactFormModal({ open, onClose }: ContactFormModalProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const [data, setData] = useState<FormData>(INITIAL_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Reset everything when modal closes
  useEffect(() => {
    if (!open) {
      // Small delay so the close animation finishes before resetting
      const t = setTimeout(() => {
        setStep(0);
        setDirection(1);
        setData(INITIAL_DATA);
        setSubmitting(false);
        setError(null);
        setSubmitted(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Escape to close
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const updateField = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]) => {
      setData((d) => ({ ...d, [field]: value }));
    },
    []
  );

  const handleRoleSelect = useCallback(
    (role: string) => {
      setData((d) => ({ ...d, role }));
      // Auto-advance after brief visual feedback
      setTimeout(() => {
        setDirection(1);
        setStep(3);
      }, 200);
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase
      .from("contact_submissions")
      .insert({
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        email: data.email.trim(),
        role: data.role,
        organization_name: data.orgName.trim() || null,
        bed_count: data.bedCount.trim() || null,
        interest: data.interest.trim() || null,
      });

    setSubmitting(false);

    if (insertError) {
      setError("Something went wrong. Please try again.");
      return;
    }

    setSubmitted(true);
    setDirection(1);
    setStep(TOTAL_STEPS);
  }, [data]);

  if (!open) return null;

  const slideVariants = {
    enter: (dir: number) => ({ x: dir * 80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir * -80, opacity: 0 }),
  };

  const currentStep = submitted ? TOTAL_STEPS : step;

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
        className="relative w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Progress bar */}
        {currentStep < TOTAL_STEPS && (
          <ProgressBar current={currentStep + 1} total={TOTAL_STEPS} />
        )}

        {/* Step content */}
        <div className="p-8 min-h-[280px] flex flex-col justify-center overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {currentStep === 0 && (
                <NameStep
                  firstName={data.firstName}
                  lastName={data.lastName}
                  onChange={updateField}
                  onNext={goNext}
                />
              )}
              {currentStep === 1 && (
                <EmailStep
                  email={data.email}
                  onChange={(v) => updateField("email", v)}
                  onNext={goNext}
                  onBack={goBack}
                />
              )}
              {currentStep === 2 && (
                <RoleStep
                  role={data.role}
                  onSelect={handleRoleSelect}
                  onBack={goBack}
                />
              )}
              {currentStep === 3 && (
                <OrganizationStep
                  orgName={data.orgName}
                  bedCount={data.bedCount}
                  onChange={updateField}
                  onNext={goNext}
                  onBack={goBack}
                />
              )}
              {currentStep === 4 && (
                <InterestStep
                  interest={data.interest}
                  onChange={(v) => updateField("interest", v)}
                  onSubmit={handleSubmit}
                  onBack={goBack}
                  submitting={submitting}
                  error={error}
                />
              )}
              {currentStep === TOTAL_STEPS && (
                <ThankYouStep firstName={data.firstName} onClose={onClose} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
