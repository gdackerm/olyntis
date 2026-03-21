import { Loader } from '@mantine/core';
import type { JSX } from 'react';
import { useState } from 'react';
import { useDashboardData } from '../../hooks/useDashboardData';
import { StatCards } from '../../components/dashboard/StatCards';
import { RoleSwitcher } from '../../components/dashboard/RoleSwitcher';
import { TodaySchedule } from '../../components/dashboard/TodaySchedule';
import { SessionNoteEditor } from '../../components/dashboard/SessionNoteEditor';
import { AIInsightsPanel } from '../../components/dashboard/AIInsightsPanel';
import { RiskFlagsCard } from '../../components/dashboard/RiskFlagsCard';
import { TreatmentProgress } from '../../components/dashboard/TreatmentProgress';
import { MiniCalendar } from '../../components/dashboard/MiniCalendar';
import { PatientQuickView } from '../../components/dashboard/PatientQuickView';
import { AIOnboardingModal } from '../../components/onboarding/AIOnboardingModal';
import { useOnboardingModal } from '../../components/onboarding/useOnboardingModal';
import classes from './DashboardPage.module.css';

export function DashboardPage(): JSX.Element {
  const { todayAppointments, riskAlerts, screeningScores, stats, loading } = useDashboardData();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const { isOpen: isOnboardingOpen, close: closeOnboarding } = useOnboardingModal();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Loader />
      </div>
    );
  }

  // Get first upcoming patient name for note editor
  const nextPatient = todayAppointments.find(
    (a) => a.status !== 'fulfilled' && a.status !== 'completed' && a.status !== 'finished'
  );

  return (
    <>
      <RoleSwitcher />
      <StatCards stats={stats} />

      <div className={classes.grid}>
        <div className={classes.left}>
          <TodaySchedule
            appointments={todayAppointments}
            onPatientClick={(id) => setSelectedPatientId(id)}
          />
          <SessionNoteEditor patientName={nextPatient?.patientName} />
        </div>

        <div className={classes.right}>
          <AIInsightsPanel riskAlerts={riskAlerts} screeningScores={screeningScores} />
          <RiskFlagsCard alerts={riskAlerts} />
          <TreatmentProgress screeningScores={screeningScores} />
          <MiniCalendar />
        </div>
      </div>

      <PatientQuickView
        patientId={selectedPatientId}
        onClose={() => setSelectedPatientId(null)}
      />

      <AIOnboardingModal open={isOnboardingOpen} onClose={closeOnboarding} />
    </>
  );
}
