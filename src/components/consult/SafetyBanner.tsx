import { IconAlertTriangle } from '@tabler/icons-react';
import type { JSX } from 'react';
import classes from './SafetyBanner.module.css';

export function SafetyBanner(): JSX.Element {
  return (
    <div className={classes.banner}>
      <IconAlertTriangle size={16} color="var(--oly-ai-glow)" />
      <span>
        AI Consult is an advisory tool. All outputs require clinical validation and are not a
        substitute for professional judgment.
      </span>
    </div>
  );
}
