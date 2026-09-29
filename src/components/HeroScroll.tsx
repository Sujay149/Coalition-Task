import { useEffect, useRef, type ReactNode } from "react";

type HeroScrollProps = {
  /** The headline, the supporting line, the call to action. */
  children: ReactNode;
  /** The far layer — a photograph, a gradient, a grid. Drifts slowest. */
  background?: ReactNode;
  /** A single foreground object. Travels fastest, and holds briefly on its way out. */
  shape?: ReactNode;
  className?: string;
};

/**
 * The first screen, and its handover to the one below.
 *
 * Three layers moving at three rates across exactly one viewport of scroll —
 * the background at half the page's speed, the content at its own, the shape
 * ahead of both. That difference is the whole effect: it is what makes the
 * background read as far away and the shape as close, and it is what the
 * second section then rises over.
 *
 * The scroll position is read, never taken. No wrapper is fixed, nothing is
 * transformed in place of scrolling, and the page keeps its own momentum,
 * keyboard and scrollbar. A library that fakes the scroll gets this look by
 * replacing the one thing a reader already knows how to use.
 */
export default function HeroScroll({ children, background, shape, className = "" }: HeroScrollProps) {
  const section = useRef<HTMLElement>(null);
  const farLayer = useRef<HTMLDivElement>(null);
  const contentLayer = useRef<HTMLDivElement>(null);
  const shapeLayer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = section.current;
    if (!outer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;

    const draw = () => {
      frame = 0;

      const height = outer.offsetHeight || window.innerHeight;

      // 0 at rest, 1 once the hero has been scrolled entirely past. Clamped,
      // so nothing keeps travelling after the section is gone.
      const progress = Math.min(1, Math.max(0, -outer.getBoundingClientRect().top / height));

      // Slower than the page, so it appears to sit behind it.
      if (farLayer.current) {
        farLayer.current.style.transform = "translate3d(0, " + (progress * height * 0.5).toFixed(1) + "px, 0)";
      }

      // Lifts a little and gives way, so the section below arrives over it
      // rather than after it.
      if (contentLayer.current) {
        contentLayer.current.style.transform = "translate3d(0, " + (progress * -80).toFixed(1) + "px, 0)";
        contentLayer.current.style.opacity = String(Math.max(0, 1 - progress * 1.6));
      }

      // Ahead of the page, so it reads as nearest — and held still through the
      // middle third, which is the pause the eye needs to register it.
      if (shapeLayer.current) {
        const held = Math.min(1, Math.max(0, (progress - 0.35) / 0.3));
        const travel = progress < 0.35 ? progress : 0.35 + held * (progress - 0.35);
        shapeLayer.current.style.transform = "translate3d(0, " + (travel * height * -0.5).toFixed(1) + "px, 0)";
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    schedule();

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      ref={section}
      className={"relative isolate flex min-h-svh flex-col justify-center overflow-hidden " + className}
    >
      {background ? (
        <div ref={farLayer} className="absolute inset-0 -z-10 will-change-transform">
          {/* Scaled, so half a viewport of drift never exposes the edge. */}
          <div className="h-full w-full scale-125">{background}</div>
        </div>
      ) : null}

      {shape ? (
        <div
          ref={shapeLayer}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 flex justify-center will-change-transform"
        >
          {shape}
        </div>
      ) : null}

      <div
        ref={contentLayer}
        className="relative mx-auto w-full max-w-6xl px-4 will-change-transform sm:px-6 lg:px-8"
      >
        {children}
      </div>
    </section>
  );
}
