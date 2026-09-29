const NOT_AVAILABLE = "N/A";
function na(value) {
  if (value === null || value === void 0) {
    return NOT_AVAILABLE;
  }
  const text = typeof value === "string" ? value.trim() : String(value);
  if (text === "" || text === "NaN" || text === "null" || text === "undefined") {
    return NOT_AVAILABLE;
  }
  return text;
}
function formatReading(reading, suffix = "") {
  if (!reading || reading.value === null || reading.value === void 0) {
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
  "December"
];
function asRecord(value) {
  return value !== null && typeof value === "object" ? value : {};
}
function asString(value) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return null;
}
function asNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}
function asArray(value) {
  return Array.isArray(value) ? value : [];
}
function asVitalReading(value) {
  const raw = asRecord(value);
  const reading = {
    value: asNumber(raw.value),
    levels: asString(raw.levels)
  };
  return reading.value === null && reading.levels === null ? null : reading;
}
function asBloodPressure(value) {
  const raw = asRecord(value);
  const systolic = asVitalReading(raw.systolic);
  const diastolic = asVitalReading(raw.diastolic);
  return systolic === null && diastolic === null ? null : { systolic, diastolic };
}
function asDiagnosisRecord(value) {
  const raw = asRecord(value);
  return {
    month: asString(raw.month),
    year: asNumber(raw.year),
    blood_pressure: asBloodPressure(raw.blood_pressure),
    heart_rate: asVitalReading(raw.heart_rate),
    respiratory_rate: asVitalReading(raw.respiratory_rate),
    temperature: asVitalReading(raw.temperature)
  };
}
function asDiagnosticEntry(value) {
  const raw = asRecord(value);
  return {
    name: asString(raw.name),
    description: asString(raw.description),
    status: asString(raw.status)
  };
}
function normalizePatient(value) {
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
    lab_results: asArray(raw.lab_results).map((lab) => na(asString(lab)))
  };
}
function normalizePatients(value) {
  return asArray(value).map(normalizePatient);
}
function monthIndex(month) {
  if (!month) {
    return -1;
  }
  const needle = month.trim().toLowerCase();
  return MONTHS.findIndex((name) => name.toLowerCase() === needle);
}
function chronologyKey(record) {
  return (record.year ?? Number.NEGATIVE_INFINITY) * 12 + monthIndex(record.month);
}
function sortDiagnosisHistory(records) {
  return [...records].sort((a, b) => chronologyKey(a) - chronologyKey(b));
}
function getLatestDiagnosisRecord(records) {
  if (records.length === 0) {
    return null;
  }
  const ordered = sortDiagnosisHistory(records);
  return ordered[ordered.length - 1];
}
function sortPatientsByName(patients) {
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
function buildBloodPressureSeries(records) {
  const points = [];
  for (const record of sortDiagnosisHistory(records)) {
    const systolic = record.blood_pressure?.systolic?.value;
    const diastolic = record.blood_pressure?.diastolic?.value;
    if (systolic === null || systolic === void 0 || diastolic === null || diastolic === void 0) {
      continue;
    }
    points.push({
      label: `${na(record.month).slice(0, 3)}, ${na(record.year)}`,
      systolic,
      diastolic
    });
  }
  return points;
}
export {
  NOT_AVAILABLE,
  buildBloodPressureSeries,
  formatReading,
  getLatestDiagnosisRecord,
  na,
  normalizePatient,
  normalizePatients,
  sortDiagnosisHistory,
  sortPatientsByName
};
