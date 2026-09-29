/*
 * Temporary verification script: exercises the real data layer
 * (src/lib/patient.ts) against the live API and asserts that every rendered
 * value comes straight from the API response. Deleted after the check.
 */
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

execSync("npx esbuild src/lib/patient.ts --format=esm --outfile=.tmp-patient.mjs --log-level=error", { stdio: "inherit" });

const { normalizePatients, buildBloodPressureSeries, getLatestDiagnosisRecord, formatReading, na, NOT_AVAILABLE, sortPatientsByName } =
  await import("./.tmp-patient.mjs");

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const key = (r) => r.year * 12 + MONTHS.indexOf(r.month);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const raw = await fetch("https://fedskillstest.coalitiontechnologies.workers.dev", {
  headers: { Authorization: `Basic ${Buffer.from("coalition:skills-test").toString("base64")}` },
}).then((r) => r.json());

const patients = normalizePatients(raw);
const report = [];
let failures = 0;
const check = (ok, label, extra = "") => {
  report.push(`${ok ? "PASS" : "FAIL"}  ${label}${extra ? " -> " + extra : ""}`);
  if (!ok) failures += 1;
};

check(patients.length === raw.length, "patients mapped 1:1", `${patients.length}/${raw.length}`);
check(patients.every((p, i) => p.name === raw[i].name), "names preserved in API order", patients.slice(0, 3).map((p) => p.name).join(" | "));
check(
  patients.every((p, i) =>
    ["gender", "age", "profile_picture", "date_of_birth", "phone_number", "emergency_contact", "insurance_type"]
      .every((f) => p[f] === raw[i][f])
  ),
  "profile fields == API values"
);
check(patients.every((p, i) => p.diagnosis_history.length === raw[i].diagnosis_history.length), "diagnosis_history count == API");
check(
  patients.every((p, i) =>
    p.diagnostic_list.every((d, j) => same(d, { name: raw[i].diagnostic_list[j].name, description: raw[i].diagnostic_list[j].description, status: raw[i].diagnostic_list[j].status }))
  ),
  "diagnostic_list == API values"
);
check(patients.every((p, i) => same(p.lab_results, raw[i].lab_results)), "lab_results == API values");
check(
  patients.every((p, i) =>
    p.diagnosis_history.every((r, j) => {
      const a = raw[i].diagnosis_history[j];
      return (
        r.month === a.month &&
        r.year === a.year &&
        same(r.blood_pressure.systolic, a.blood_pressure.systolic) &&
        same(r.blood_pressure.diastolic, a.blood_pressure.diastolic) &&
        same(r.heart_rate, a.heart_rate) &&
        same(r.respiratory_rate, a.respiratory_rate) &&
        same(r.temperature, a.temperature)
      );
    })
  ),
  "every BP record + vital sign == API values"
);
check(
  patients.every((p, i) => {
    const a = raw[i].diagnosis_history.reduce((x, y) => (key(y) > key(x) ? y : x));
    const m = getLatestDiagnosisRecord(p.diagnosis_history);
    return m.month === a.month && m.year === a.year && m.heart_rate.value === a.heart_rate.value && m.temperature.value === a.temperature.value && m.respiratory_rate.value === a.respiratory_rate.value;
  }),
  "latest vitals = newest API record"
);
check(
  patients.every((p, i) => {
    const exp = raw[i].diagnosis_history
      .filter((r) => r.blood_pressure?.systolic?.value != null && r.blood_pressure?.diastolic?.value != null)
      .sort((a, b) => key(a) - key(b));
    const s = buildBloodPressureSeries(p.diagnosis_history);
    return (
      s.length === exp.length &&
      s.every((pt, j) => pt.systolic === exp[j].blood_pressure.systolic.value && pt.diastolic === exp[j].blood_pressure.diastolic.value && pt.label === `${exp[j].month.slice(0, 3)}, ${exp[j].year}`)
    );
  }),
  "chart series == API values (oldest -> newest)"
);

check(na(null) === NOT_AVAILABLE && na(undefined) === NOT_AVAILABLE && na("") === NOT_AVAILABLE, "missing value -> N/A");
check(formatReading(null, " bpm") === NOT_AVAILABLE && formatReading({ value: null, levels: null }, " degF") === NOT_AVAILABLE, "missing vital sign -> N/A");
check(buildBloodPressureSeries([{ month: "May", year: 2024, blood_pressure: null }]).length === 0, "no chart point invented when BP is missing");
check(getLatestDiagnosisRecord([]) === null, "no latest record invented when history is missing");

const empty = normalizePatients([{}])[0];
check(
  empty.name === null && empty.age === null && empty.profile_picture === null && empty.emergency_contact === null &&
    empty.diagnosis_history.length === 0 && empty.diagnostic_list.length === 0 && empty.lab_results.length === 0,
  "empty API record -> nulls / empty lists"
);
check(
  na(empty.name) === NOT_AVAILABLE && formatReading(getLatestDiagnosisRecord(empty.diagnosis_history), " bpm") === NOT_AVAILABLE,
  "components render N/A for an empty record"
);

check(JSON.stringify(sortPatientsByName(patients).map((p) => p.name)) === JSON.stringify(patients.map((p) => p.name).slice().sort((a, b) => a.localeCompare(b))), "sidebar list sorted A -> Z", sortPatientsByName(patients).map((p) => p.name).slice(0, 3).join(" | "));
check(sortPatientsByName(patients).length === patients.length && patients[0].name === raw[0].name, "sort does not mutate the API order");

const jessica = patients.find((p) => p.name === "Jessica Taylor");
const latest = getLatestDiagnosisRecord(jessica.diagnosis_history);
const series = buildBloodPressureSeries(jessica.diagnosis_history);
report.push(`SAMPLE ${jessica.name}: latest ${latest.month} ${latest.year} | HR ${formatReading(latest.heart_rate, " bpm")} | temp ${formatReading(latest.temperature, " degF")} | RR ${formatReading(latest.respiratory_rate, " bpm")} | newest BP ${series[series.length - 1].label} ${series[series.length - 1].systolic}/${series[series.length - 1].diastolic}`);
report.push(failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`);
console.log(report.join("\n"));
writeFileSync("verify-output.txt", report.join("\n"), "utf8");
process.exit(failures === 0 ? 0 : 1);
