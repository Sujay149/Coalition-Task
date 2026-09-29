import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center bg-[#F6F8FC] px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <span className="mb-4 inline-block rounded-full bg-[#E2E8F2] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#5B6570]">
          New: Version 2.0 is live
        </span>
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-[#141A22] sm:text-6xl">
          The platform designed for <span className="text-[#3355FF]">clarity</span> and conversion.
        </h1>
        <p className="mb-10 text-lg text-[#5B6570] sm:text-xl">
          Stop struggling with complex tools. Start building websites that communicate value instantly and convert visitors into loyal customers effortlessly.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#features"
            className="flex items-center gap-2 rounded-[12px] bg-[#3355FF] px-8 py-4 text-lg font-semibold text-white transition-opacity hover:opacity-90"
          >
            Explore Features
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
