import type { JSX } from 'react';
import classes from './AIDisclaimer.module.css';

export function AIDisclaimer(): JSX.Element {
  return (
    <div className={classes.disclaimer}>
      AI-generated &middot; Verify independently &middot; Not clinical advice
    </div>
  );
}
