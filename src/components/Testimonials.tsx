import Reveal from "./Reveal";

/*
 * Static marketing content of the landing section. It is UI copy, not patient
 * data: every patient value on this site comes from the API (src/lib/api.ts).
 */
const TESTIMONIALS = [
  {
    quote: "This platform transformed how we handle our customer onboarding. The clarity is unmatched.",
    author: "Sarah Jenkins",
    role: "Product Manager at TechFlow",
  },
  {
    quote: "I've tried every tool on the market. This is the only one that actually delivers on its promise.",
    author: "Marcus Chen",
    role: "Founder at InnovateCo",
  },
  {
    quote: "The analytics dashboard alone is worth the subscription. It's clean, fast, and incredibly useful.",
    author: "Elena Rodriguez",
    role: "Marketing Director at Creative Lab",
  },
];

export default function Testimonials() {
  const testimonials = TESTIMONIALS;

  return (
    <section id="testimonials" className="bg-[#F6F8FC] py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="mb-16 text-center text-3xl font-bold text-[#141A22] sm:text-4xl">Trusted by industry leaders</h2>
        </Reveal>
        
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t, index) => (
            <Reveal key={index} delay={index * 0.1}>
              <div className="flex h-full flex-col justify-between rounded-[12px] bg-[#FFFFFF] p-8 shadow-sm">
                <p className="mb-8 text-[#5B6570]">"{t.quote}"</p>
                <div>
                  <p className="font-semibold text-[#141A22]">{t.author}</p>
                  <p className="text-sm text-[#5B6570]">{t.role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
