import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { conditionService } from '../../services/condition.service';
import { medicationService } from '../../services/medication.service';
import { encounterService } from '../../services/encounter.service';
import { observationService } from '../../services/observation.service';
import { formatDate } from '../../lib/utils';
import classes from './ContextPanel.module.css';

interface ContextPanelProps {
  patientId: string | undefined;
}

interface ContextData {
  conditions: Array<{ display: string; status: string }>;
  medications: Array<{ display: string; status: string }>;
  screeningScores: Array<{ instrument: string; score: number; date: string }>;
  encounters: Array<{ date: string; type: string; status: string }>;
}

export function ContextPanel({ patientId }: ContextPanelProps): JSX.Element {
  const [data, setData] = useState<ContextData | null>(null);

  useEffect(() => {
    if (!patientId) {
      setData(null);
      return;
    }

    const screeningCodes: Record<string, string> = {
      '44261-6': 'PHQ-9',
      '70274-6': 'GAD-7',
      '75626-2': 'AUDIT-C',
    };

    Promise.all([
      conditionService.getByPatientId(patientId).catch(() => []),
      medicationService.getByPatientId(patientId).catch(() => []),
      observationService.getByPatientId(patientId).catch(() => []),
      encounterService.getByPatientId(patientId).catch(() => []),
    ]).then(([conditions, medications, observations, encounters]) => {
      const seen = new Set<string>();
      const scores: ContextData['screeningScores'] = [];
      for (const o of observations) {
        const instrument = screeningCodes[o.code_value ?? ''];
        if (!instrument || seen.has(instrument)) continue;
        seen.add(instrument);
        const valueObj = o.value as any;
        const score =
          valueObj?.valueQuantity?.value ??
          valueObj?.valueInteger ??
          valueObj?.value ??
          (typeof valueObj === 'number' ? valueObj : 0);
        scores.push({ instrument, score: Number(score), date: formatDate(o.effective_date) });
      }

      setData({
        conditions: conditions.map((c) => ({
          display: c.code_display ?? c.code_value ?? 'Unknown',
          status: c.clinical_status ?? 'unknown',
        })),
        medications: medications.map((m) => ({
          display: m.medication_display ?? m.medication_code ?? 'Unknown',
          status: m.status ?? 'unknown',
        })),
        screeningScores: scores,
        encounters: encounters.slice(0, 10).map((e) => ({
          date: formatDate(e.period_start ?? e.created_at),
          type: e.class_code ?? 'Encounter',
          status: e.status ?? 'unknown',
        })),
      });
    });
  }, [patientId]);

  if (!patientId || !data) {
    return <div className={classes.panel} />;
  }

  return (
    <div className={classes.panel}>
      <Section title="Conditions">
        {data.conditions.length === 0 ? (
          <div className={classes.none}>None documented</div>
        ) : (
          data.conditions.map((c, i) => (
            <div key={i} className={classes.item}>
              <span className={classes.itemText}>{c.display}</span>
              <span className={classes.itemBadge}>{c.status}</span>
            </div>
          ))
        )}
      </Section>

      <Section title="Medications">
        {data.medications.length === 0 ? (
          <div className={classes.none}>None documented</div>
        ) : (
          data.medications.map((m, i) => (
            <div key={i} className={classes.item}>
              <span className={classes.itemText}>{m.display}</span>
              <span className={classes.itemBadge}>{m.status}</span>
            </div>
          ))
        )}
      </Section>

      <Section title="Screening Scores">
        {data.screeningScores.length === 0 ? (
          <div className={classes.none}>None documented</div>
        ) : (
          data.screeningScores.map((s, i) => (
            <div key={i} className={classes.scoreRow}>
              <span className={classes.scoreLabel}>{s.instrument}</span>
              <span className={`${classes.scoreVal} ${s.score >= 15 ? classes.high : s.score >= 10 ? classes.mod : ''}`}>
                {s.score}
              </span>
              <span className={classes.scoreDate}>{s.date}</span>
            </div>
          ))
        )}
      </Section>

      <Section title="Recent Encounters">
        {data.encounters.length === 0 ? (
          <div className={classes.none}>None documented</div>
        ) : (
          data.encounters.map((e, i) => (
            <div key={i} className={classes.item}>
              <span className={classes.itemText}>{e.date}</span>
              <span className={classes.itemBadge}>{e.status}</span>
            </div>
          ))
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }): JSX.Element {
  return (
    <div className={classes.section}>
      <div className={classes.sectionTitle}>{title}</div>
      {children}
    </div>
  );
}
