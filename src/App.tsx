import { Loader } from '@mantine/core';
import type { JSX } from 'react';
import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import './index.css';
import { useAuth } from './providers/AuthProvider';
import { DashboardShell } from './components/layout/DashboardShell';

import { DashboardPage } from './pages/dashboard/DashboardPage';
import { EncounterChartPage } from './pages/encounter/EncounterChartPage';
import { EncounterModal } from './pages/encounter/EncounterModal';
import { IntegrationsPage } from './pages/integrations/IntegrationsPage';
import { MessagesPage } from './pages/messages/MessagesPage';
import { CommunicationTab } from './pages/patient/CommunicationTab';
import { EditTab } from './pages/patient/EditTab';
import { IntakeFormPage } from './pages/patient/IntakeFormPage';
import { PatientPage } from './pages/patient/PatientPage';
import { PatientListPage } from './pages/patient/PatientListPage';
import { TasksTab } from './pages/patient/TasksTab';
import { TimelineTab } from './pages/patient/TimelineTab';
import { SchedulePage } from './pages/schedule/SchedulePage';
import { SignInPage } from './pages/SignInPage';
import { SpacesPage } from './pages/spaces/SpacesPage';
import { TasksPage } from './pages/tasks/TasksPage';
import { GetStartedPage } from './pages/getstarted/GetStartedPage';
import { AIConsultPage } from './pages/consult/AIConsultPage';

export function App(): JSX.Element | null {
  const { practitioner, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader />
      </div>
    );
  }

  if (!practitioner) {
    return (
      <Routes>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    );
  }

  return (
    <DashboardShell>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/getstarted" element={<GetStartedPage />} />
          <Route path="/consult" element={<AIConsultPage />} />
          <Route path="/consult/:patientId" element={<AIConsultPage />} />
          <Route path="/Spaces/Communication" element={<SpacesPage />}>
            <Route index element={<SpacesPage />} />
            <Route path=":topicId" element={<SpacesPage />} />
          </Route>
          <Route path="/Patient" element={<PatientListPage />} />
          <Route path="/Patient/:patientId" element={<PatientPage />}>
            <Route path="Encounter/new" element={<EncounterModal />} />
            <Route path="Encounter/:encounterId" element={<EncounterChartPage />} />
            <Route path="edit" element={<EditTab />} />
            <Route path="Communication" element={<CommunicationTab />} />
            <Route path="Communication/:messageId" element={<CommunicationTab />} />
            <Route path="Task" element={<TasksTab />} />
            <Route path="Task/:taskId" element={<TasksTab />} />
            <Route path="timeline" element={<TimelineTab />} />
            <Route path="" element={<TimelineTab />} />
          </Route>
          <Route path="/Communication" element={<MessagesPage />}>
            <Route index element={<MessagesPage />} />
            <Route path=":messageId" element={<MessagesPage />} />
          </Route>
          <Route path="Task" element={<TasksPage />} />
          <Route path="Task/:taskId" element={<TasksPage />} />
          <Route path="/onboarding" element={<IntakeFormPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/signin" element={<Navigate to="/" replace />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
        </Routes>
      </Suspense>
    </DashboardShell>
  );
}
