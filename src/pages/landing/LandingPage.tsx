"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { useNavigate } from "react-router";
import { ContactFormModal } from "@/components/contact/ContactFormModal";

export function LandingPage() {
  const navigate = useNavigate();
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-6 items-center justify-center px-4 max-w-4xl mx-auto text-center"
      >
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-emerald-700 flex items-center justify-center">
            <span className="text-white font-bold text-xl">O</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            Olyntis AI
          </span>
        </div>

        {/* Tagline */}
        <p className="font-light text-xl md:text-3xl text-slate-500 italic max-w-2xl leading-relaxed">
          Feel like you&rsquo;re drowning in tasks that aren&rsquo;t improving
          patient outcomes or revenue?
        </p>

        {/* Headline */}
        <h1 className="text-4xl md:text-7xl font-bold text-slate-900 leading-tight">
          The AI-Native EHR{" "}
          <br className="hidden md:block" />
          <span className="text-emerald-700">Built for Rural Hospitals</span>
        </h1>

        {/* Subheadline */}
        <p className="font-light text-lg md:text-2xl text-slate-600 max-w-2xl leading-relaxed">
          Payer rules embedded in clinical workflows. Denial prevention at the
          point of care. Offline-first for the communities that need it most.
        </p>

        {/* Value props */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 w-full max-w-3xl">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 text-left border border-slate-200/50">
            <div className="text-emerald-700 font-semibold text-sm uppercase tracking-wide mb-1">
              Shift-Left RCM
            </div>
            <p className="text-slate-700 text-sm">
              Real-time payer rule checks at ordering and documentation
              time&mdash;before claims are ever submitted.
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 text-left border border-slate-200/50">
            <div className="text-emerald-700 font-semibold text-sm uppercase tracking-wide mb-1">
              CAH-Native
            </div>
            <p className="text-slate-700 text-sm">
              96-hour LOS tracking, swing-bed workflows, and Critical Access
              Hospital compliance engineered in from day one.
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 text-left border border-slate-200/50">
            <div className="text-emerald-700 font-semibold text-sm uppercase tracking-wide mb-1">
              Offline-First
            </div>
            <p className="text-slate-700 text-sm">
              Full clinical charting and ordering without an internet
              connection. Deterministic sync when connectivity returns.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={() => navigate("/signin")}
            className="bg-emerald-700 hover:bg-emerald-800 transition-colors rounded-full text-white px-8 py-3 font-medium text-base"
          >
            Sign In
          </button>
          <button
            onClick={() => setContactOpen(true)}
            className="bg-white/70 hover:bg-white transition-colors rounded-full text-slate-800 px-8 py-3 font-medium text-base border border-slate-300"
          >
            Get in Touch
          </button>
        </div>

        {/* Footer tagline */}
        <p className="text-sm text-slate-500 mt-8">
          FHIR R4 &middot; Da Vinci CRD/DTR/PAS &middot; HIPAA &middot; ONC-aligned
        </p>
      </motion.div>

      <ContactFormModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </AuroraBackground>
  );
}
