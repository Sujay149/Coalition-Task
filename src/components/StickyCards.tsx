import { useEffect, useRef, type ReactNode } from "react";

type StickyCardsProps = {
  /** One element per card. */
  children: ReactNode;
  /** Sits above the row while it travels. Optional. */
  heading?: ReactNode;
  className?: string;
};

/**
 * A row of cards that travels sideways while the section stays put.
 *
 * The section is tall; a sticky child holds the viewport while the page
 * scrolls through that height, and the row is moved horizontally in step. The
 * reader is scrolling down the whole time — this reads their progress through
 * the section and turns it into sideways movement. Nothing is hijacked, and
 * flicking back up rewinds it exactly.
 *
 * On a narrow screen it becomes an ordinary horizontal scroller: a pinned
 * section on a phone eats the viewport and fights the platform's own
 * gestures.
 */
export default function StickyCards({ children, heading, className = "" }: StickyCardsProps) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = section.current;
    const row = track.current;
    if (!outer || !row) return;

    const narrow = window.matchMedia("(max-width: 767px)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (narrow.matches || still.matches) return;

    let frame = 0;

    const draw = () => {
      frame = 0;

      const box = outer.getBoundingClientRect();
      const travel = row.scrollWidth - window.innerWidth;
      if (travel <= 0) return;

      // 0 as the section reaches the top, 1 as its last screen leaves.
      const distance = outer.offsetHeight - window.innerHeight;
      const progress = distance <= 0 ? 0 : Math.min(1, Math.max(0, -box.top / distance));

      row.style.transform = "translate3d(" + (-progress * travel).toFixed(2) + "px, 0, 0)";
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
      row.style.transform = "";
    };
  }, []);

  return (
    <section
      ref={section}
      // Tall enough for the row to finish crossing before the section ends.
      // Two extra screens is the difference between a leisurely pass and one
      // that is over before it is noticed.
      className={"relative md:h-[300vh] " + className}
    >
      <div className="md:sticky md:top-0 md:flex md:h-svh md:flex-col md:justify-center md:overflow-hidden">
        {heading ? <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">{heading}</div> : null}

        {/* Full-bleed: the row runs to both edges rather than stopping short
            inside a centred container. */}
        <div
          ref={track}
          className="no-scrollbar mt-8 flex w-full gap-6 overflow-x-auto px-4 will-change-transform sm:px-6 md:overflow-visible lg:px-8"
        >
          {children}
        </div>
      </div>
    </section>
  );
}
