import type { JSX, ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import classes from './DashboardShell.module.css';

interface DashboardShellProps {
  children: ReactNode;
  appointmentCount?: number;
}

export function DashboardShell({ children, appointmentCount }: DashboardShellProps): JSX.Element {
  return (
    <div className={classes.shell}>
      <Sidebar />
      <div className={classes.main}>
        <TopBar appointmentCount={appointmentCount} />
        <div className={classes.content}>{children}</div>
      </div>
    </div>
  );
}
