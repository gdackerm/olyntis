import { Paper, Text } from '@mantine/core';
import { Calendar } from '@mantine/dates';
import type { JSX } from 'react';

export function MiniCalendar(): JSX.Element {
  return (
    <Paper withBorder radius="md" style={{ background: 'var(--oly-warm-white)', overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 20px 14px',
        borderBottom: '1px solid var(--oly-stone)',
      }}>
        <Text ff="'Lora', serif" fz={15} fw={500} c="var(--oly-charcoal)">
          Calendar
        </Text>
        <Text size="xs" fw={500} c="var(--oly-sage)" style={{ cursor: 'pointer' }}>
          + New appt
        </Text>
      </div>
      <div style={{ padding: '12px 16px' }}>
        <Calendar
          size="xs"
          styles={{
            calendarHeader: { marginBottom: 4 },
            calendarHeaderControl: {
              width: 28,
              height: 28,
              borderRadius: 6,
              border: '1px solid var(--oly-stone)',
              color: 'var(--oly-stone-dark)',
            },
            calendarHeaderLevel: {
              fontFamily: "'Lora', serif",
              fontSize: 15,
              fontWeight: 500,
            },
            weekday: {
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--oly-stone-dark)',
              textTransform: 'uppercase',
            },
            day: {
              fontSize: 12,
              borderRadius: '50%',
            },
          }}
        />
      </div>
    </Paper>
  );
}
