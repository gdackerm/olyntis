import { useEffect, useState } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { appointmentService } from '../services/appointment.service';
import { observationService } from '../services/observation.service';
import { clinicalImpressionService } from '../services/clinical-impression.service';
import { medicationService } from '../services/medication.service';

export interface RiskAlert {
  patientId: string;
  patientName: string;
  reason: string;
  severity: 'high' | 'moderate';
  scoreType: string;
  score: number;
}

export interface ScreeningScore {
  patientId: string;
  patientName: string;
  codeDisplay: string;
  codeValue: string;
  score: number;
  date: string;
}

export interface DashboardStats {
  todayAppointments: number;
  riskAlerts: number;
  rxPending: number;
  notesComplete: number;
  notesTotal: number;
}

export interface TodayAppointment {
  id: string;
  startTime: string;
  endTime: string | null;
  status: string | null;
  patientId: string;
  patientName: string;
  patientInitials: string;
  reason: string;
}

export function useDashboardData() {
  const { practitioner } = useAuth();
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([]);
  const [screeningScores, setScreeningScores] = useState<ScreeningScore[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    riskAlerts: 0,
    rxPending: 0,
    notesComplete: 0,
    notesTotal: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!practitioner) return;

    async function fetchAll() {
      try {
        const [appts, scores, completedNotes, rxResult] = await Promise.all([
          appointmentService.getTodayForPractitioner(practitioner!.id).catch(() => []),
          observationService.getRecentScreeningScores(90).catch(() => []),
          clinicalImpressionService.getCompletedToday().catch(() => []),
          medicationService.list({
            filters: { status: 'active' },
            pageSize: 1000,
          }).catch(() => ({ data: [], count: 0 })),
        ]);

        // Process appointments
        const mappedAppts: TodayAppointment[] = (appts ?? []).map((a: any) => {
          const patient = a.patients;
          const givenArr = patient?.given_name;
          const given = Array.isArray(givenArr) ? givenArr[0] : (givenArr ?? '');
          const family = patient?.family_name ?? '';
          const initials = (given[0] ?? '').toUpperCase() + (family[0] ?? '').toUpperCase();
          const reasonObj = a.reason;
          let reasonText = 'Appointment';
          if (reasonObj && typeof reasonObj === 'object') {
            reasonText = (reasonObj as any).display || (reasonObj as any).text || 'Appointment';
          }
          return {
            id: a.id,
            startTime: a.start_time,
            endTime: a.end_time,
            status: a.status,
            patientId: patient?.id ?? a.patient_id,
            patientName: `${given} ${family}`.trim(),
            patientInitials: initials || '??',
            reason: reasonText,
          };
        });

        // Process screening scores and risk alerts
        const scoreMap = new Map<string, ScreeningScore[]>();
        const allScores: ScreeningScore[] = [];

        for (const obs of (scores ?? [])) {
          const patient = (obs as any).patients;
          const givenArr = patient?.given_name;
          const given = Array.isArray(givenArr) ? givenArr[0] : (givenArr ?? '');
          const family = patient?.family_name ?? '';
          const valueObj = obs.value as any;
          const score = valueObj?.valueQuantity?.value
            ?? valueObj?.valueInteger
            ?? valueObj?.value
            ?? (typeof valueObj === 'number' ? valueObj : 0);

          const screeningScore: ScreeningScore = {
            patientId: obs.patient_id,
            patientName: `${given} ${family}`.trim(),
            codeDisplay: obs.code_display ?? obs.code_value ?? 'Screening',
            codeValue: obs.code_value ?? '',
            score: Number(score),
            date: obs.effective_date ?? obs.created_at ?? '',
          };
          allScores.push(screeningScore);

          const key = `${obs.patient_id}-${obs.code_value}`;
          if (!scoreMap.has(key)) {
            scoreMap.set(key, []);
          }
          scoreMap.get(key)!.push(screeningScore);
        }

        // Build risk alerts from high scores (latest per patient per instrument)
        const alerts: RiskAlert[] = [];
        const seenPatientCode = new Set<string>();
        for (const score of allScores) {
          const key = `${score.patientId}-${score.codeValue}`;
          if (seenPatientCode.has(key)) continue;
          seenPatientCode.add(key);

          // PHQ-9: >=15 high, >=10 moderate; GAD-7: >=15 high, >=10 moderate
          if (score.score >= 10) {
            const severity = score.score >= 15 ? 'high' : 'moderate';
            alerts.push({
              patientId: score.patientId,
              patientName: score.patientName,
              reason: `${score.codeDisplay} score ${score.score}`,
              severity,
              scoreType: score.codeDisplay,
              score: score.score,
            });
          }
        }

        // Sort alerts: high first, then moderate
        alerts.sort((a, b) => (a.severity === 'high' ? 0 : 1) - (b.severity === 'high' ? 0 : 1));

        setTodayAppointments(mappedAppts);
        setRiskAlerts(alerts);
        setScreeningScores(allScores);
        setStats({
          todayAppointments: mappedAppts.length,
          riskAlerts: alerts.length,
          rxPending: rxResult.count ?? rxResult.data.length,
          notesComplete: completedNotes?.length ?? 0,
          notesTotal: mappedAppts.length,
        });
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [practitioner]);

  return { todayAppointments, riskAlerts, screeningScores, stats, loading };
}
