/*
 * Patient data model for the Tech.Care API.
 *
 * Every value the UI renders is read from the API response and normalised
 * here. Nothing is hardcoded, mocked, duplicated or inferred: the helpers
 * below only read what the API sent and surface `N/A` when a value is absent.
 */

/** Placeholder shown whenever the API does not provide a value. */
export const NOT_AVAILABLE = "N/A";

/** A single reading (blood pressure, heart rate, temperature, ...). */
export interface VitalReading {
  value: number | null;
  levels: string | null;
}

/** The blood pressure block of a diagnosis history record. */
export interface BloodPressure {
  systolic: VitalReading | null;
  diastolic: VitalReading | null;
}

/** One entry of `patient.diagnosis_history`. */
export interface DiagnosisRecord {
  month: string | null;
  year: number | null;
  blood_pressure: BloodPressure | null;
  heart_rate: VitalReading | null;
  respiratory_rate: VitalReading | null;
  temperature: VitalReading | null;
}

/** One entry of `patient.diagnostic_list`. */
export interface DiagnosticEntry {
  name: string | null;
  description: string | null;
  status: string | null;
}

/** A patient exactly as the API describes them. */
export interface Patient {
  name: string | null;
  gender: string | null;
  age: number | null;
  profile_picture: string | null;
  date_of_birth: string | null;
  phone_number: string | null;
  emergency_contact: string | null;
  insurance_type: string | null;
  diagnosis_history: DiagnosisRecord[];
  diagnostic_list: DiagnosticEntry[];
  lab_results: string[];
}

/** One point of the blood pressure chart, built from an API record. */
export interface BloodPressurePoint {
  /** Chart label, formatted from the API's month/year, e.g. `Oct, 2023`. */
  label: string;
  /** API systolic value. */
  systolic: number;
  /** API diastolic value. */
  diastolic: number;
}

/** Renders an API value, or `N/A` when the API did not send one. */
export function na(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return NOT_AVAILABLE;
  }

  const text = typeof value === "string" ? value.trim() : String(value);

  if (text === "" || text === "NaN" || text === "null" || text === "undefined") {
    return NOT_AVAILABLE;
  }

  return text;
}

/**
 * Formats a reading from the API, e.g. `79 bpm`, or `N/A` when the API did not
 * send a value. The suffix is appended verbatim, so callers control spacing
 * (for example " bpm" or "°F").
 */
export function formatReading(
  reading: VitalReading | null | undefined,
  suffix = ""
): string {
  if (!reading || reading.value === null || reading.value === undefined) {
    return NOT_AVAILABLE;
  }

  return `${na(reading.value)}${suffix}`;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asVitalReading(value: unknown): VitalReading | null {
  const raw = asRecord(value);
  const reading: VitalReading = {
    value: asNumber(raw.value),
    levels: asString(raw.levels),
  };

  return reading.value === null && reading.levels === null ? null : reading;
}

function asBloodPressure(value: unknown): BloodPressure | null {
  const raw = asRecord(value);
  const systolic = asVitalReading(raw.systolic);
  const diastolic = asVitalReading(raw.diastolic);

  return systolic === null && diastolic === null
    ? null
    : { systolic, diastolic };
}

function asDiagnosisRecord(value: unknown): DiagnosisRecord {
  const raw = asRecord(value);

  return {
    month: asString(raw.month),
    year: asNumber(raw.year),
    blood_pressure: asBloodPressure(raw.blood_pressure),
    heart_rate: asVitalReading(raw.heart_rate),
    respiratory_rate: asVitalReading(raw.respiratory_rate),
    temperature: asVitalReading(raw.temperature),
  };
}

function asDiagnosticEntry(value: unknown): DiagnosticEntry {
  const raw = asRecord(value);

  return {
    name: asString(raw.name),
    description: asString(raw.description),
    status: asString(raw.status),
  };
}

/** Maps one raw API patient onto the typed `Patient` model. */
export function normalizePatient(value: unknown): Patient {
  const raw = asRecord(value);

  return {
    name: asString(raw.name),
    gender: asString(raw.gender),
    age: asNumber(raw.age),
    profile_picture: asString(raw.profile_picture),
    date_of_birth: asString(raw.date_of_birth),
    phone_number: asString(raw.phone_number),
    emergency_contact: asString(raw.emergency_contact),
    insurance_type: asString(raw.insurance_type),
    diagnosis_history: asArray(raw.diagnosis_history).map(asDiagnosisRecord),
    diagnostic_list: asArray(raw.diagnostic_list).map(asDiagnosticEntry),
    lab_results: asArray(raw.lab_results).map((lab) => na(asString(lab))),
  };
}

/** Maps the raw API payload (an array of patients) onto the model. */
export function normalizePatients(value: unknown): Patient[] {
  return asArray(value).map(normalizePatient);
}

function monthIndex(month: string | null): number {
  if (!month) {
    return -1;
  }

  const needle = month.trim().toLowerCase();

  return MONTHS.findIndex((name) => name.toLowerCase() === needle);
}

/*
 * Ordering key built from the API's own month/year values. It is used for
 * presentation only (chart order, "latest" record) and never becomes content.
 */
function chronologyKey(record: DiagnosisRecord): number {
  return (record.year ?? Number.NEGATIVE_INFINITY) * 12 + monthIndex(record.month);
}

/** The API's diagnosis history ordered oldest -> newest. */
export function sortDiagnosisHistory(
  records: DiagnosisRecord[]
): DiagnosisRecord[] {
  return [...records].sort((a, b) => chronologyKey(a) - chronologyKey(b));
}

/** The most recent record of the API's diagnosis history, or `null`. */
export function getLatestDiagnosisRecord(
  records: DiagnosisRecord[]
): DiagnosisRecord | null {
  if (records.length === 0) {
    return null;
  }

  const ordered = sortDiagnosisHistory(records);

  return ordered[ordered.length - 1];
}

/**
 * The API's patient list ordered A -> Z by name for the sidebar. Patients the
 * API does not name are listed last. The input array is never modified.
 */
export function sortPatientsByName(patients: Patient[]): Patient[] {
  return [...patients].sort((a, b) => {
    if (a.name === null && b.name === null) {
      return 0;
    }

    if (a.name === null) {
      return 1;
    }

    if (b.name === null) {
      return -1;
    }

    return a.name.localeCompare(b.name);
  });
}

/*
 * One chart point per API record that carries both a systolic and a diastolic
 * value. Values and labels are copied straight from the API record.
 */
export function buildBloodPressureSeries(
  records: DiagnosisRecord[]
): BloodPressurePoint[] {
  const points: BloodPressurePoint[] = [];

  for (const record of sortDiagnosisHistory(records)) {
    const systolic = record.blood_pressure?.systolic?.value;
    const diastolic = record.blood_pressure?.diastolic?.value;

    if (
      systolic === null ||
      systolic === undefined ||
      diastolic === null ||
      diastolic === undefined
    ) {
      continue;
    }

    points.push({
      label: `${na(record.month).slice(0, 3)}, ${na(record.year)}`,
      systolic,
      diastolic,
    });
  }

  return points;
}


