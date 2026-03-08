import { Paper, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import type { JSX } from 'react';
import type { RiskAlert } from '../../hooks/useDashboardData';

interface RiskFlagsCardProps {
  alerts: RiskAlert[];
}

export function RiskFlagsCard({ alerts }: RiskFlagsCardProps): JSX.Element {
  return (
    <Paper withBorder radius="md" style={{ background: 'var(--oly-warm-white)', overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 20px 14px',
        borderBottom: '1px solid var(--oly-stone)',
      }}>
        <Text ff="'Lora', serif" fz={15} fw={500} c="var(--oly-charcoal)">
          Risk Flags
        </Text>
        <Text size="xs" fw={500} c="var(--oly-sage)" style={{ cursor: 'pointer' }}>
          View all &rarr;
        </Text>
      </div>

      {alerts.length === 0 ? (
        <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--oly-stone-dark)', fontSize: 13 }}>
          No risk flags at this time
        </div>
      ) : (
        alerts.slice(0, 5).map((alert, i) => {
          const isHigh = alert.severity === 'high';
          return (
            <div
              key={`${alert.patientId}-${alert.scoreType}-${i}`}
              style={{
                padding: '14px 20px',
                display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                background: isHigh ? 'rgba(192, 85, 85, 0.08)' : 'rgba(212, 130, 58, 0.1)',
                color: isHigh ? 'var(--oly-risk-red)' : 'var(--oly-amber)',
              }}>
                <IconAlertTriangle size={15} stroke={2.5} />
              </div>
              <div style={{ flex: 1 }}>
                <Text size="sm" fw={500} c="var(--oly-charcoal)">{alert.patientName}</Text>
                <Text size="xs" c="dimmed" mt={2}>{alert.reason}</Text>
              </div>
              <div style={{
                fontSize: 11, fontWeight: 600,
                padding: '3px 10px', borderRadius: 20,
                background: isHigh ? 'rgba(192, 85, 85, 0.08)' : 'rgba(212, 130, 58, 0.1)',
                color: isHigh ? 'var(--oly-risk-red)' : 'var(--oly-amber)',
              }}>
                {isHigh ? 'High' : 'Moderate'}
              </div>
            </div>
          );
        })
      )}
    </Paper>
  );
}
