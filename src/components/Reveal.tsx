import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Seconds to wait once it enters, for staggering a row. */
  delay?: number;
  /** Where it comes from. */
  from?: "bottom" | "left" | "right" | "none";
  className?: string;
};

/**
 * Fades and lifts its children the first time they enter the viewport.
 *
 * Once only: an element that re-animates every time it scrolls back into view
 * is a distraction rather than a welcome.
 */
export default function Reveal({ children, delay = 0, from = "bottom", className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Starts visible. If the observer never runs — no JavaScript, an old
  // browser — the content is simply there, rather than invisible forever.
  const [shown, setShown] = useState(true);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;

    setShown(false);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setShown(true);
          observer.disconnect();
        }
      },
      // A little before it reaches the fold, so it is already arriving rather
      // than starting the moment it appears.
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const hidden =
    from === "left"
      ? "opacity-0 -translate-x-8"
      : from === "right"
        ? "opacity-0 translate-x-8"
        : from === "none"
          ? "opacity-0"
          : "opacity-0 translate-y-8";

  return (
    <div
      ref={ref}
      style={{ transitionDelay: delay + "s" }}
      className={
        "transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-none " +
        (shown ? "opacity-100 translate-x-0 translate-y-0" : hidden) +
        " " +
        className
      }
    >
      {children}
    </div>
  );
}
