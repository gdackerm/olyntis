import { Paper, Progress, Text } from '@mantine/core';
import type { JSX } from 'react';
import type { ScreeningScore } from '../../hooks/useDashboardData';

interface TreatmentProgressProps {
  screeningScores: ScreeningScore[];
}

interface PatientProgress {
  patientName: string;
  percentage: number;
  condition: string;
  goalsText: string;
}

function computeProgress(screeningScores: ScreeningScore[]): PatientProgress[] {
  // Group by patient, compute progress as score reduction from max possible
  const byPatient = new Map<string, ScreeningScore[]>();
  for (const score of screeningScores) {
    if (!byPatient.has(score.patientId)) {
      byPatient.set(score.patientId, []);
    }
    byPatient.get(score.patientId)!.push(score);
  }

  const results: PatientProgress[] = [];

  for (const [, scores] of byPatient) {
    if (scores.length === 0) continue;

    // Use the latest score as a percentage improvement
    // PHQ-9 max=27, GAD-7 max=21, AUDIT-C max=12
    const latest = scores[0];
    const maxScore = latest.codeValue === '44261-6' ? 27
      : latest.codeValue === '70274-6' ? 21
      : 12;

    const improvement = Math.max(0, Math.round(((maxScore - latest.score) / maxScore) * 100));

    results.push({
      patientName: latest.patientName,
      percentage: improvement,
      condition: latest.codeDisplay,
      goalsText: `${latest.codeDisplay}: ${latest.score}/${maxScore}`,
    });
  }

  // Sort by percentage descending, take top 4
  return results.sort((a, b) => b.percentage - a.percentage).slice(0, 4);
}

export function TreatmentProgress({ screeningScores }: TreatmentProgressProps): JSX.Element {
  const progress = computeProgress(screeningScores);

  return (
    <Paper withBorder radius="md" style={{ background: 'var(--oly-warm-white)', overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 20px 14px',
        borderBottom: '1px solid var(--oly-stone)',
      }}>
        <Text ff="'Lora', serif" fz={15} fw={500} c="var(--oly-charcoal)">
          Treatment Progress
        </Text>
        <Text size="xs" fw={500} c="var(--oly-sage)" style={{ cursor: 'pointer' }}>
          View all &rarr;
        </Text>
      </div>

      {progress.length === 0 ? (
        <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--oly-stone-dark)', fontSize: 13 }}>
          No treatment progress data available
        </div>
      ) : (
        progress.map((p, i) => (
          <div
            key={`${p.patientName}-${i}`}
            style={{
              padding: '14px 20px',
              borderBottom: i < progress.length - 1 ? '1px solid var(--oly-stone)' : 'none',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text size="sm" fw={500} c="var(--oly-charcoal)">{p.patientName}</Text>
              <Text size="sm" fw={600} c="var(--oly-forest-muted)">{p.percentage}%</Text>
            </div>
            <Progress
              value={p.percentage}
              size={5}
              radius="xs"
              color="sage"
              styles={{
                root: { background: 'var(--oly-stone)' },
                section: { background: 'linear-gradient(90deg, var(--oly-sage), var(--oly-forest-muted))' },
              }}
            />
            <Text size="xs" c="dimmed" mt={6}>{p.goalsText}</Text>
          </div>
        ))
      )}
    </Paper>
  );
}
