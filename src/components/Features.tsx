import Reveal from "./Reveal";
import { Zap, ShieldCheck, BarChart3 } from "lucide-react";

const ICON_MAP: Record<string, any> = {
  Zap,
  ShieldCheck,
  BarChart3,
};

/*
 * Static marketing content of the landing section. It is UI copy, not patient
 * data: every patient value on this site comes from the API (src/lib/api.ts).
 */
const FEATURES = [
  {
    icon: "Zap",
    title: "Lightning Fast",
    description: "Optimized for performance so your users never wait. Built on modern infrastructure for instant loading.",
  },
  {
    icon: "ShieldCheck",
    title: "Secure by Default",
    description: "Enterprise-grade security built into every layer. We protect your data as if it were our own.",
  },
  {
    icon: "BarChart3",
    title: "Insightful Analytics",
    description: "Understand your audience with clean, actionable data visualization that helps you grow.",
  },
];

export default function Features() {
  const features = FEATURES;

  return (
    <section id="features" className="py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-[#141A22] sm:text-4xl">Everything you need to scale</h2>
            <p className="mt-4 text-[#5B6570]">Powerful tools for modern teams, all in one place.</p>
          </div>
        </Reveal>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = ICON_MAP[feature.icon];
            return (
              <Reveal key={feature.title} delay={index * 0.1}>
                <div className="rounded-[12px] border border-[#E2E8F2] bg-[#FFFFFF] p-8 transition-shadow hover:shadow-lg">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#F6F8FC] text-[#3355FF]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-[#141A22]">{feature.title}</h3>
                  <p className="text-[#5B6570]">{feature.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
