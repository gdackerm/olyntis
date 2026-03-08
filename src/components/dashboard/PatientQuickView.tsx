import { Button, Group, Loader, Modal } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { patientService } from '../../services/patient.service';
import { formatPatientName, formatDate, getInitials } from '../../lib/utils';
import classes from './PatientQuickView.module.css';

interface PatientQuickViewProps {
  patientId: string | null;
  onClose: () => void;
}

export function PatientQuickView({ patientId, onClose }: PatientQuickViewProps): JSX.Element {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!patientId) {
      setData(null);
      return;
    }
    setLoading(true);
    patientService.getWithRelated(patientId)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [patientId]);

  const patient = data?.patient;
  const medications = data?.medications ?? [];
  const conditions = data?.conditions ?? [];

  const name = patient ? formatPatientName(patient) : '';
  const initials = patient ? getInitials(patient.given_name, patient.family_name) : '';
  const primaryCondition = conditions[0]?.code_display ?? 'No conditions recorded';

  return (
    <Modal
      opened={!!patientId}
      onClose={onClose}
      size="lg"
      radius="lg"
      padding={0}
      withCloseButton={false}
      overlayProps={{ backgroundOpacity: 0.4, blur: 4 }}
    >
      {loading ? (
        <div style={{ padding: 48, textAlign: 'center' }}>
          <Loader />
        </div>
      ) : patient ? (
        <>
          <div style={{ padding: '24px 28px 18px', borderBottom: '1px solid var(--oly-stone)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div className={classes.header}>
                <div className={classes.avatar}>{initials}</div>
                <div>
                  <div className={classes.name}>{name}</div>
                  <div className={classes.meta}>
                    DOB: {formatDate(patient.birth_date)} &middot; {primaryCondition}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '24px 28px' }}>
            <div className={classes.section}>
              <div className={classes.sectionTitle}>AI Pre-Session Brief</div>
              <div className={classes.aiBox}>
                <IconSparkles size={15} color="var(--oly-ai-glow)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div className={classes.aiText}>
                  {name} presents for follow-up. {conditions.length > 0 ? `Active conditions include ${conditions.slice(0, 3).map((c: any) => c.code_display).join(', ')}.` : ''} {medications.length > 0 ? `Currently on ${medications.length} active medication${medications.length > 1 ? 's' : ''}.` : 'No active medications.'} Review recent screening scores and treatment response.
                </div>
              </div>
            </div>

            <div className={classes.section}>
              <div className={classes.sectionTitle}>Clinical Overview</div>
              <div className={classes.infoGrid}>
                <div>
                  <div className={classes.infoLabel}>Primary Diagnosis</div>
                  <div className={classes.infoValue}>{primaryCondition}</div>
                </div>
                <div>
                  <div className={classes.infoLabel}>Date of Birth</div>
                  <div className={classes.infoValue}>{formatDate(patient.birth_date)}</div>
                </div>
                <div>
                  <div className={classes.infoLabel}>Gender</div>
                  <div className={classes.infoValue}>{patient.gender ?? 'Not specified'}</div>
                </div>
                <div>
                  <div className={classes.infoLabel}>Active Conditions</div>
                  <div className={classes.infoValue}>{conditions.length}</div>
                </div>
              </div>
            </div>

            {medications.length > 0 && (
              <div className={classes.section}>
                <div className={classes.sectionTitle}>Active Medications</div>
                <div>
                  {medications.slice(0, 6).map((med: any) => (
                    <span key={med.id} className={classes.medPill}>
                      <div className={classes.medDot} />
                      {med.medication_display ?? 'Unknown medication'}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{
            padding: '16px 28px 24px',
            display: 'flex', gap: 10, justifyContent: 'flex-end',
            borderTop: '1px solid var(--oly-stone)',
          }}>
            <Button
              variant="default"
              radius="sm"
              onClick={() => { onClose(); navigate(`/Patient/${patientId}`); }}
            >
              Full Chart
            </Button>
            <Button
              color="forest"
              radius="sm"
              onClick={() => { onClose(); navigate(`/Patient/${patientId}`); }}
            >
              Start Session &rarr;
            </Button>
          </div>
        </>
      ) : null}
    </Modal>
  );
}
