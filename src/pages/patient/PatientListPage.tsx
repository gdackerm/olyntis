import {
  ActionIcon,
  Group,
  Loader,
  Paper,
  Text,
  TextInput,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconChevronLeft, IconChevronRight, IconPlus, IconSearch } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { formatHumanName, formatGender, getInitials } from '../../lib/utils';
import { patientService } from '../../services/patient.service';
import type { Tables } from '../../lib/supabase/types';
import dayjs from 'dayjs';
import classes from './PatientListPage.module.css';

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

function formatAge(birthDate: string | null): string {
  if (!birthDate) return '';
  return `${dayjs().diff(dayjs(birthDate), 'year')}y`;
}

export function PatientListPage(): JSX.Element {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchQuery, 300);
  const [count, setCount] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      if (debouncedSearch) {
        const results = await patientService.search(debouncedSearch);
        setPatients(results);
        setCount(results.length);
      } else {
        const result = await patientService.list({
          orderBy: { column: 'family_name', ascending: true },
          page,
          pageSize,
        });
        setPatients(result.data);
        setCount(result.count);
      }
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const totalPages = count !== null ? Math.ceil(count / pageSize) : 0;

  return (
    <div>
      <Group justify="space-between" mb={20}>
        <div>
          <Text ff="'Lora', serif" fz={22} fw={600} c="var(--oly-charcoal)">
            Patients
          </Text>
          {count !== null && (
            <Text size="sm" c="var(--oly-stone-dark)" mt={2}>
              {count} patients
            </Text>
          )}
        </div>
        <Group gap="sm">
          <TextInput
            placeholder="Search patients..."
            leftSection={<IconSearch size={16} color="var(--oly-stone-dark)" />}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.currentTarget.value);
              setPage(0);
            }}
            styles={{
              input: {
                background: 'var(--oly-warm-white)',
                borderColor: 'var(--oly-stone)',
                '&:focus': { borderColor: 'var(--oly-sage)' },
              },
            }}
          />
          <ActionIcon
            variant="filled"
            size="lg"
            radius="md"
            onClick={() => navigate('/onboarding')?.catch(console.error)}
            style={{ background: 'var(--oly-forest)' }}
          >
            <IconPlus size={18} />
          </ActionIcon>
        </Group>
      </Group>

      <Paper
        withBorder
        radius="md"
        style={{ background: 'var(--oly-warm-white)', overflow: 'hidden' }}
      >
        {/* Table header */}
        <div className={classes.header}>
          <div className={classes.colName}>Patient</div>
          <div className={classes.colGender}>Gender</div>
          <div className={classes.colDob}>Date of Birth</div>
          <div className={classes.colContact}>Contact</div>
          <div className={classes.colStatus}>Status</div>
        </div>

        {/* Rows */}
        {loading ? (
          <div className={classes.empty}><Loader size="sm" /></div>
        ) : patients.length === 0 ? (
          <div className={classes.empty}>No patients found</div>
        ) : (
          <div className={classes.list}>
            {patients.map((patient) => {
              const name = formatHumanName(patient.given_name, patient.family_name);
              const initials = getInitials(patient.given_name, patient.family_name);
              return (
                <div
                  key={patient.id}
                  className={classes.row}
                  onClick={() => navigate(`/Patient/${patient.id}`)}
                >
                  <div className={classes.colName}>
                    <div
                      className={classes.avatar}
                      style={{ background: getAvatarGradient(name) }}
                    >
                      {initials}
                    </div>
                    <div>
                      <div className={classes.patientName}>{name}</div>
                      <div className={classes.patientSub}>
                        {patient.birth_date ? formatAge(patient.birth_date) : ''}
                        {patient.birth_date && patient.phone ? ' \u00B7 ' : ''}
                        {patient.phone ?? ''}
                      </div>
                    </div>
                  </div>
                  <div className={classes.colGender}>
                    <span className={classes.cellText}>{formatGender(patient.gender)}</span>
                  </div>
                  <div className={classes.colDob}>
                    <span className={classes.cellText}>
                      {patient.birth_date ? dayjs(patient.birth_date).format('MMM D, YYYY') : ''}
                    </span>
                  </div>
                  <div className={classes.colContact}>
                    <span className={classes.cellText}>{patient.email || '\u2014'}</span>
                  </div>
                  <div className={classes.colStatus}>
                    <span className={`${classes.statusBadge} ${patient.active ? classes.active : classes.inactive}`}>
                      {patient.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {count !== null && count > pageSize && (
          <div className={classes.pagination}>
            <Text size="sm" c="var(--oly-stone-dark)">
              {page * pageSize + 1}\u2013{Math.min((page + 1) * pageSize, count)} of {count}
            </Text>
            <Group gap={4}>
              <ActionIcon
                variant="subtle"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                style={{ color: 'var(--oly-stone-dark)' }}
              >
                <IconChevronLeft size={16} />
              </ActionIcon>
              <Text size="sm" c="var(--oly-stone-dark)" fw={500}>
                {page + 1} / {totalPages}
              </Text>
              <ActionIcon
                variant="subtle"
                size="sm"
                disabled={(page + 1) * pageSize >= count}
                onClick={() => setPage((p) => p + 1)}
                style={{ color: 'var(--oly-stone-dark)' }}
              >
                <IconChevronRight size={16} />
              </ActionIcon>
            </Group>
          </div>
        )}
      </Paper>
    </div>
  );
}
