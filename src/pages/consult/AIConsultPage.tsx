import type { JSX } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAIConsult } from '../../hooks/useAIConsult';
import { PatientSelectPanel } from '../../components/consult/PatientSelectPanel';
import { ChatArea } from '../../components/consult/ChatArea';
import { ContextPanel } from '../../components/consult/ContextPanel';
import type { Tables } from '../../lib/supabase/types';
import classes from './AIConsultPage.module.css';

type Patient = Tables<'patients'>;

export function AIConsultPage(): JSX.Element {
  const navigate = useNavigate();
  const { patientId: routePatientId } = useParams<{ patientId?: string }>();
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>(routePatientId);
  const { messages, sendMessage, isStreaming, error, clearConversation } = useAIConsult(selectedPatientId);

  // Load patient from route param on mount
  useEffect(() => {
    if (routePatientId && routePatientId !== selectedPatientId) {
      setSelectedPatientId(routePatientId);
    }
  }, [routePatientId]);

  const handleSelectPatient = useCallback(
    (patient: Patient) => {
      if (patient.id !== selectedPatientId) {
        clearConversation();
        setSelectedPatientId(patient.id);
        navigate(`/consult/${patient.id}`, { replace: true });
      }
    },
    [selectedPatientId, clearConversation, navigate],
  );

  return (
    <div className={classes.container}>
      <div className={classes.left}>
        <PatientSelectPanel
          selectedPatientId={selectedPatientId}
          onSelectPatient={handleSelectPatient}
        />
      </div>
      <div className={classes.center}>
        <ChatArea
          messages={messages}
          isStreaming={isStreaming}
          error={error}
          onSend={sendMessage}
          hasPatient={!!selectedPatientId}
        />
      </div>
      <div className={classes.right}>
        <ContextPanel patientId={selectedPatientId} />
      </div>
    </div>
  );
}
