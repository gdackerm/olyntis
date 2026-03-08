/**
 * seed-schedule.ts
 *
 * Seeds 3 months of realistic behavioral health appointments into Supabase.
 * Also links Greg's primary auth account to the BH org so the dashboard
 * and /schedule page display populated data on login.
 *
 * Usage:
 *   npx tsx scripts/seed-schedule.ts          # Seed schedule
 *   npx tsx scripts/seed-schedule.ts --clean   # Remove seeded appointments only
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as dotenv from 'dotenv';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const PROJECT_ROOT = process.cwd();
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ORG_ID = 'cab4ffbd-b224-46e1-b7d8-58eb065a6133';

// Greg's email-provider auth user (greg.ackerman@mac.com)
const GREG_AUTH_USER_ID = 'c53e5e87-009d-4828-81cc-3a58c00cf831';
// Greg's practitioner row inside the BH org
const GREG_BH_PRACTITIONER_ID = 'dcf39f61-1cd8-42a1-9be9-b33c6d6bccb1';
// Greg's practitioner row inside the empty "My Practice" org (to be deactivated)
const GREG_EMPTY_PRACTITIONER_ID = 'fff0a1f5-91af-4234-b229-ac9bba5ef906';

// ---------------------------------------------------------------------------
// Practitioner IDs (from DB)
// ---------------------------------------------------------------------------

const PRACTITIONERS: Record<string, string> = {
  chen: '71287cbf-717c-4dc1-bf2a-526c76b15d86',
  rodriguez: '3e059928-7203-44ca-a2d5-f74c44dc1369',
  thompson: '7ee6f98d-18b5-4586-8fc9-913c396947be',
  kim: 'ee300f5b-26cf-4154-817d-63a1daa0ebb1',
  patel: '251afbfb-2ace-4e3a-8495-8e7ed418068e',
  greg: 'dcf39f61-1cd8-42a1-9be9-b33c6d6bccb1',
};

// ---------------------------------------------------------------------------
// Service Types per Practitioner
// ---------------------------------------------------------------------------

const SERVICE_TYPES: Record<string, { code: string; display: string; duration: number }[]> = {
  chen: [
    { code: 'PSYCH_EVAL', display: 'Psychiatric Evaluation', duration: 90 },
    { code: 'MED_MGMT', display: 'Medication Management', duration: 30 },
    { code: 'MAT_FOLLOWUP', display: 'MAT Follow-up', duration: 30 },
  ],
  rodriguez: [
    { code: 'IND_THERAPY', display: 'Individual Therapy', duration: 50 },
    { code: 'GRP_THERAPY', display: 'Group Therapy', duration: 90 },
    { code: 'FAM_SESSION', display: 'Family Session', duration: 60 },
  ],
  thompson: [
    { code: 'IND_THERAPY', display: 'Individual Therapy', duration: 50 },
    { code: 'PSYCH_ASSESS', display: 'Psychological Assessment', duration: 90 },
    { code: 'CBT', display: 'CBT Session', duration: 50 },
  ],
  kim: [
    { code: 'DETOX_FU', display: 'Detox Follow-up', duration: 30 },
    { code: 'PHYS_ASSESS', display: 'Physical Assessment', duration: 45 },
    { code: 'MED_MGMT', display: 'Medication Management', duration: 30 },
  ],
  patel: [
    { code: 'MAT_VISIT', display: 'MAT Visit', duration: 30 },
    { code: 'DRUG_SCREEN', display: 'Drug Screening', duration: 15 },
    { code: 'MED_MGMT', display: 'Medication Management', duration: 30 },
  ],
  greg: [
    { code: 'PSYCH_EVAL', display: 'Psychiatric Evaluation', duration: 90 },
    { code: 'MED_MGMT', display: 'Medication Management', duration: 30 },
    { code: 'CASE_REVIEW', display: 'Case Review', duration: 30 },
  ],
};

// ---------------------------------------------------------------------------
// Daily Schedule Templates
// Each entry: [minuteOffset from 8:00 AM, serviceTypeIndex]
// ---------------------------------------------------------------------------

const DAILY_TEMPLATES: Record<string, [number, number][]> = {
  // Psychiatrists: ~8 appts/day — 30-min med mgmt + 90-min evals
  chen: [
    [0, 0],     // 8:00  Psychiatric Eval (90m)
    [90, 1],    // 9:30  Med Management (30m)
    [120, 1],   // 10:00 Med Management (30m)
    [150, 2],   // 10:30 MAT Follow-up (30m)
    [180, 1],   // 11:00 Med Management (30m)
    [300, 1],   // 1:00  Med Management (30m)
    [330, 2],   // 1:30  MAT Follow-up (30m)
    [360, 0],   // 2:00  Psychiatric Eval (90m)
  ],
  // LCSW: ~7/day — mostly 50-min sessions, one 90-min group
  rodriguez: [
    [0, 0],     // 8:00  Individual Therapy (50m)
    [60, 0],    // 9:00  Individual Therapy (50m)
    [120, 0],   // 10:00 Individual Therapy (50m)
    [180, 1],   // 11:00 Group Therapy (90m)
    [330, 0],   // 1:30  Individual Therapy (50m)
    [390, 2],   // 2:30  Family Session (60m)
    [450, 0],   // 3:30  Individual Therapy (50m)
  ],
  // Clinical Psych: ~7/day — individual + CBT + assessment
  thompson: [
    [0, 2],     // 8:00  CBT Session (50m)
    [60, 0],    // 9:00  Individual Therapy (50m)
    [120, 1],   // 10:00 Psych Assessment (90m)
    [210, 2],   // 11:30 CBT Session (50m)
    [330, 0],   // 1:30  Individual Therapy (50m)
    [390, 2],   // 2:30  CBT Session (50m)
    [450, 0],   // 3:30  Individual Therapy (50m)
  ],
  // Family Practice: ~10/day — 30-min detox follow-ups + med mgmt
  kim: [
    [0, 0],     // 8:00  Detox Follow-up (30m)
    [30, 2],    // 8:30  Med Management (30m)
    [60, 0],    // 9:00  Detox Follow-up (30m)
    [90, 1],    // 9:30  Physical Assessment (45m)
    [135, 2],   // 10:15 Med Management (30m)
    [165, 0],   // 10:45 Detox Follow-up (30m)
    [195, 2],   // 11:15 Med Management (30m)
    [300, 0],   // 1:00  Detox Follow-up (30m)
    [330, 2],   // 1:30  Med Management (30m)
    [360, 1],   // 2:00  Physical Assessment (45m)
  ],
  // NP: ~12/day — 30-min MAT visits + 15-min drug screens
  patel: [
    [0, 0],     // 8:00  MAT Visit (30m)
    [30, 1],    // 8:30  Drug Screening (15m)
    [45, 0],    // 8:45  MAT Visit (30m)
    [75, 1],    // 9:15  Drug Screening (15m)
    [90, 2],    // 9:30  Med Management (30m)
    [120, 0],   // 10:00 MAT Visit (30m)
    [150, 1],   // 10:30 Drug Screening (15m)
    [165, 0],   // 10:45 MAT Visit (30m)
    [195, 2],   // 11:15 Med Management (30m)
    [300, 0],   // 1:00  MAT Visit (30m)
    [330, 1],   // 1:30  Drug Screening (15m)
    [345, 0],   // 1:45  MAT Visit (30m)
  ],
  // Medical Director: ~8 appts/day — evals + med mgmt + case review
  greg: [
    [0, 0],     // 8:00  Psychiatric Eval (90m)
    [90, 1],    // 9:30  Med Management (30m)
    [120, 1],   // 10:00 Med Management (30m)
    [150, 2],   // 10:30 Case Review (30m)
    [180, 1],   // 11:00 Med Management (30m)
    [300, 1],   // 1:00  Med Management (30m)
    [330, 2],   // 1:30  Case Review (30m)
    [360, 0],   // 2:00  Psychiatric Eval (90m)
  ],
};

// ---------------------------------------------------------------------------
// Condition → Provider Mapping
// ---------------------------------------------------------------------------

type ConditionCategory = 'opioid' | 'mdd' | 'alcohol' | 'drug_abuse' | 'panic_ptsd';

function categorizeCondition(display: string): ConditionCategory | null {
  const lower = display.toLowerCase();
  if (lower.includes('opioid')) return 'opioid';
  if (lower.includes('depressive') || lower.includes('depression')) return 'mdd';
  if (lower.includes('alcohol')) return 'alcohol';
  if (lower.includes('drug abuse') || lower.includes('substance')) return 'drug_abuse';
  if (lower.includes('panic') || lower.includes('ptsd') || lower.includes('posttraumatic')) return 'panic_ptsd';
  return null;
}

const CONDITION_PROVIDER_MAP: Record<ConditionCategory, string[]> = {
  opioid: ['patel', 'chen', 'greg', 'rodriguez'],
  mdd: ['rodriguez', 'thompson', 'chen', 'greg'],
  alcohol: ['kim', 'thompson', 'chen'],
  drug_abuse: ['patel', 'kim', 'rodriguez'],
  panic_ptsd: ['thompson', 'rodriguez', 'chen'],
};

// ---------------------------------------------------------------------------
// Supabase Admin Client
// ---------------------------------------------------------------------------

function createAdminClient(): SupabaseClient {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('Missing env vars. Ensure .env.local has:');
    console.error('  VITE_SUPABASE_URL=https://xxx.supabase.co');
    console.error('  SUPABASE_SERVICE_ROLE_KEY=eyJ...');
    process.exit(1);
  }
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isWeekday(d: Date): boolean {
  const day = d.getDay();
  return day !== 0 && day !== 6;
}

function getWorkingDays(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const d = new Date(start);
  while (d <= end) {
    if (isWeekday(d)) days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function addMinutes(d: Date, mins: number): Date {
  return new Date(d.getTime() + mins * 60000);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function batchInsert(sb: SupabaseClient, table: string, rows: any[], size = 200) {
  let inserted = 0;
  for (let i = 0; i < rows.length; i += size) {
    const batch = rows.slice(i, i + size);
    const { data, error } = await sb.from(table).insert(batch).select('id');
    if (error) throw error;
    inserted += data?.length ?? 0;
  }
  return inserted;
}

// ---------------------------------------------------------------------------
// Step 1: Link Greg's Auth Account
// ---------------------------------------------------------------------------

async function linkGregAuth(sb: SupabaseClient) {
  console.log('Step 1: Linking Greg\'s auth account to BH org...');

  // Point BH practitioner to Greg's primary (email) auth user
  const { error: linkErr } = await sb
    .from('practitioners')
    .update({ auth_user_id: GREG_AUTH_USER_ID })
    .eq('id', GREG_BH_PRACTITIONER_ID);
  if (linkErr) throw linkErr;
  console.log('  Updated BH practitioner auth_user_id');

  // Clear auth_user_id on the empty-org practitioner and deactivate it
  // to prevent .maybeSingle() collisions in AuthProvider
  const { error: deactErr } = await sb
    .from('practitioners')
    .update({ auth_user_id: null, active: false })
    .eq('id', GREG_EMPTY_PRACTITIONER_ID);
  if (deactErr) throw deactErr;
  console.log('  Deactivated empty-org practitioner');

  // Set organization_id in auth user's app_metadata so RLS works
  const { error: authErr } = await sb.auth.admin.updateUserById(GREG_AUTH_USER_ID, {
    app_metadata: { organization_id: ORG_ID },
  });
  if (authErr) throw authErr;
  console.log('  Updated auth user app_metadata with BH org ID');
}

// ---------------------------------------------------------------------------
// Step 2: Create Schedule Records
// ---------------------------------------------------------------------------

async function ensureSchedules(sb: SupabaseClient): Promise<Map<string, string>> {
  console.log('\nStep 2: Creating schedule records...');
  const scheduleMap = new Map<string, string>();

  for (const [key, pracId] of Object.entries(PRACTITIONERS)) {
    const serviceTypes = SERVICE_TYPES[key];

    // Check for existing schedule
    const { data: existing } = await sb
      .from('schedules')
      .select('id')
      .eq('practitioner_id', pracId)
      .eq('organization_id', ORG_ID)
      .limit(1);

    if (existing?.length) {
      // Update service_types on existing schedule
      await sb
        .from('schedules')
        .update({ service_types: serviceTypes, active: true })
        .eq('id', existing[0].id);
      scheduleMap.set(key, existing[0].id);
      continue;
    }

    const { data, error } = await sb
      .from('schedules')
      .insert({
        organization_id: ORG_ID,
        practitioner_id: pracId,
        active: true,
        service_types: serviceTypes,
      })
      .select('id')
      .single();
    if (error) throw error;
    scheduleMap.set(key, data.id);
  }

  console.log(`  ${scheduleMap.size} schedules ready`);
  return scheduleMap;
}

// ---------------------------------------------------------------------------
// Step 3: Generate Appointments
// ---------------------------------------------------------------------------

async function fetchPatientPools(sb: SupabaseClient): Promise<Map<string, string[]>> {
  const { data: conditions, error } = await sb
    .from('conditions')
    .select('patient_id, code_display')
    .eq('organization_id', ORG_ID)
    .eq('clinical_status', 'active');
  if (error) throw error;

  // Build provider → unique patient set based on condition mapping
  const providerPatients = new Map<string, Set<string>>();
  for (const key of Object.keys(PRACTITIONERS)) {
    providerPatients.set(key, new Set());
  }

  for (const cond of conditions ?? []) {
    const category = categorizeCondition(cond.code_display);
    if (!category) continue;
    for (const provKey of CONDITION_PROVIDER_MAP[category]) {
      providerPatients.get(provKey)?.add(cond.patient_id);
    }
  }

  // Convert to shuffled arrays
  const result = new Map<string, string[]>();
  for (const [key, patientSet] of providerPatients) {
    result.set(key, shuffle(Array.from(patientSet)));
  }
  return result;
}

function determineStatus(apptDate: Date, minuteOffset: number, now: Date): string {
  const apptDay = new Date(apptDate.getFullYear(), apptDate.getMonth(), apptDate.getDate());
  const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (apptDay < todayDay) {
    const r = Math.random();
    if (r < 0.85) return 'fulfilled';
    if (r < 0.95) return 'cancelled';
    return 'noshow';
  }

  if (apptDay.getTime() === todayDay.getTime()) {
    const nowMinutesSince8 = (now.getHours() - 8) * 60 + now.getMinutes();
    if (minuteOffset < nowMinutesSince8 - 60) return 'fulfilled';
    if (minuteOffset < nowMinutesSince8) return 'arrived';
    return 'booked';
  }

  // Future
  return Math.random() < 0.95 ? 'booked' : 'cancelled';
}

async function generateAppointments(sb: SupabaseClient) {
  console.log('\nStep 3: Generating appointments...');

  const now = new Date();

  // ~1 month back, snap to Monday
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 30);
  while (startDate.getDay() !== 1) startDate.setDate(startDate.getDate() + 1);

  // ~2 months forward, snap to Friday
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 60);
  while (endDate.getDay() !== 5) endDate.setDate(endDate.getDate() - 1);

  const workingDays = getWorkingDays(startDate, endDate);
  console.log(`  Date range: ${startDate.toISOString().slice(0, 10)} to ${endDate.toISOString().slice(0, 10)}`);
  console.log(`  Working days: ${workingDays.length}`);

  // Build patient pools per provider
  const providerPatients = await fetchPatientPools(sb);
  for (const [key, patients] of providerPatients) {
    console.log(`  ${key}: ${patients.length} patients in pool`);
  }

  const allAppointments: any[] = [];

  for (const [provKey, pracId] of Object.entries(PRACTITIONERS)) {
    const template = DAILY_TEMPLATES[provKey];
    const serviceTypes = SERVICE_TYPES[provKey];
    const patients = providerPatients.get(provKey) ?? [];

    if (!patients.length) {
      console.warn(`  WARNING: No patients for ${provKey}, skipping`);
      continue;
    }

    let patientIdx = 0;

    for (const day of workingDays) {
      for (const [minuteOffset, svcIdx] of template) {
        const svc = serviceTypes[svcIdx];

        const startTime = new Date(day);
        startTime.setHours(8, 0, 0, 0);
        startTime.setMinutes(startTime.getMinutes() + minuteOffset);

        const endTime = addMinutes(startTime, svc.duration);
        const status = determineStatus(day, minuteOffset, now);

        // Cycle through patient pool
        const patientId = patients[patientIdx % patients.length];
        patientIdx++;

        allAppointments.push({
          organization_id: ORG_ID,
          patient_id: patientId,
          practitioner_id: pracId,
          status,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          reason: { display: `${svc.display} · ${svc.duration} min`, code: svc.code },
        });
      }
    }
  }

  console.log(`\n  Total appointments to insert: ${allAppointments.length}`);

  const inserted = await batchInsert(sb, 'appointments', allAppointments);
  console.log(`  Inserted: ${inserted}`);

  // Status breakdown
  const statusCounts: Record<string, number> = {};
  for (const a of allAppointments) {
    statusCounts[a.status] = (statusCounts[a.status] ?? 0) + 1;
  }
  console.log('  Status breakdown:');
  for (const [s, c] of Object.entries(statusCounts).sort()) {
    console.log(`    ${s}: ${c}`);
  }

  // Per-provider breakdown
  const provCounts: Record<string, number> = {};
  for (const a of allAppointments) {
    for (const [key, id] of Object.entries(PRACTITIONERS)) {
      if (a.practitioner_id === id) { provCounts[key] = (provCounts[key] ?? 0) + 1; break; }
    }
  }
  console.log('  Per-provider counts:');
  for (const [p, c] of Object.entries(provCounts).sort()) {
    console.log(`    ${p}: ${c}`);
  }
}

// ---------------------------------------------------------------------------
// Clean
// ---------------------------------------------------------------------------

async function clean(sb: SupabaseClient) {
  console.log('Cleaning seeded schedule data...\n');

  const { error: apptErr, count: apptCount } = await sb
    .from('appointments')
    .delete({ count: 'exact' })
    .eq('organization_id', ORG_ID);
  if (apptErr) console.warn(`  appointments: ${apptErr.message}`);
  else console.log(`  appointments: ${apptCount ?? 0} deleted`);

  const { error: schedErr, count: schedCount } = await sb
    .from('schedules')
    .delete({ count: 'exact' })
    .eq('organization_id', ORG_ID);
  if (schedErr) console.warn(`  schedules: ${schedErr.message}`);
  else console.log(`  schedules: ${schedCount ?? 0} deleted`);

  console.log('\nClean complete.');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const isClean = process.argv.includes('--clean');
  const sb = createAdminClient();

  if (isClean) { await clean(sb); return; }

  console.log('=== Olyntis Behavioral Health Schedule Seeder ===\n');

  await linkGregAuth(sb);
  await ensureSchedules(sb);
  await generateAppointments(sb);

  console.log('\n=== Done ===');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
