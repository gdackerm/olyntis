import { IconSearch, IconSparkles } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import { patientService } from '../../services/patient.service';
import { observationService } from '../../services/observation.service';
import { formatPatientName, formatAge, formatGender, formatDate, getInitials } from '../../lib/utils';
import type { Tables } from '../../lib/supabase/types';
import classes from './PatientSelectPanel.module.css';

type Patient = Tables<'patients'>;

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #7BA898, #4E7A6A)',
  'linear-gradient(135deg, #C05555, #A03A3A)',
  'linear-gradient(135deg, #D4823A, #B06828)',
  'linear-gradient(135deg, #4E8C6A, #3A6E54)',
  'linear-gradient(135deg, #8A6AB5, #6A50A0)',
  'linear-gradient(135deg, #5E8E84, #3D6357)',
];

function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

interface ScreeningScore {
  instrument: string;
  score: number;
  date: string;
}

interface PatientSelectPanelProps {
  selectedPatientId: string | undefined;
  onSelectPatient: (patient: Patient) => void;
}

export function PatientSelectPanel({ selectedPatientId, onSelectPatient }: PatientSelectPanelProps): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchQuery, 300);
  const [results, setResults] = useState<Patient[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [scores, setScores] = useState<ScreeningScore[]>([]);

  // Search
  const search = useCallback(async () => {
    if (!debouncedSearch) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const data = await patientService.search(debouncedSearch);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    search();
  }, [search]);

  // Load selected patient
  useEffect(() => {
    if (!selectedPatientId) {
      setSelectedPatient(null);
      setScores([]);
      return;
    }
    patientService.getById(selectedPatientId).then(setSelectedPatient).catch(() => {});

    // Load screening scores for selected patient
    const screeningCodes: Record<string, string> = {
      '44261-6': 'PHQ-9',
      '70274-6': 'GAD-7',
      '75626-2': 'AUDIT-C',
    };
    observationService.getByPatientId(selectedPatientId).then((obs) => {
      const seen = new Set<string>();
      const patientScores: ScreeningScore[] = [];
      for (const o of obs) {
        const instrument = screeningCodes[o.code_value ?? ''];
        if (!instrument || seen.has(instrument)) continue;
        seen.add(instrument);
        const valueObj = o.value as any;
        const score =
          valueObj?.valueQuantity?.value ??
          valueObj?.valueInteger ??
          valueObj?.value ??
          (typeof valueObj === 'number' ? valueObj : 0);
        patientScores.push({ instrument, score: Number(score), date: formatDate(o.effective_date) });
      }
      setScores(patientScores);
    }).catch(() => {});
  }, [selectedPatientId]);

  const handleSelect = (patient: Patient) => {
    setSearchQuery('');
    setResults([]);
    onSelectPatient(patient);
  };

  return (
    <div className={classes.panel}>
      <div className={classes.header}>
        <IconSparkles size={18} color="var(--oly-ai-glow)" />
        <span className={classes.title}>AI Consult</span>
      </div>

      <div className={classes.searchContainer}>
        <IconSearch size={15} color="var(--oly-stone-dark)" className={classes.searchIcon} />
        <input
          className={classes.searchInput}
          placeholder="Search patients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Search results dropdown */}
      {results.length > 0 && (
        <div className={classes.searchResults}>
          {results.map((p) => {
            const name = formatPatientName(p);
            return (
              <button key={p.id} className={classes.searchResult} onClick={() => handleSelect(p)}>
                <div className={classes.resultAvatar} style={{ background: getAvatarGradient(name) }}>
                  {getInitials(p.given_name, p.family_name)}
                </div>
                <div>
                  <div className={classes.resultName}>{name}</div>
                  <div className={classes.resultSub}>
                    {p.birth_date ? formatAge(p.birth_date) : ''}{p.gender ? ` \u00B7 ${formatGender(p.gender)}` : ''}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {searching && <div className={classes.searching}>Searching...</div>}

      {/* Selected patient info */}
      {selectedPatient && (
        <div className={classes.patientInfo}>
          <div className={classes.patientCard}>
            <div
              className={classes.patientAvatar}
              style={{ background: getAvatarGradient(formatPatientName(selectedPatient)) }}
            >
              {getInitials(selectedPatient.given_name, selectedPatient.family_name)}
            </div>
            <div>
              <div className={classes.patientName}>{formatPatientName(selectedPatient)}</div>
              <div className={classes.patientMeta}>
                {selectedPatient.birth_date ? formatAge(selectedPatient.birth_date) : ''}
                {selectedPatient.gender ? ` \u00B7 ${formatGender(selectedPatient.gender)}` : ''}
              </div>
              {selectedPatient.birth_date && (
                <div className={classes.patientMeta}>DOB: {formatDate(selectedPatient.birth_date)}</div>
              )}
            </div>
          </div>

          {/* Screening scores */}
          {scores.length > 0 && (
            <div className={classes.section}>
              <div className={classes.sectionTitle}>Recent Scores</div>
              {scores.map((s) => (
                <div key={s.instrument} className={classes.scoreRow}>
                  <span className={classes.scoreLabel}>{s.instrument}</span>
                  <span className={`${classes.scoreValue} ${s.score >= 15 ? classes.scoreHigh : s.score >= 10 ? classes.scoreMod : ''}`}>
                    {s.score}
                  </span>
                  <span className={classes.scoreDate}>{s.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!selectedPatient && !searchQuery && (
        <div className={classes.empty}>
          <IconSparkles size={32} color="var(--oly-stone-mid)" />
          <div className={classes.emptyText}>Search for a patient to start an AI consultation</div>
        </div>
      )}
    </div>
  );
}
