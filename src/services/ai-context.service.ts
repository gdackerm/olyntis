import { patientService } from './patient.service';
import { conditionService } from './condition.service';
import { medicationService } from './medication.service';
import { allergyService } from './allergy.service';
import { observationService } from './observation.service';
import { encounterService } from './encounter.service';
import { clinicalImpressionService } from './clinical-impression.service';
import { familyHistoryService } from './family-history.service';
import { formatPatientName, formatAge, formatGender, formatDate } from '../lib/utils';

export interface PatientAIContext {
  name: string;
  age: string;
  gender: string;
  birthDate: string;
  conditions: Array<{ display: string; status: string }>;
  medications: Array<{ display: string; status: string }>;
  allergies: Array<{ display: string }>;
  screeningScores: Array<{ instrument: string; score: number; date: string }>;
  encounters: Array<{ date: string; type: string; status: string }>;
  notes: Array<{ date: string; text: string }>;
  familyHistory: Array<{ relationship: string; condition: string }>;
}

export async function assemblePatientContext(patientId: string): Promise<PatientAIContext> {
  const [patient, conditions, medications, allergies, observations, encounters, impressions, familyHistory] =
    await Promise.all([
      patientService.getById(patientId).catch(() => null),
      conditionService.getByPatientId(patientId).catch(() => []),
      medicationService.getByPatientId(patientId).catch(() => []),
      allergyService.getByPatientId(patientId).catch(() => []),
      observationService.getByPatientId(patientId).catch(() => []),
      encounterService.getByPatientId(patientId).catch(() => []),
      clinicalImpressionService.getByPatientId(patientId).catch(() => []),
      familyHistoryService.getByPatientId(patientId).catch(() => []),
    ]);

  // Screening scores: filter to known instruments, limit 5 per instrument
  const screeningCodes: Record<string, string> = {
    '44261-6': 'PHQ-9',
    '70274-6': 'GAD-7',
    '75626-2': 'AUDIT-C',
  };
  const scoreCounts: Record<string, number> = {};
  const screeningScores: PatientAIContext['screeningScores'] = [];
  for (const obs of observations) {
    const instrument = screeningCodes[obs.code_value ?? ''];
    if (!instrument) continue;
    scoreCounts[instrument] = (scoreCounts[instrument] ?? 0) + 1;
    if (scoreCounts[instrument] > 5) continue;

    const valueObj = obs.value as any;
    const score =
      valueObj?.valueQuantity?.value ??
      valueObj?.valueInteger ??
      valueObj?.value ??
      (typeof valueObj === 'number' ? valueObj : 0);

    screeningScores.push({
      instrument,
      score: Number(score),
      date: formatDate(obs.effective_date),
    });
  }

  // Encounters: limit to 20
  const mappedEncounters = encounters.slice(0, 20).map((e) => ({
    date: formatDate(e.period_start ?? e.created_at),
    type: e.class_code ?? 'Encounter',
    status: e.status ?? 'unknown',
  }));

  // Notes: limit to 10, cap at 500 chars
  const mappedNotes = impressions.slice(0, 10).map((n) => ({
    date: formatDate(n.created_at),
    text: (n.note_text ?? n.description ?? '').slice(0, 500),
  }));

  // Family history
  const mappedFamilyHistory = familyHistory.map((f) => {
    const rel = f.relationship as any;
    const cond = f.condition as any;
    return {
      relationship: rel?.coding?.[0]?.display ?? rel?.text ?? 'Unknown',
      condition: cond?.code?.coding?.[0]?.display ?? cond?.code?.text ?? cond?.display ?? 'Unknown',
    };
  });

  return {
    name: patient ? formatPatientName(patient) : 'Unknown',
    age: patient ? formatAge(patient.birth_date) : 'Unknown',
    gender: patient ? formatGender(patient.gender) : 'Unknown',
    birthDate: patient ? formatDate(patient.birth_date) : 'Unknown',
    conditions: conditions.map((c) => ({
      display: c.code_display ?? c.code_value ?? 'Unknown',
      status: c.clinical_status ?? 'unknown',
    })),
    medications: medications.map((m) => ({
      display: m.medication_display ?? m.medication_code ?? 'Unknown',
      status: m.status ?? 'unknown',
    })),
    allergies: allergies.map((a) => ({
      display: a.code_display ?? a.code_value ?? 'Unknown',
    })),
    screeningScores,
    encounters: mappedEncounters,
    notes: mappedNotes,
    familyHistory: mappedFamilyHistory,
  };
}
