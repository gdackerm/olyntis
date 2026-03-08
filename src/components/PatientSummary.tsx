import { Loader } from '@mantine/core';
import type { JSX } from 'react';
import { useCallback, useEffect, useState } from 'react';
import type { Tables } from '../lib/supabase/types';
import {
  formatAge,
  formatDate,
  formatGender,
  formatHumanName,
  getInitials,
} from '../lib/utils';
import { patientService } from '../services/patient.service';
import classes from './PatientSummary.module.css';

type Patient = Tables<'patients'>;

interface PatientRelatedData {
  allergies: Tables<'allergy_intolerances'>[];
  conditions: Tables<'conditions'>[];
  medications: Tables<'medication_requests'>[];
  coverages: Tables<'coverages'>[];
}

interface PatientSummaryProps {
  patient: Patient;
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #7BA898, #4E7A6A)',
  'linear-gradient(135deg, #C05555, #A03A3A)',
  'linear-gradient(135deg, #D4823A, #B06828)',
  'linear-gradient(135deg, #4E8C6A, #3A6E54)',
  'linear-gradient(135deg, #8A6AB5, #6A50A0)',
  'linear-gradient(135deg, #5E8E84, #3D6357)',
];

function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

export function PatientSummary({ patient }: PatientSummaryProps): JSX.Element {
  const [related, setRelated] = useState<PatientRelatedData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRelated = useCallback(async () => {
    setLoading(true);
    try {
      const result = await patientService.getWithRelated(patient.id);
      setRelated({
        allergies: result.allergies,
        conditions: result.conditions,
        medications: result.medications,
        coverages: result.coverages,
      });
    } catch (err) {
      console.error('Failed to load related data:', err);
    } finally {
      setLoading(false);
    }
  }, [patient.id]);

  useEffect(() => {
    fetchRelated();
  }, [fetchRelated]);

  const displayName = formatHumanName(patient.given_name, patient.family_name);
  const initials = getInitials(patient.given_name, patient.family_name);

  return (
    <div className={classes.sidebar}>
      <div className={classes.header}>
        <div
          className={classes.avatar}
          style={{ background: getAvatarGradient(displayName) }}
        >
          {initials}
        </div>
        <div>
          <div className={classes.name}>{displayName}</div>
          <div className={classes.meta}>
            {formatGender(patient.gender)}
            {patient.birth_date && ` | ${formatDate(patient.birth_date)} (${formatAge(patient.birth_date)})`}
          </div>
        </div>
      </div>

      <div className={classes.divider} />

      <div className={classes.infoGrid}>
        {patient.phone && (
          <div>
            <div className={classes.infoLabel}>Phone</div>
            <div className={classes.infoValue}>{patient.phone}</div>
          </div>
        )}
        {patient.email && (
          <div>
            <div className={classes.infoLabel}>Email</div>
            <div className={classes.infoValue}>{patient.email}</div>
          </div>
        )}
      </div>

      {(patient.phone || patient.email) && <div className={classes.divider} />}

      {loading ? (
        <Loader size="sm" />
      ) : (
        <>
          <SummarySection
            title="Active Conditions"
            items={related?.conditions ?? []}
            renderItem={(c) => c.code_display ?? c.code_value ?? 'Unknown'}
          />
          <SummarySection
            title="Allergies"
            items={related?.allergies ?? []}
            renderItem={(a) => a.code_display ?? a.code_value ?? 'Unknown'}
          />
          <SummarySection
            title="Medications"
            items={related?.medications ?? []}
            renderItem={(m) => m.medication_display ?? m.medication_code ?? 'Unknown'}
          />
          <CoverageSection coverages={related?.coverages ?? []} />
        </>
      )}
    </div>
  );
}

function SummarySection<T>({
  title,
  items,
  renderItem,
}: {
  title: string;
  items: T[];
  renderItem: (item: T) => string;
}): JSX.Element {
  return (
    <div className={classes.section}>
      <div className={classes.sectionTitle}>{title}</div>
      {items.length === 0 ? (
        <div className={classes.noneRecorded}>None recorded</div>
      ) : (
        <div className={classes.pillList}>
          {items.map((item, i) => (
            <span className={classes.pill} key={i}>
              <span className={classes.pillDot} />
              {renderItem(item)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function CoverageSection({ coverages }: { coverages: Tables<'coverages'>[] }): JSX.Element {
  return (
    <div className={classes.section}>
      <div className={classes.sectionTitle}>Coverage</div>
      {coverages.length === 0 ? (
        <div className={classes.noneRecorded}>None recorded</div>
      ) : (
        <div className={classes.pillList}>
          {coverages.map((c, i) => (
            <span className={classes.coveragePill} key={i}>
              <span className={classes.pillDot} />
              {c.subscriber_id ?? 'Coverage'}
              {c.status && (
                <span className={classes.coverageStatus}>{c.status}</span>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
