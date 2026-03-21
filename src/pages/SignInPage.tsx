import {
  Alert,
  Anchor,
  Button,
  Divider,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { signInWithMicrosoft } from '../lib/supabase/auth';
import { useAuth } from '../providers/AuthProvider';

/* ─── SVG logos ─── */

function GoogleLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function MicrosoftLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 21 21">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

/* ─── Ambient glow blobs for left panel ─── */

function AmbientGlow() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <motion.div
        animate={{ x: [0, 60, -40, 0], y: [0, -50, 30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '20%',
          left: '15%',
          width: 340,
          height: 340,
          borderRadius: '50%',
          background: 'var(--oly-sage)',
          opacity: 0.06,
          filter: 'blur(80px)',
        }}
      />
      <motion.div
        animate={{ x: [0, -50, 40, 0], y: [0, 40, -30, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '10%',
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: 'var(--oly-ai-glow)',
          opacity: 0.06,
          filter: 'blur(80px)',
        }}
      />
    </div>
  );
}

/* ─── CSS-only dashboard preview ─── */

const MINI_STATS = [
  { label: 'Reviewed', border: 'var(--oly-sage)' },
  { label: 'Flagged', border: 'var(--oly-amber)' },
  { label: 'Gaps', border: 'var(--oly-good)' },
  { label: 'Plans', border: 'var(--oly-forest)' },
];

function DashboardPreview() {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{
        rotateY: hovered ? 0 : -2,
        rotateX: hovered ? 0 : 2,
      }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      style={{
        perspective: 1200,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: 16,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <motion.div
          animate={{ scale: [1, 0.85, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'var(--oly-good)',
          }}
        />
        <div style={{
          height: 6,
          width: 56,
          borderRadius: 3,
          background: 'rgba(255,255,255,0.15)',
        }} />
        <div style={{ flex: 1 }} />
        <div style={{
          height: 6,
          width: 32,
          borderRadius: 3,
          background: 'rgba(255,255,255,0.1)',
        }} />
      </div>

      {/* 2×2 stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {MINI_STATS.map((s) => (
          <div
            key={s.label}
            style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 8,
              padding: '10px 10px 8px',
              borderTop: `2px solid ${s.border}`,
            }}
          >
            <div style={{
              height: 14,
              width: 28,
              borderRadius: 4,
              background: 'rgba(255,255,255,0.2)',
              marginBottom: 6,
            }} />
            <div style={{
              height: 5,
              width: '60%',
              borderRadius: 3,
              background: 'rgba(255,255,255,0.08)',
            }} />
          </div>
        ))}
      </div>

      {/* Insight lines */}
      {[0.55, 0.72].map((w, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i === 0 ? 8 : 0 }}>
          <div style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: i === 0 ? 'var(--oly-sage)' : 'var(--oly-amber)',
            flexShrink: 0,
          }} />
          <div style={{
            height: 5,
            width: `${w * 100}%`,
            borderRadius: 3,
            background: 'rgba(255,255,255,0.1)',
          }} />
        </div>
      ))}
    </motion.div>
  );
}

/* ─── AI presence pill with incrementing counter ─── */

function AIPresencePill() {
  const [count, setCount] = useState(3847);

  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => c + Math.floor(Math.random() * 3) + 1);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: '6px 14px',
      }}
    >
      <motion.div
        animate={{ scale: [1, 0.85, 1], opacity: [1, 0.6, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: 'var(--oly-good)',
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: 'rgba(255,255,255,0.7)',
        }}
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={count}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'inline-block', fontVariantNumeric: 'tabular-nums' }}
          >
            {count.toLocaleString()}
          </motion.span>
        </AnimatePresence>
        {' '}clinical insights generated today
      </span>
    </div>
  );
}

/* ─── Stagger container ─── */

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

/* ─── Hero panel (desktop left) ─── */

function HeroPanel() {
  return (
    <div
      style={{
        flex: '0 0 55%',
        position: 'relative',
        background: 'linear-gradient(170deg, #1E3A30 0%, var(--oly-forest) 45%, var(--oly-forest-muted) 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '64px 56px',
        overflow: 'hidden',
      }}
    >
      <AmbientGlow />

      {/* Logo — top-left */}
      <div style={{ position: 'absolute', top: 32, left: 40 }}>
        <img
          src="/img/olyntis-logo.png"
          alt="Olyntis"
          style={{ height: 32, width: 'auto', filter: 'brightness(0) invert(1)' }}
        />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ maxWidth: 480, position: 'relative', zIndex: 1 }}
      >
        {/* Eyebrow */}
        <motion.p
          variants={fadeUp}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase' as const,
            letterSpacing: 2,
            color: 'var(--oly-sage-light)',
            margin: '0 0 16px',
          }}
        >
          THE FIRST 10 SECONDS
        </motion.p>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          style={{
            fontFamily: "'Lora', serif",
            fontSize: 36,
            fontWeight: 600,
            lineHeight: 1.25,
            color: 'white',
            margin: '0 0 20px',
          }}
        >
          Your AI co-pilot already reviewed the chart
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={fadeUp}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 16,
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.75)',
            margin: '0 0 36px',
          }}
        >
          Before you even sit down, Olyntis has identified what changed, flagged risks,
          detected care gaps, and drafted a plan. Intelligence is the interface.
        </motion.p>

        {/* Dashboard preview */}
        <motion.div variants={fadeUp} style={{ marginBottom: 24 }}>
          <DashboardPreview />
        </motion.div>

        {/* AI pill */}
        <motion.div variants={fadeUp}>
          <AIPresencePill />
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ─── Mobile hero (condensed) ─── */

function MobileHero() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        paddingTop: 8,
        paddingBottom: 4,
      }}
    >
      <img
        src="/img/olyntis-logo.png"
        alt="Olyntis"
        style={{ height: 28, width: 'auto' }}
      />
      <p
        style={{
          fontFamily: "'Lora', serif",
          fontSize: 18,
          fontWeight: 600,
          color: 'var(--oly-charcoal)',
          textAlign: 'center',
          margin: 0,
          lineHeight: 1.35,
        }}
      >
        Your AI co-pilot is ready
      </p>
      {/* Small AI pill for mobile */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'var(--oly-ai-soft)',
          borderRadius: 16,
          padding: '4px 12px',
        }}
      >
        <motion.div
          animate={{ scale: [1, 0.85, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--oly-good)',
          }}
        />
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12,
          color: 'var(--oly-forest)',
        }}>
          AI Active
        </span>
      </div>
    </div>
  );
}

/* ─── Main page ─── */

export function SignInPage(): JSX.Element {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<string>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmitSignIn = email.trim() !== '' && password.length >= 6;
  const canSubmitSignUp =
    email.trim() !== '' &&
    password.length >= 6 &&
    givenName.trim() !== '' &&
    familyName.trim() !== '';

  const handleSignIn = async () => {
    setError(null);
    setLoading(true);
    const result = await signIn(email, password);
    if (result.error) {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleSignUp = async () => {
    setError(null);
    setLoading(true);
    const result = await signUp(email, password, givenName, familyName);
    if (result.error) {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (mode === 'signin' && canSubmitSignIn) {
        handleSignIn();
      } else if (mode === 'signup' && canSubmitSignUp) {
        handleSignUp();
      }
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* ── Desktop left panel ── */}
      <div
        style={{ display: 'var(--hero-display, none)' }}
        className="hero-panel-wrapper"
      >
        <HeroPanel />
      </div>

      {/* ── Right panel — auth form ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--oly-cream)',
          position: 'relative',
          overflow: 'hidden',
          minWidth: 0,
          padding: '32px 24px',
        }}
      >
        {/* Mobile: subtle sage radial gradient */}
        <div
          className="mobile-gradient-accent"
          style={{
            display: 'var(--mobile-gradient-display, block)',
            position: 'absolute',
            top: -80,
            right: -80,
            width: 260,
            height: 260,
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--oly-sage-pale) 0%, transparent 70%)',
            opacity: 0.5,
            pointerEvents: 'none',
          }}
        />

        <div style={{ width: '100%', maxWidth: 420, padding: '0 16px', position: 'relative', zIndex: 1 }}>
          <Stack align="center" gap="md">
            {/* Mobile-only hero */}
            <div className="mobile-hero-wrapper" style={{ display: 'var(--mobile-hero-display, block)' }}>
              <MobileHero />
            </div>

            {/* Frosted glass card */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
              style={{
                width: '100%',
                background: 'rgba(253,252,250,0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: 20,
                border: '1px solid rgba(232,227,220,0.6)',
                boxShadow: '0 8px 32px rgba(42,38,34,0.08), 0 2px 8px rgba(42,38,34,0.04)',
                padding: 32,
              }}
            >
              <Stack gap="lg">
                {/* Header — animated on mode toggle */}
                <Stack align="center" gap={8}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={mode}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      style={{ width: '100%', textAlign: 'center' }}
                    >
                      <Title
                        order={3}
                        ta="center"
                        style={{
                          fontFamily: "'Lora', serif",
                          color: 'var(--oly-charcoal)',
                          fontSize: 24,
                        }}
                      >
                        {mode === 'signin' ? 'Welcome back' : 'Get started'}
                      </Title>
                    </motion.div>
                  </AnimatePresence>
                  <Text
                    ta="center"
                    style={{
                      fontFamily: "'Lora', serif",
                      fontStyle: 'italic',
                      fontSize: 15,
                      color: 'var(--oly-forest)',
                    }}
                  >
                    {mode === 'signin'
                      ? 'Healing begins before the encounter'
                      : 'Join the future of clinical care'}
                  </Text>
                </Stack>

                {/* SSO buttons — primary flow */}
                <Stack gap={10}>
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button
                      variant="default"
                      fullWidth
                      leftSection={<GoogleLogo />}
                      onClick={() => {}}
                      styles={{
                        root: {
                          height: 48,
                          borderRadius: 12,
                          borderColor: 'var(--oly-stone)',
                          background: 'var(--oly-warm-white)',
                          color: 'var(--oly-ink)',
                          transition: 'box-shadow 0.2s',
                          '&:hover': {
                            boxShadow: '0 0 0 2px var(--oly-sage-pale)',
                          },
                        },
                        inner: { justifyContent: 'center' },
                      }}
                    >
                      Continue with Google
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button
                      variant="default"
                      fullWidth
                      leftSection={<MicrosoftLogo />}
                      onClick={() => signInWithMicrosoft()}
                      styles={{
                        root: {
                          height: 48,
                          borderRadius: 12,
                          borderColor: 'var(--oly-stone)',
                          background: 'var(--oly-warm-white)',
                          color: 'var(--oly-ink)',
                          transition: 'box-shadow 0.2s',
                          '&:hover': {
                            boxShadow: '0 0 0 2px var(--oly-sage-pale)',
                          },
                        },
                        inner: { justifyContent: 'center' },
                      }}
                    >
                      Continue with Microsoft
                    </Button>
                  </motion.div>
                </Stack>

                <Divider label="or" labelPosition="center" color="var(--oly-stone)" />

                {/* Error alert — animated */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <Alert
                        icon={<IconAlertCircle size={16} />}
                        color="red"
                        w="100%"
                        variant="light"
                      >
                        {error}
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email / password fields */}
                <Stack w="100%" gap="sm" onKeyDown={handleKeyDown}>
                  {/* Sign-up name fields — animated slide in */}
                  <AnimatePresence>
                    {mode === 'signup' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <Group grow>
                          <TextInput
                            label="First Name"
                            placeholder="First name"
                            value={givenName}
                            onChange={(e) => setGivenName(e.currentTarget.value)}
                            required
                            styles={{
                              input: {
                                height: 44,
                                borderRadius: 10,
                                background: 'var(--oly-cream)',
                                '&:focus': { borderColor: 'var(--oly-sage)' },
                              },
                            }}
                          />
                          <TextInput
                            label="Last Name"
                            placeholder="Last name"
                            value={familyName}
                            onChange={(e) => setFamilyName(e.currentTarget.value)}
                            required
                            styles={{
                              input: {
                                height: 44,
                                borderRadius: 10,
                                background: 'var(--oly-cream)',
                                '&:focus': { borderColor: 'var(--oly-sage)' },
                              },
                            }}
                          />
                        </Group>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <TextInput
                    label="Email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.currentTarget.value)}
                    required
                    styles={{
                      input: {
                        height: 44,
                        borderRadius: 10,
                        background: 'var(--oly-cream)',
                        '&:focus': { borderColor: 'var(--oly-sage)' },
                      },
                    }}
                  />
                  <PasswordInput
                    label="Password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.currentTarget.value)}
                    required
                    styles={{
                      input: {
                        height: 44,
                        borderRadius: 10,
                        background: 'var(--oly-cream)',
                        '&:focus': { borderColor: 'var(--oly-sage)' },
                      },
                    }}
                  />
                  {mode === 'signin' && (
                    <Group justify="flex-end">
                      <Anchor size="xs" c="var(--oly-stone-dark)">
                        Forgot password?
                      </Anchor>
                    </Group>
                  )}
                </Stack>

                {/* Submit button */}
                {mode === 'signin' ? (
                  <Button
                    fullWidth
                    loading={loading}
                    disabled={!canSubmitSignIn}
                    onClick={handleSignIn}
                    styles={{
                      root: {
                        height: 48,
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, var(--oly-forest) 0%, var(--oly-forest-light) 100%)',
                        transition: 'box-shadow 0.2s',
                        '&:hover': {
                          background: 'linear-gradient(135deg, var(--oly-forest) 0%, var(--oly-forest-light) 100%)',
                          boxShadow: '0 4px 20px rgba(44,74,62,0.35)',
                        },
                        '&[data-disabled]': {
                          background: 'var(--oly-stone)',
                          color: 'var(--oly-stone-dark)',
                        },
                      },
                    }}
                  >
                    Sign In
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    loading={loading}
                    disabled={!canSubmitSignUp}
                    onClick={handleSignUp}
                    styles={{
                      root: {
                        height: 48,
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, var(--oly-forest) 0%, var(--oly-forest-light) 100%)',
                        transition: 'box-shadow 0.2s',
                        '&:hover': {
                          background: 'linear-gradient(135deg, var(--oly-forest) 0%, var(--oly-forest-light) 100%)',
                          boxShadow: '0 4px 20px rgba(44,74,62,0.35)',
                        },
                        '&[data-disabled]': {
                          background: 'var(--oly-stone)',
                          color: 'var(--oly-stone-dark)',
                        },
                      },
                    }}
                  >
                    Create Account
                  </Button>
                )}
              </Stack>
            </motion.div>

            {/* Mode toggle — animated crossfade */}
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Text size="xs" c="var(--oly-stone-dark)" ta="center">
                  {mode === 'signin' ? (
                    <>
                      Don&apos;t have an account?{' '}
                      <Anchor size="xs" c="var(--oly-forest-muted)" onClick={() => { setMode('signup'); setError(null); }}>
                        Sign up
                      </Anchor>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <Anchor size="xs" c="var(--oly-forest-muted)" onClick={() => { setMode('signin'); setError(null); }}>
                        Sign in
                      </Anchor>
                    </>
                  )}
                </Text>
              </motion.div>
            </AnimatePresence>

            <Text size="xs" c="var(--oly-stone-dark)">
              &copy; {new Date().getFullYear()} Olyntis
            </Text>
          </Stack>
        </div>
      </div>

      {/* Responsive styles injected via <style> tag */}
      <style>{`
        .hero-panel-wrapper {
          display: none !important;
        }
        .mobile-hero-wrapper {
          display: block !important;
        }
        .mobile-gradient-accent {
          display: block !important;
        }
        @media (min-width: 768px) {
          .hero-panel-wrapper {
            display: flex !important;
            flex: 0 0 55%;
          }
          .mobile-hero-wrapper {
            display: none !important;
          }
          .mobile-gradient-accent {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
