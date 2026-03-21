import { Paper } from '@mantine/core';
import {
  IconAlertTriangle,
  IconArrowRight,
  IconFileText,
  IconSparkles,
} from '@tabler/icons-react';
import type { JSX } from 'react';
import { useNavigate } from 'react-router';
import type {
  DashboardStats,
  RiskAlert,
  TodayAppointment,
} from '../../hooks/useDashboardData';

interface MorningBriefProps {
  stats: DashboardStats;
  riskAlerts: RiskAlert[];
  todayAppointments: TodayAppointment[];
}

function getGreetingWord(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

export function MorningBrief({
  stats,
  riskAlerts,
  todayAppointments,
}: MorningBriefProps): JSX.Element {
  const navigate = useNavigate();

  // Build the natural-language summary
  const upcoming = todayAppointments.filter(
    (a) => a.status !== 'fulfilled' && a.status !== 'completed' && a.status !== 'finished'
  );
  const highRisk = riskAlerts.filter((a) => a.severity === 'high');
  const notesRemaining = stats.notesTotal - stats.notesComplete;

  // Action items — most urgent first
  const actions: { icon: JSX.Element; text: string; urgent?: boolean; onClick?: () => void }[] = [];

  for (const alert of highRisk.slice(0, 2)) {
    actions.push({
      icon: <IconAlertTriangle size={16} />,
      text: `${alert.patientName} — ${alert.reason}`,
      urgent: true,
      onClick: () => navigate(`/Patient/${alert.patientId}`),
    });
  }

  if (notesRemaining > 0) {
    actions.push({
      icon: <IconFileText size={16} />,
      text: `${notesRemaining} note${notesRemaining > 1 ? 's' : ''} to complete today`,
    });
  }

  // Add first upcoming patient for context
  if (upcoming.length > 0 && actions.length < 4) {
    const next = upcoming[0];
    actions.push({
      icon: <IconArrowRight size={16} />,
      text: `Next up: ${next.patientName} — ${next.reason}`,
      onClick: () => navigate(`/Patient/${next.patientId}`),
    });
  }

  return (
    <Paper
      radius="lg"
      p={0}
      style={{
        background: 'linear-gradient(135deg, var(--oly-forest) 0%, var(--oly-forest-light) 50%, var(--oly-forest-muted) 100%)',
        marginBottom: 20,
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', gap: 0 }}>
        {/* Left — summary */}
        <div style={{ flex: 1, padding: '28px 32px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 14,
          }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'rgba(123, 168, 152, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <IconSparkles size={16} color="var(--oly-sage-light)" />
            </div>
            <span style={{
              fontFamily: "'Lora', serif",
              fontSize: 17,
              fontWeight: 600,
              color: '#fff',
            }}>
              Your {getGreetingWord()} brief
            </span>
          </div>

          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--oly-sage-pale)',
            margin: 0,
          }}>
            {stats.todayAppointments === 0
              ? 'No appointments today. A good time to review open notes and catch up on documentation.'
              : <>
                  <strong style={{ color: '#fff' }}>{stats.todayAppointments} patient{stats.todayAppointments !== 1 ? 's' : ''}</strong> on today's schedule
                  {highRisk.length > 0 && (
                    <> &mdash; <strong style={{ color: 'var(--oly-amber)' }}>{highRisk.length} flagged</strong> for elevated risk</>
                  )}
                  {stats.rxPending > 0 && (
                    <>, {stats.rxPending} active medication{stats.rxPending !== 1 ? 's' : ''} across your panel</>
                  )}
                  .
                  {notesRemaining > 0 && (
                    <> {notesRemaining} note{notesRemaining !== 1 ? 's' : ''} still open from earlier sessions.</>
                  )}
                </>
            }
          </p>

          <button
            onClick={() => navigate('/consult')}
            style={{
              marginTop: 18,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8,
              padding: '8px 16px',
              color: '#fff',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.22)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          >
            <IconSparkles size={14} />
            Ask AI to prep your day
          </button>
        </div>

        {/* Right — action items */}
        {actions.length > 0 && (
          <div style={{
            width: 320,
            borderLeft: '1px solid rgba(255,255,255,0.1)',
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}>
            <span style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase' as const,
              color: 'var(--oly-sage)',
              marginBottom: 6,
            }}>
              Needs attention
            </span>

            {actions.map((action, i) => (
              <button
                key={i}
                onClick={action.onClick}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: 'none',
                  background: action.urgent
                    ? 'rgba(212, 130, 58, 0.12)'
                    : 'rgba(255,255,255,0.06)',
                  cursor: action.onClick ? 'pointer' : 'default',
                  textAlign: 'left',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  lineHeight: 1.4,
                  color: action.urgent ? 'var(--oly-amber)' : 'var(--oly-sage-pale)',
                  transition: 'background 0.15s',
                  width: '100%',
                }}
                onMouseEnter={(e) => {
                  if (action.onClick) e.currentTarget.style.background = action.urgent
                    ? 'rgba(212, 130, 58, 0.2)'
                    : 'rgba(255,255,255,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = action.urgent
                    ? 'rgba(212, 130, 58, 0.12)'
                    : 'rgba(255,255,255,0.06)';
                }}
              >
                <span style={{ marginTop: 1, flexShrink: 0 }}>{action.icon}</span>
                <span>{action.text}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </Paper>
  );
}
