import { Calendar, Users, Phone, ShieldCheck, Download } from "lucide-react";
import { na, NOT_AVAILABLE, type Patient } from "../lib/patient";

interface PatientProfileProps {
  patient: Patient;
}

export default function PatientProfile({ patient }: PatientProfileProps) {
  const labResults = patient.lab_results ?? [];

  return (
    <div className="rounded-[16px] bg-[#FFFFFF] p-6 shadow-sm">
      <div className="flex flex-col items-center text-center">
        {patient.profile_picture ? (
          <img src={patient.profile_picture} alt={na(patient.name)} className="mb-4 h-32 w-32 rounded-full object-cover" />
        ) : (
          <div className="mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-[#F6F7F8] text-sm font-bold text-[#707070]">
            {NOT_AVAILABLE}
          </div>
        )}
        <h2 className="text-xl font-bold text-[#072635]">{na(patient.name)}</h2>
      </div>
      
      <div className="mt-8 space-y-4 text-sm">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-[#707070]" />
          <div>
            <p className="text-[#707070]">Date Of Birth</p>
            <p className="font-bold">{na(patient.date_of_birth)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-[#707070]" />
          <div>
            <p className="text-[#707070]">Gender</p>
            <p className="font-bold">{na(patient.gender)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-[#707070]" />
          <div>
            <p className="text-[#707070]">Contact Info.</p>
            <p className="font-bold">{na(patient.phone_number)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-[#707070]" />
          <div>
            <p className="text-[#707070]">Insurance Provider</p>
            <p className="font-bold">{na(patient.insurance_type)}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 border-t border-[#F6F7F8] pt-8">
        <h3 className="mb-6 text-lg font-bold text-[#072635]">Lab Results</h3>
        <div className="space-y-4">
          {labResults.length > 0 ? (
            labResults.map((lab: string, index: number) => (
              <div key={index} className="flex items-center justify-between rounded-lg p-2 hover:bg-[#F6F7F8]">
                <p className="text-sm text-[#072635]">{na(lab)}</p>
                <Download className="h-5 w-5 text-[#707070] cursor-pointer" />
              </div>
            ))
          ) : (
            <p className="text-sm text-[#707070] italic text-center py-4">No lab results available</p>
          )}
        </div>
      </div>
      
      <button className="mt-8 w-full rounded-full bg-[#01F0D0] py-2 font-bold text-[#072635]">
        Show All Information
      </button>
    </div>
  );
}
