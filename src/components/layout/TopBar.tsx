import { ActionIcon } from '@mantine/core';
import { IconBell, IconPlus, IconSearch } from '@tabler/icons-react';
import type { JSX } from 'react';
import dayjs from 'dayjs';
import { useAuth } from '../../providers/AuthProvider';
import classes from './TopBar.module.css';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

interface TopBarProps {
  appointmentCount?: number;
}

export function TopBar({ appointmentCount = 0 }: TopBarProps): JSX.Element {
  const { practitioner } = useAuth();
  const name = practitioner?.given_name
    ? `Dr. ${practitioner.family_name}`
    : 'Doctor';

  const today = dayjs().format('dddd, MMMM D, YYYY');

  return (
    <header className={classes.topbar}>
      <div className={classes.greeting}>
        <div className={classes.greetingText}>
          {getGreeting()}, {name}
        </div>
        <div className={classes.greetingDate}>
          {today} &middot; {appointmentCount} appointment{appointmentCount !== 1 ? 's' : ''} today
        </div>
      </div>

      <div className={classes.search}>
        <IconSearch size={15} stroke={2} />
        <input
          className={classes.searchInput}
          type="text"
          placeholder="Search patients, notes, Rx…"
        />
      </div>

      <div className={classes.actions}>
        <div className={classes.aiPill}>
          <div className={classes.aiDot} />
          <span className={classes.aiText}>AI Active</span>
        </div>

        <ActionIcon variant="subtle" color="gray" size="lg" style={{ position: 'relative' }}>
          <IconBell size={18} />
          <div className={classes.notifDot} />
        </ActionIcon>

        <ActionIcon variant="subtle" color="gray" size="lg">
          <IconPlus size={18} />
        </ActionIcon>
      </div>
    </header>
  );
}
