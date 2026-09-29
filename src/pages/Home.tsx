import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import PatientSidebar from "../components/PatientSidebar";
import DiagnosisHistory from "../components/DiagnosisHistory";
import PatientProfile from "../components/PatientProfile";
import { fetchPatients } from "../lib/api";
import type { Patient } from "../lib/patient";

export default function Home() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'dashboard' | 'profile' | 'sidebar'>('dashboard');

  useEffect(() => {
    async function loadData() {
      try {
        // The API response is mapped onto the Patient model in src/lib/api.ts.
        const data = await fetchPatients();
        setPatients(data);

        // Default to the first patient of the API response.
        setSelectedPatient(data.length > 0 ? data[0] : null);
      } catch (err) {
        setError("Failed to load patient data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (error || !selectedPatient) {
    return <div className="flex h-screen items-center justify-center text-red-500">{error || "No data found"}</div>;
  }

  return (
    <div className="min-h-screen bg-[#F6F8FC] text-[#072635]">
      <Navbar />

      {/* Mobile Tab Switcher */}
      <div className="mt-4 mx-4 flex border-b border-[#E2E8F2] bg-white lg:hidden">
        <button 
          onClick={() => setMobileView('sidebar')} 
          className={`flex-1 py-3 text-sm font-medium ${mobileView === 'sidebar' ? 'text-[#3355FF] border-b-2 border-[#3355FF]' : 'text-[#5B6570]'}`}
        >
          Patients
        </button>
        <button 
          onClick={() => setMobileView('dashboard')} 
          className={`flex-1 py-3 text-sm font-medium ${mobileView === 'dashboard' ? 'text-[#3355FF] border-b-2 border-[#3355FF]' : 'text-[#5B6570]'}`}
        >
          Dashboard
        </button>
        <button 
          onClick={() => setMobileView('profile')} 
          className={`flex-1 py-3 text-sm font-medium ${mobileView === 'profile' ? 'text-[#3355FF] border-b-2 border-[#3355FF]' : 'text-[#5B6570]'}`}
        >
          Profile
        </button>
      </div>

      <main className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 p-6 lg:grid-cols-[300px_1fr_360px]">
        <div className={`${mobileView === 'sidebar' ? 'block' : 'hidden'} lg:block`}>
          <PatientSidebar 
            patients={patients} 
            selectedPatient={selectedPatient} 
            onSelectPatient={(p) => {
               setSelectedPatient(p);
               setMobileView('dashboard');
            }} 
          />
        </div>
        
        <div className={`${mobileView === 'dashboard' ? 'block' : 'hidden'} lg:block flex flex-col gap-6`}>
          <DiagnosisHistory patient={selectedPatient} />
        </div>

        <div className={`${mobileView === 'profile' ? 'block' : 'hidden'} lg:block flex flex-col gap-6`}>
          <PatientProfile patient={selectedPatient} />
        </div>
      </main>
    </div>
  );
}
