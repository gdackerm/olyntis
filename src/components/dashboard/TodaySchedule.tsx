import { Paper, Text } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import type { JSX } from 'react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router';
import type { TodayAppointment } from '../../hooks/useDashboardData';
import classes from './TodaySchedule.module.css';

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

function getStatusClass(status: string | null): string {
  switch (status) {
    case 'fulfilled':
    case 'completed':
    case 'finished':
      return classes.complete;
    case 'arrived':
    case 'checked-in':
      return classes.checkedIn;
    case 'booked':
    case 'confirmed':
      return classes.confirmed;
    default:
      return classes.pending;
  }
}

function getStatusLabel(status: string | null): string {
  switch (status) {
    case 'fulfilled':
    case 'completed':
    case 'finished':
      return 'Completed';
    case 'arrived':
    case 'checked-in':
      return 'Checked In';
    case 'booked':
      return 'Confirmed';
    case 'pending':
      return 'Pending';
    default:
      return status ?? 'Booked';
  }
}

interface TodayScheduleProps {
  appointments: TodayAppointment[];
  onPatientClick?: (patientId: string) => void;
}

export function TodaySchedule({ appointments, onPatientClick }: TodayScheduleProps): JSX.Element {
  const navigate = useNavigate();

  // Find the next upcoming appointment (first non-completed one)
  const now = dayjs();
  const nextUpIdx = appointments.findIndex(
    (a) => dayjs(a.startTime).isAfter(now) || a.status === 'arrived' || a.status === 'checked-in'
  );

  return (
    <Paper withBorder radius="md" style={{ background: 'var(--oly-warm-white)', overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 20px 14px',
        borderBottom: '1px solid var(--oly-stone)',
      }}>
        <Text ff="'Lora', serif" fz={15} fw={500} c="var(--oly-charcoal)">
          Today's Schedule
        </Text>
        <Text
          size="xs"
          fw={500}
          c="var(--oly-sage)"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/schedule')}
        >
          View calendar &rarr;
        </Text>
      </div>

      <div className={classes.list}>
        {appointments.length === 0 ? (
          <div className={classes.empty}>No appointments scheduled for today</div>
        ) : (
          appointments.map((appt, idx) => (
            <div
              key={appt.id}
              className={`${classes.item} ${idx === nextUpIdx ? classes.nextUp : ''}`}
              onClick={() => {
                if (onPatientClick) {
                  onPatientClick(appt.patientId);
                } else {
                  navigate(`/Patient/${appt.patientId}`);
                }
              }}
            >
              {idx === nextUpIdx && <div className={classes.nextBadge} />}
              <div className={classes.time}>{dayjs(appt.startTime).format('h:mm')}</div>
              <div
                className={classes.avatar}
                style={{ background: getAvatarGradient(appt.patientName) }}
              >
                {appt.patientInitials}
              </div>
              <div className={classes.info}>
                <div className={classes.name}>{appt.patientName}</div>
                <div className={classes.type}>{appt.reason}</div>
              </div>
              <div className={`${classes.status} ${getStatusClass(appt.status)}`}>
                {getStatusLabel(appt.status)}
              </div>
              <button
                className={classes.aiBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onPatientClick) onPatientClick(appt.patientId);
                }}
              >
                <IconSparkles size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </Paper>
  );
}
