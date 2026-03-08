import { Paper, Text } from '@mantine/core';
import { IconChevronUp } from '@tabler/icons-react';
import type { JSX } from 'react';
import type { DashboardStats } from '../../hooks/useDashboardData';

interface StatCardsProps {
  stats: DashboardStats;
}

interface StatCardDef {
  label: string;
  getValue: (s: DashboardStats) => string;
  color: string;
  borderColor: string;
  sub?: (s: DashboardStats) => string;
  trend?: (s: DashboardStats) => { text: string; type: 'up' | 'warn' | 'neutral' } | null;
}

const cards: StatCardDef[] = [
  {
    label: "Today's Appointments",
    getValue: (s) => String(s.todayAppointments),
    color: 'var(--oly-sage)',
    borderColor: 'var(--oly-sage)',
    trend: () => ({ text: 'View schedule', type: 'neutral' }),
  },
  {
    label: 'Risk Alerts',
    getValue: (s) => String(s.riskAlerts),
    color: 'var(--oly-amber)',
    borderColor: 'var(--oly-amber)',
    trend: (s) => s.riskAlerts > 0 ? { text: 'Needs review', type: 'warn' } : null,
  },
  {
    label: 'Active Medications',
    getValue: (s) => String(s.rxPending),
    color: 'var(--oly-good)',
    borderColor: 'var(--oly-good)',
    sub: () => 'Active prescriptions',
  },
  {
    label: 'Notes Complete',
    getValue: (s) => s.notesTotal > 0 ? `${s.notesComplete}/${s.notesTotal}` : String(s.notesComplete),
    color: 'var(--oly-forest)',
    borderColor: 'var(--oly-forest)',
    sub: (s) => s.notesTotal > s.notesComplete
      ? `${s.notesTotal - s.notesComplete} remaining today`
      : 'All complete',
  },
];

export function StatCards({ stats }: StatCardsProps): JSX.Element {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 16,
      marginBottom: 24,
    }}>
      {cards.map((card) => {
        const trend = card.trend?.(stats);
        const sub = card.sub?.(stats);
        return (
          <Paper
            key={card.label}
            withBorder
            p="lg"
            radius="md"
            style={{
              borderTop: `3px solid ${card.borderColor}`,
              cursor: 'default',
              transition: 'all 0.2s',
              background: 'var(--oly-warm-white)',
            }}
          >
            <Text
              size="xs"
              fw={500}
              c="dimmed"
              tt="uppercase"
              style={{ letterSpacing: '0.06em', marginBottom: 8 }}
            >
              {card.label}
            </Text>
            <Text
              ff="'Lora', serif"
              fz={32}
              fw={600}
              c="var(--oly-charcoal)"
              lh={1}
            >
              {card.getValue(stats)}
            </Text>
            {sub && (
              <Text size="xs" c="dimmed" mt={6}>
                {sub}
              </Text>
            )}
            {trend && (
              <Text
                size="xs"
                fw={500}
                mt={4}
                c={trend.type === 'warn' ? 'var(--oly-amber)' : trend.type === 'up' ? 'var(--oly-good)' : 'dimmed'}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}
              >
                {trend.type === 'up' && <IconChevronUp size={10} stroke={2.5} />}
                {trend.text}
              </Text>
            )}
          </Paper>
        );
      })}
    </div>
  );
}
