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

/* ─── SVG logos (SSO providers) ─── */

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

/* ─── Molecular logo mark (matches brand logo) ─── */

function MolecularMark({ size = 48, color = 'white' }: { size?: number; color?: string }) {
  const sage = color === 'white' ? 'rgba(255,255,255,0.6)' : 'var(--oly-sage)';
  const sageLt = color === 'white' ? 'rgba(255,255,255,0.35)' : 'var(--oly-sage-light)';
  const primary = color === 'white' ? 'white' : 'var(--oly-forest)';
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      {/* Large ring — left */}
      <circle cx="16" cy="30" r="11" stroke={primary} strokeWidth="3.5" fill="none" />
      {/* Center hub lines */}
      <line x1="27" y1="30" x2="38" y2="18" stroke={sage} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="27" y1="30" x2="38" y2="42" stroke={sage} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="27" y1="30" x2="42" y2="30" stroke={sage} strokeWidth="2.5" strokeLinecap="round" />
      {/* Endpoint dots */}
      <circle cx="40" cy="17" r="5" fill={primary} />
      <circle cx="42" cy="30" r="4" fill={sage} />
      <circle cx="40" cy="43" r="3.5" fill={sageLt} />
    </svg>
  );
}

/* ─── Ambient glow blobs ─── */

function AmbientGlow() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <motion.div
        animate={{ x: [0, 60, -40, 0], y: [0, -50, 30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '15%',
          left: '20%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'var(--oly-sage)',
          opacity: 0.07,
          filter: 'blur(80px)',
        }}
      />
      <motion.div
        animate={{ x: [0, -50, 40, 0], y: [0, 40, -30, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'var(--oly-ai-glow)',
          opacity: 0.07,
          filter: 'blur(80px)',
        }}
      />
    </div>
  );
}

/* ─── AI presence pill with incrementing counter ─── */

function AIPresencePill({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const [count, setCount] = useState(3847);

  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => c + Math.floor(Math.random() * 3) + 1);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const isDark = variant === 'dark';

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: isDark ? 'rgba(255,255,255,0.08)' : 'var(--oly-ai-soft)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(109,181,160,0.2)'}`,
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
          color: isDark ? 'rgba(255,255,255,0.7)' : 'var(--oly-forest)',
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
        {' '}clinical insights today
      </span>
    </div>
  );
}

/* ─── Stagger animation ─── */

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

/* ─── Feature pills ─── */

const FEATURES = [
  'Chart pre-review',
  'Risk detection',
  'Care gap alerts',
  'Draft plans',
];

/* ─── Left panel (desktop) ─── */

function HeroPanel() {
  return (
    <div
      style={{
        flex: '0 0 50%',
        position: 'relative',
        background: 'linear-gradient(160deg, #1a2e28 0%, var(--oly-forest) 50%, #2d5449 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 56px',
        overflow: 'hidden',
      }}
    >
      <AmbientGlow />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        style={{
          maxWidth: 440,
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        {/* Logo mark + wordmark */}
        <motion.div
          variants={fadeUp}
          style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}
        >
          <MolecularMark size={44} color="white" />
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 28,
            fontWeight: 500,
            color: 'white',
            letterSpacing: -0.5,
          }}>
            olyntis
          </span>
        </motion.div>

        {/* Eyebrow */}
        <motion.p
          variants={fadeUp}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase' as const,
            letterSpacing: 2.5,
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
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 38,
            fontWeight: 600,
            lineHeight: 1.2,
            color: 'white',
            margin: '0 0 20px',
            letterSpacing: -0.5,
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
            color: 'rgba(255,255,255,0.65)',
            margin: '0 0 32px',
          }}
        >
          Before you even sit down, Olyntis has identified what changed,
          flagged risks, and drafted a plan.
        </motion.p>

        {/* Feature pills */}
        <motion.div
          variants={fadeUp}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}
        >
          {FEATURES.map((f) => (
            <span
              key={f}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.8)',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 20,
                padding: '5px 14px',
              }}
            >
              {f}
            </span>
          ))}
        </motion.div>

        {/* AI pill */}
        <motion.div variants={fadeUp}>
          <AIPresencePill variant="dark" />
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ─── Mobile hero ─── */

function MobileHero() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        paddingTop: 8,
        paddingBottom: 4,
      }}
    >
      <img
        src="/img/olyntis-logo.png"
        alt="Olyntis"
        style={{ height: 32, width: 'auto' }}
      />
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15,
          fontWeight: 500,
          color: 'var(--oly-charcoal)',
          textAlign: 'center',
          margin: 0,
        }}
      >
        AI-native clinical intelligence
      </p>
      <AIPresencePill variant="light" />
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
      <div className="hero-panel-wrapper">
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
        <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
          <Stack align="center" gap="md">
            {/* Mobile-only hero */}
            <div className="mobile-hero-wrapper">
              <MobileHero />
            </div>

            {/* Auth card */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: 0.1 }}
              style={{
                width: '100%',
                background: 'rgba(253,252,250,0.9)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: 20,
                border: '1px solid rgba(232,227,220,0.5)',
                boxShadow: '0 8px 40px rgba(42,38,34,0.07), 0 1px 4px rgba(42,38,34,0.04)',
                padding: 32,
              }}
            >
              <Stack gap="lg">
                {/* Header */}
                <Stack align="center" gap={6}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={mode}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      style={{ width: '100%', textAlign: 'center' }}
                    >
                      <Title
                        order={3}
                        ta="center"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          color: 'var(--oly-charcoal)',
                          fontSize: 22,
                          fontWeight: 600,
                        }}
                      >
                        {mode === 'signin' ? 'Welcome back' : 'Get started'}
                      </Title>
                    </motion.div>
                  </AnimatePresence>
                  <Text
                    ta="center"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontStyle: 'italic',
                      fontSize: 14,
                      color: 'var(--oly-charcoal)',
                      opacity: 0.6,
                    }}
                  >
                    {mode === 'signin'
                      ? 'Healing begins before the encounter'
                      : 'Join the future of clinical care'}
                  </Text>
                </Stack>

                {/* SSO buttons */}
                <Stack gap={10}>
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button
                      variant="default"
                      fullWidth
                      leftSection={<GoogleLogo />}
                      onClick={() => {}}
                      styles={{
                        root: {
                          height: 46,
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
                          height: 46,
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

                {/* Error alert */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <Alert icon={<IconAlertCircle size={16} />} color="red" w="100%" variant="light">
                        {error}
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form fields */}
                <Stack w="100%" gap="sm" onKeyDown={handleKeyDown}>
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
                            styles={{ input: { height: 42, borderRadius: 10, background: 'var(--oly-cream)' } }}
                          />
                          <TextInput
                            label="Last Name"
                            placeholder="Last name"
                            value={familyName}
                            onChange={(e) => setFamilyName(e.currentTarget.value)}
                            required
                            styles={{ input: { height: 42, borderRadius: 10, background: 'var(--oly-cream)' } }}
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
                    styles={{ input: { height: 42, borderRadius: 10, background: 'var(--oly-cream)' } }}
                  />
                  <PasswordInput
                    label="Password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.currentTarget.value)}
                    required
                    styles={{ input: { height: 42, borderRadius: 10, background: 'var(--oly-cream)' } }}
                  />
                  {mode === 'signin' && (
                    <Group justify="flex-end">
                      <Anchor size="xs" c="var(--oly-stone-dark)">Forgot password?</Anchor>
                    </Group>
                  )}
                </Stack>

                {/* Submit */}
                <Button
                  fullWidth
                  loading={loading}
                  disabled={mode === 'signin' ? !canSubmitSignIn : !canSubmitSignUp}
                  onClick={mode === 'signin' ? handleSignIn : handleSignUp}
                  styles={{
                    root: {
                      height: 46,
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, var(--oly-forest) 0%, var(--oly-forest-light) 100%)',
                      transition: 'box-shadow 0.2s',
                      '&:hover': {
                        background: 'linear-gradient(135deg, var(--oly-forest) 0%, var(--oly-forest-light) 100%)',
                        boxShadow: '0 4px 20px rgba(44,74,62,0.3)',
                      },
                      '&[data-disabled]': {
                        background: 'var(--oly-stone)',
                        color: 'var(--oly-stone-dark)',
                      },
                    },
                  }}
                >
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                </Button>
              </Stack>
            </motion.div>

            {/* Mode toggle */}
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

      {/* Responsive styles */}
      <style>{`
        .hero-panel-wrapper {
          display: none !important;
        }
        .mobile-hero-wrapper {
          display: block !important;
        }
        @media (min-width: 768px) {
          .hero-panel-wrapper {
            display: flex !important;
            flex: 0 0 50%;
          }
          .mobile-hero-wrapper {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
