/* Temporary SSR smoke test: renders the real components against the live API. */
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import Navbar from "./src/components/Navbar";
import PatientSidebar from "./src/components/PatientSidebar";
import PatientProfile from "./src/components/PatientProfile";
import DiagnosisHistory from "./src/components/DiagnosisHistory";
import { normalizePatients, sortPatientsByName, getLatestDiagnosisRecord, type Patient } from "./src/lib/patient";

const raw = await fetch("https://fedskillstest.coalitiontechnologies.workers.dev", {
  headers: { Authorization: `Basic ${Buffer.from("coalition:skills-test").toString("base64")}` },
}).then((r) => r.json());

const patients = normalizePatients(raw);
const patient = patients.find((p) => p.name === "Jessica Taylor")!;
const report = [];
let failures = 0;
const check = (ok, label, extra = "") => {
  report.push(`${ok ? "PASS" : "FAIL"}  ${label}${extra ? " -> " + extra : ""}`);
  if (!ok) failures += 1;
};

const render = (node) => renderToStaticMarkup(node);

const sidebar = render(PatientSidebar({ patients, selectedPatient: patient, onSelectPatient: () => {} }));
const profile = render(PatientProfile({ patient }));
const history = render(DiagnosisHistory({ patient }));
const navbar = render(MemoryRouter({ children: Navbar() }));

// sidebar: all 20 API names present, in A -> Z order
const positions = sortPatientsByName(patients).map((p) => sidebar.indexOf(p.name!));
check(patients.every((p) => sidebar.includes(p.name!)), "sidebar lists every patient name from the API");
check(positions.every((pos, i) => pos >= 0 && (i === 0 || pos > positions[i - 1])), "sidebar renders names A -> Z", sortPatientsByName(patients).map((p) => p.name).slice(0, 3).join(" | "));
check(sidebar.includes(`${patient.gender}, ${patient.age}`), "sidebar shows gender + age from the API", `${patient.gender}, ${patient.age}`);

// profile: every field straight from the API
const profileChecks = [patient.name!, patient.date_of_birth!, patient.gender!, patient.phone_number!, patient.insurance_type!, ...patient.lab_results];
check(profileChecks.every((v) => profile.includes(v)), "profile renders API name, DOB, gender, phone, insurance and lab results");
check(profile.includes(`alt="${patient.name}"`) && profile.includes(patient.profile_picture!), "profile photo + alt come from the API");

// diagnosis history: newest record + all list rows
const latest = getLatestDiagnosisRecord(patient.diagnosis_history)!;
const bpValues = [String(latest.blood_pressure!.systolic!.value), String(latest.blood_pressure!.diastolic!.value), String(latest.heart_rate!.value), String(latest.temperature!.value), String(latest.respiratory_rate!.value)];
check(bpValues.every((v) => history.includes(v)), "vitals + BP summary render the newest API record", `HR ${latest.heart_rate!.value}, temp ${latest.temperature!.value}, RR ${latest.respiratory_rate!.value}, BP ${latest.blood_pressure!.systolic!.value}/${latest.blood_pressure!.diastolic!.value}`);
check([latest.heart_rate!.levels!, latest.temperature!.levels!, latest.respiratory_rate!.levels!].every((l) => history.includes(l)), "vital levels come from the API");
check(patient.diagnostic_list.every((d) => history.includes(d.name!) && history.includes(d.description!) && history.includes(d.status!)), "diagnostic list rows come from the API");
check(history.includes(latest.heart_rate!.value + " bpm") && history.includes(latest.temperature!.value + "\u00b0F"), "units render as before", `${latest.temperature!.value}\u00b0F`);

// navbar chrome
check(navbar.includes("Dr. Jose Simmons") && navbar.includes("General Practitioner"), "navbar shows the hardcoded practitioner as requested");

// missing data -> N/A, no invented values
const empty: Patient = { name: null, gender: null, age: null, profile_picture: null, date_of_birth: null, phone_number: null, emergency_contact: null, insurance_type: null, diagnosis_history: [], diagnostic_list: [], lab_results: [] };
const emptyProfile = render(PatientProfile({ patient: empty }));
const emptyHistory = render(DiagnosisHistory({ patient: empty }));
const emptySidebar = render(PatientSidebar({ patients: [empty], selectedPatient: empty, onSelectPatient: () => {} }));
check((emptyProfile.match(/N/A/g) || []).length >= 5, "profile shows N/A for every missing field", `${(emptyProfile.match(/N/A/g) || []).length} x N/A`);
check(emptyProfile.includes("No lab results available") && emptyProfile.includes("No blood pressure") === false, "empty lab results keep the existing empty state");
check((emptyHistory.match(/N/A/g) || []).length >= 7 && emptyHistory.includes("No diagnosis records available") && emptyHistory.includes("No blood pressure data available"), "dashboard shows N/A + existing empty states", `${(emptyHistory.match(/N/A/g) || []).length} x N/A`);
check(emptySidebar.includes("N/A, N/A"), "sidebar shows N/A, N/A when gender/age are missing");

console.log(report.join("\n"));
console.error(failures === 0 ? "ALL RENDER CHECKS PASSED" : `${failures} RENDER CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);