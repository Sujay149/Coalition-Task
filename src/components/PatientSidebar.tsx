import { useState } from "react";
import { Search } from "lucide-react";
import { na, NOT_AVAILABLE, sortPatientsByName, type Patient } from "../lib/patient";

interface PatientSidebarProps {
  patients: Patient[];
  selectedPatient: Patient;
  onSelectPatient: (patient: Patient) => void;
}

export default function PatientSidebar({ patients, selectedPatient, onSelectPatient }: PatientSidebarProps) {
  const [search, setSearch] = useState("");
  const term = search.trim().toLowerCase();

  // Sorted A -> Z by the API name (the shared sort keeps `patients` untouched).
  const filteredPatients = sortPatientsByName(
    patients.filter((p) => na(p.name).toLowerCase().includes(term))
  );

  return (
    <aside className="flex flex-col rounded-[16px] bg-[#FFFFFF] p-6 shadow-sm lg:sticky lg:top-24 lg:h-[calc(100vh-120px)]">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#072635]">Patients</h2>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-32 rounded-full border border-gray-200 bg-transparent py-1 pl-3 pr-8 text-sm focus:border-[#01F0D0] focus:outline-none"
            placeholder="Search..."
          />
          <Search className="absolute right-2 top-1.5 h-4 w-4 text-[#072635]" />
        </div>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        {filteredPatients.map((p) => (
          <button
            key={p.profile_picture ?? p.name}
            onClick={() => onSelectPatient(p)}
            className={`flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors ${
              p.name === selectedPatient.name ? "bg-[#E1F3F3]" : "hover:bg-[#F6F7F8]"
            }`}
          >
            {p.profile_picture ? (
              <img src={p.profile_picture} alt={na(p.name)} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F6F7F8] text-xs text-[#707070]">
                {NOT_AVAILABLE}
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-[#072635]">{na(p.name)}</p>
              <p className="text-xs text-[#707070]">
                {na(p.gender)}, {na(p.age)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
