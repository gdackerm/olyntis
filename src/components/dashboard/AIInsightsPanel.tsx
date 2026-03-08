import { Paper, Text } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import type { JSX } from 'react';
import type { RiskAlert, ScreeningScore } from '../../hooks/useDashboardData';

interface Insight {
  patientName: string;
  text: string;
  dotColor: string;
  time: string;
}

function generateInsights(riskAlerts: RiskAlert[], screeningScores: ScreeningScore[]): Insight[] {
  const insights: Insight[] = [];
  const seen = new Set<string>();

  // High-risk alerts as red insights
  for (const alert of riskAlerts) {
    if (alert.severity === 'high' && !seen.has(alert.patientId)) {
      seen.add(alert.patientId);
      insights.push({
        patientName: alert.patientName,
        text: `${alert.reason}. Consider crisis screening at next appointment.`,
        dotColor: 'var(--oly-risk-red)',
        time: 'Flagged recently',
      });
    }
  }

  // Moderate alerts as amber
  for (const alert of riskAlerts) {
    if (alert.severity === 'moderate' && !seen.has(alert.patientId)) {
      seen.add(alert.patientId);
      insights.push({
        patientName: alert.patientName,
        text: `${alert.reason}. Monitor at upcoming visit.`,
        dotColor: 'var(--oly-amber)',
        time: 'Flagged recently',
      });
    }
  }

  // Improving trends as green insights
  const patientScores = new Map<string, ScreeningScore[]>();
  for (const score of screeningScores) {
    const key = `${score.patientId}-${score.codeValue}`;
    if (!patientScores.has(key)) patientScores.set(key, []);
    patientScores.get(key)!.push(score);
  }

  for (const [, scores] of patientScores) {
    if (scores.length >= 2 && !seen.has(scores[0].patientId)) {
      const latest = scores[0].score;
      const previous = scores[1].score;
      if (latest < previous) {
        seen.add(scores[0].patientId);
        insights.push({
          patientName: scores[0].patientName,
          text: `${scores[0].codeDisplay} improving (${previous} → ${latest}). Treatment plan on track.`,
          dotColor: 'var(--oly-good)',
          time: 'Generated today',
        });
      }
    }
  }

  return insights.slice(0, 6);
}

interface AIInsightsPanelProps {
  riskAlerts: RiskAlert[];
  screeningScores: ScreeningScore[];
}

export function AIInsightsPanel({ riskAlerts, screeningScores }: AIInsightsPanelProps): JSX.Element {
  const insights = generateInsights(riskAlerts, screeningScores);

  return (
    <Paper withBorder radius="md" style={{ background: 'var(--oly-warm-white)' }}>
      <div style={{
        padding: '18px 20px 14px',
        borderBottom: '1px solid var(--oly-stone)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 30, height: 30,
          background: 'var(--oly-ai-soft)',
          border: '1px solid rgba(109,181,160,0.25)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <IconSparkles size={14} color="var(--oly-ai-glow)" />
        </div>
        <div>
          <Text ff="'Lora', serif" fz={15} fw={500} c="var(--oly-charcoal)">
            AI Insights
          </Text>
          <Text size="xs" c="dimmed" mt={1}>Updated just now</Text>
        </div>
      </div>

      <div style={{ padding: '8px 0' }}>
        {insights.length === 0 ? (
          <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--oly-stone-dark)', fontSize: 13 }}>
            No insights to display yet. AI will analyze patient data as it becomes available.
          </div>
        ) : (
          insights.map((insight, i) => (
            <div key={i}>
              <div style={{
                padding: '12px 20px',
                display: 'flex', gap: 12,
                transition: 'background 0.15s',
                cursor: 'pointer',
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: insight.dotColor,
                  flexShrink: 0, marginTop: 5,
                }} />
                <div>
                  <Text size="sm" c="var(--oly-ink)" lh={1.5}>
                    <Text span fw={600} c="var(--oly-charcoal)">{insight.patientName}</Text>
                    {' — '}{insight.text}
                  </Text>
                  <Text size="xs" c="dimmed" mt={2}>{insight.time}</Text>
                </div>
              </div>
              {i < insights.length - 1 && (
                <div style={{ height: 1, background: 'var(--oly-stone)', margin: '4px 20px' }} />
              )}
            </div>
          ))
        )}
      </div>
    </Paper>
  );
}
