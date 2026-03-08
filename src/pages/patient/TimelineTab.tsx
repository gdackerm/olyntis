import { Loader } from '@mantine/core';
import { IconStethoscope, IconUrgent } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import type { Tables } from '../../lib/supabase/types';
import { formatDateTime } from '../../lib/utils';
import { usePatient } from '../../hooks/usePatient';
import { encounterService } from '../../services/encounter.service';
import classes from './TimelineTab.module.css';

type Encounter = Tables<'encounters'>;

function getEncounterLabel(classCode: string | null): string {
  switch (classCode?.toUpperCase()) {
    case 'AMB': return 'Ambulatory';
    case 'EMER': return 'Emergency';
    case 'IMP': return 'Inpatient';
    case 'VR': return 'Virtual';
    default: return classCode ?? 'Visit';
  }
}

function getStatusClass(status: string | null): string {
  switch (status) {
    case 'fulfilled':
    case 'finished':
      return classes.fulfilled;
    case 'cancelled':
      return classes.cancelled;
    case 'in-progress':
      return classes.inProgress;
    case 'planned':
      return classes.planned;
    default:
      return classes.planned;
  }
}

export function TimelineTab(): JSX.Element {
  const patient = usePatient();
  const navigate = useNavigate();
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEncounters = useCallback(async () => {
    if (!patient?.id) return;
    setLoading(true);
    try {
      const result = await encounterService.getByPatientId(patient.id);
      setEncounters(result);
    } catch (err) {
      console.error('Failed to load encounters:', err);
    } finally {
      setLoading(false);
    }
  }, [patient?.id]);

  useEffect(() => {
    fetchEncounters();
  }, [fetchEncounters]);

  if (!patient) {
    return <Loader />;
  }

  if (loading) {
    return <Loader />;
  }

  if (encounters.length === 0) {
    return (
      <div className={classes.container}>
        <div className={classes.empty}>No encounters recorded yet</div>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <div className={classes.countLabel}>
        {encounters.length} encounter{encounters.length !== 1 ? 's' : ''}
      </div>
      <div className={classes.list}>
        {encounters.map((encounter) => {
          const isEmergency = encounter.class_code?.toUpperCase() === 'EMER';
          return (
            <div
              key={encounter.id}
              className={classes.row}
              onClick={() =>
                navigate(`/Patient/${patient.id}/Encounter/${encounter.id}`)?.catch(console.error)
              }
            >
              <div className={classes.icon}>
                {isEmergency ? (
                  <IconUrgent size={16} />
                ) : (
                  <IconStethoscope size={16} />
                )}
              </div>
              <div className={classes.info}>
                <div className={classes.visitType}>
                  {getEncounterLabel(encounter.class_code)}
                </div>
                <div className={classes.dateRange}>
                  {encounter.period_start
                    ? `${formatDateTime(encounter.period_start)}${encounter.period_end ? ` – ${formatDateTime(encounter.period_end)}` : ''}`
                    : `Created ${formatDateTime(encounter.created_at)}`}
                </div>
              </div>
              {encounter.status && (
                <span className={`${classes.status} ${getStatusClass(encounter.status)}`}>
                  {encounter.status}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
