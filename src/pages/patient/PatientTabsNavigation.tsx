import type { JSX } from 'react';
import type { PatientPageTabInfo } from './PatientPage.utils';
import classes from './PatientTabsNavigation.module.css';

interface PatientTabsNavigationProps {
  tabs: PatientPageTabInfo[];
  currentTab: string;
  onTabChange: (value: string | null) => void;
}

export function PatientTabsNavigation({ tabs, currentTab, onTabChange }: PatientTabsNavigationProps): JSX.Element {
  return (
    <nav className={classes.tabBar}>
      {tabs.map((t) => (
        <button
          key={t.id}
          className={`${classes.tab} ${currentTab.toLowerCase() === t.id ? classes.tabActive : ''}`}
          onClick={() => onTabChange(t.id)}
          type="button"
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
