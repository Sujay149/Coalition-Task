import { useState } from "react";
import { ChevronDown, Heart, Thermometer, Wind } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  buildBloodPressureSeries,
  formatReading,
  getLatestDiagnosisRecord,
  na,
  type Patient,
} from "../lib/patient";

interface DiagnosisHistoryProps {
  patient: Patient;
}

export default function DiagnosisHistory({
  patient,
}: DiagnosisHistoryProps) {
  const [filter, setFilter] = useState("6_months");

  const diagnosticList = patient?.diagnostic_list ?? [];

  /*
   * Chart points are built from the API's diagnosis_history (oldest -> newest)
   * in src/lib/patient.ts. No value is calculated or copied locally.
   */
  const allData = buildBloodPressureSeries(patient?.diagnosis_history ?? []);

  /*
   * Apply the selected time filter AFTER sorting chronologically.
   */
  const filteredData =
    filter === "6_months"
      ? allData.slice(-6)
      : filter === "1_year"
      ? allData.slice(-12)
      : allData;

  /*
   * Latest record of the selected range (blood pressure summary panel).
   */
  const latestBP =
    filteredData.length > 0
      ? filteredData[filteredData.length - 1]
      : null;

  /*
   * Latest vital signs taken from the most recent diagnosis_history record the
   * API returned. These are independent of the chart filter.
   */
  const latestDiagnosis = getLatestDiagnosisRecord(
    patient?.diagnosis_history ?? []
  );

  const respiratoryRate = latestDiagnosis?.respiratory_rate ?? null;

  const temperature = latestDiagnosis?.temperature ?? null;

  const heartRate = latestDiagnosis?.heart_rate ?? null;

  return (
    <div className="space-y-6">
      {/* Diagnosis History */}
      <div className="rounded-[16px] bg-[#FFFFFF] p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-bold text-[#072635]">
          Diagnosis History
        </h2>

        {/* Blood Pressure */}
        <div className="mb-8 rounded-[12px] bg-[#F4F0FE] p-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_200px]">
            {/* Chart */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-[#072635]">
                  Blood Pressure
                </h3>

                <div className="relative flex items-center gap-1 text-sm">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="cursor-pointer appearance-none bg-transparent pr-5 font-medium outline-none"
                  >
                    <option value="6_months">
                      Last 6 months
                    </option>

                    <option value="1_year">
                      Last 1 year
                    </option>

                    <option value="all">
                      All time
                    </option>
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-0 h-4 w-4" />
                </div>
              </div>

              {filteredData.length > 0 ? (
                <div className="h-48 w-full">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <LineChart
                      data={filteredData}
                      margin={{
                        top: 5,
                        right: 5,
                        left: 0,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#E1E1E1"
                      />

                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 12,
                          fill: "#072635",
                        }}
                      />

                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 12,
                          fill: "#072635",
                        }}
                        domain={["auto", "auto"]}
                      />

                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow:
                            "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        labelFormatter={(
                          label
                        ) => `Date: ${label}`}
                        formatter={(
                          value,
                          name
                        ) => [
                          value,
                          name === "systolic"
                            ? "Systolic"
                            : "Diastolic",
                        ]}
                      />

                      {/* Systolic */}
                      <Line
                        type="monotone"
                        dataKey="systolic"
                        stroke="#E66FD2"
                        strokeWidth={2}
                        dot={{
                          r: 6,
                          fill: "#E66FD2",
                          stroke: "#fff",
                          strokeWidth: 2,
                        }}
                        activeDot={{
                          r: 8,
                        }}
                      />

                      {/* Diastolic */}
                      <Line
                        type="monotone"
                        dataKey="diastolic"
                        stroke="#8C6FE6"
                        strokeWidth={2}
                        dot={{
                          r: 6,
                          fill: "#8C6FE6",
                          stroke: "#fff",
                          strokeWidth: 2,
                        }}
                        activeDot={{
                          r: 8,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-48 w-full items-center justify-center text-[#707070] italic">
                  No blood pressure data available
                </div>
              )}
            </div>

            {/* Blood Pressure Values */}
            <div className="flex flex-col justify-center gap-4">
              {/* Systolic */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#E66FD2]" />

                  <span className="font-bold text-[#072635]">
                    Systolic
                  </span>
                </div>

                <p className="text-2xl font-bold">
                  {na(latestBP?.systolic)}
                </p>

                {latestBP && (
                  <p className="text-xs text-[#707070]">
                    {latestBP.label}
                  </p>
                )}
              </div>

              <hr className="border-[#CBC8D4]" />

              {/* Diastolic */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#8C6FE6]" />

                  <span className="font-bold text-[#072635]">
                    Diastolic
                  </span>
                </div>

                <p className="text-2xl font-bold">
                  {na(latestBP?.diastolic)}
                </p>

                {latestBP && (
                  <p className="text-xs text-[#707070]">
                    {latestBP.label}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Vital Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Respiratory Rate */}
          <div className="rounded-[12px] bg-[#E0F3FA] p-4">
            <Wind className="mb-2 h-16 w-16" />

            <p className="text-sm">
              Respiratory Rate
            </p>

            <p className="text-2xl font-bold">
              {formatReading(respiratoryRate, " bpm")}
            </p>

            <p className="mt-2 text-sm">
              {na(respiratoryRate?.levels)}
            </p>
          </div>

          {/* Temperature */}
          <div className="rounded-[12px] bg-[#FFE6E9] p-4">
            <Thermometer className="mb-2 h-16 w-16" />

            <p className="text-sm">
              Temperature
            </p>

            <p className="text-2xl font-bold">
              {formatReading(temperature, "°F")}
            </p>

            <p className="mt-2 text-sm">
              {na(temperature?.levels)}
            </p>
          </div>

          {/* Heart Rate */}
          <div className="rounded-[12px] bg-[#FFE6F1] p-4">
            <Heart className="mb-2 h-16 w-16" />

            <p className="text-sm">
              Heart Rate
            </p>

            <p className="text-2xl font-bold">
              {formatReading(heartRate, " bpm")}
            </p>

            <p className="mt-2 text-sm">
              {na(heartRate?.levels)}
            </p>
          </div>
        </div>
      </div>

      {/* Diagnostic List */}
      <div className="rounded-[16px] bg-[#FFFFFF] p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-bold text-[#072635]">
          Diagnostic List
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#F6F7F8] text-[#072635]">
                <th className="pb-4 font-bold">
                  Problem/Diagnosis
                </th>

                <th className="pb-4 font-bold">
                  Description
                </th>

                <th className="pb-4 font-bold">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="text-[#072635]">
              {diagnosticList.length > 0 ? (
                diagnosticList.map(
                  (d: any, i: number) => (
                    <tr
                      key={i}
                      className="border-b border-[#F6F7F8]"
                    >
                      <td className="py-4">
                        {na(d.name)}
                      </td>

                      <td className="py-4">
                        {na(d.description)}
                      </td>

                      <td className="py-4">
                        {na(d.status)}
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="py-8 text-center text-[#707070] italic"
                  >
                    No diagnosis records available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}