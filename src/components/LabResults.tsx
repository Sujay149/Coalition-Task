import { Download } from "lucide-react";
import { na, type Patient } from "../lib/patient";

interface LabResultsProps {
  patient: Patient;
}

export default function LabResults({ patient }: LabResultsProps) {
  const labs = patient.lab_results ?? [];

  return (
    <div className="rounded-[16px] bg-[#FFFFFF] p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-bold text-[#072635]">Lab Results for {na(patient.name)}</h2>
      <div className="space-y-4">
        {labs.length > 0 ? (
          labs.map((lab: string, index: number) => (
            <div key={index} className="flex items-center justify-between rounded-lg p-2 hover:bg-[#F6F7F8]">
              <div>
                <p className="text-sm text-[#072635]">{na(lab)}</p>
              </div>
              <Download className="h-5 w-5 text-[#707070] cursor-pointer" />
            </div>
          ))
        ) : (
          <p className="text-sm text-[#707070] italic text-center py-4">No lab results available</p>
        )}
      </div>
    </div>
  );
}

