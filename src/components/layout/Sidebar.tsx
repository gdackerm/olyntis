import {
  IconCalendarEvent,
  IconChartBar,
  IconClipboardCheck,
  IconCurrencyDollar,
  IconFileText,
  IconLayoutDashboard,
  IconPill,
  IconSettings,
  IconSparkles,
  IconUsers,
} from '@tabler/icons-react';
import type { JSX } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../providers/AuthProvider';
import { getInitials } from '../../lib/utils';
import classes from './Sidebar.module.css';

interface NavItem {
  icon: JSX.Element;
  label: string;
  href: string;
  badge?: number;
}

const mainNav: NavItem[] = [
  { icon: <IconLayoutDashboard size={20} />, label: 'Dashboard', href: '/' },
  { icon: <IconCalendarEvent size={20} />, label: 'Schedule', href: '/schedule' },
  { icon: <IconUsers size={20} />, label: 'Patients', href: '/Patient' },
];

const clinicalNav: NavItem[] = [
  { icon: <IconSparkles size={20} />, label: 'AI Consult', href: '/consult' },
  { icon: <IconFileText size={20} />, label: 'Notes', href: '/Communication' },
  { icon: <IconClipboardCheck size={20} />, label: 'Treatment Plans', href: '/Task' },
  { icon: <IconPill size={20} />, label: 'Prescriptions', href: '/integrations' },
];

const opsNav: NavItem[] = [
  { icon: <IconCurrencyDollar size={20} />, label: 'Billing', href: '/Spaces/Communication' },
  { icon: <IconChartBar size={20} />, label: 'Reports', href: '/Spaces/Communication' },
];

export function Sidebar(): JSX.Element {
  const { practitioner } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const renderNavItem = (item: NavItem) => (
    <button
      key={item.href + item.label}
      className={`${classes.navItem} ${isActive(item.href) ? classes.active : ''}`}
      onClick={() => navigate(item.href)}
    >
      <span className={classes.navIcon}>{item.icon}</span>
      <span className={classes.navItemText}>{item.label}</span>
      {item.badge != null && <span className={classes.navBadge}>{item.badge}</span>}
    </button>
  );

  const initials = getInitials(
    practitioner?.given_name ?? '',
    practitioner?.family_name ?? ''
  );

  return (
    <aside className={classes.sidebar}>
      <div className={classes.logo}>
        <div className={classes.logoMark}>O</div>
        <span className={classes.logoText}>Olyntis</span>
      </div>

      <div className={classes.navSection} style={{ marginBottom: 16 }}>
        {mainNav.map(renderNavItem)}
      </div>

      <div className={classes.navSection}>
        <div className={classes.navLabel}>Clinical</div>
        {clinicalNav.map(renderNavItem)}
      </div>

      <div className={classes.navSection} style={{ marginTop: 12 }}>
        <div className={classes.navLabel}>Operations</div>
        {opsNav.map(renderNavItem)}
      </div>

      <div className={classes.bottom}>
        <button className={classes.navItem} onClick={() => navigate('/integrations')}>
          <span className={classes.navIcon}>
            <IconSettings size={20} />
          </span>
          <span className={classes.navItemText}>Settings</span>
        </button>
        <div className={classes.navItem} style={{ marginTop: 8, cursor: 'default' }}>
          <div className={classes.userAvatar}>{initials}</div>
          <div className={classes.userInfo}>
            <div className={classes.userName}>
              {practitioner?.given_name} {practitioner?.family_name}
            </div>
            <div className={classes.userRole}>Psychiatrist</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
