import { useEffect, useRef, type ReactNode } from "react";

type ParallaxProps = {
  children: ReactNode;
  /**
   * How far it drifts against the page. 0.2 is a distant background, 0.5 a
   * middle layer, negative brings it forward. Keep it under 0.5 or the seams
   * of the section show.
   */
  speed?: number;
  className?: string;
};

/**
 * Moves its children at a different rate from the page, for depth.
 *
 * The scroll position is read, never set. The element is moved with a
 * transform, which the compositor handles without laying the page out again —
 * animating top or margin here would drop frames on any real page.
 */
export default function Parallax({ children, speed = 0.25, className = "" }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let visible = true;

    // What this element is currently displaced by, tracked rather than read.
    //
    // getBoundingClientRect reports where the element is *after* the transform
    // from the last frame, so measuring it directly feeds the offset back into
    // itself: the value converges on speed / (1 + speed) instead of speed, and
    // wobbles for several frames getting there. Subtracting what we applied
    // gives the position the element would have had untouched.
    let applied = 0;

    const draw = () => {
      frame = 0;
      if (!visible) return;

      const box = node.getBoundingClientRect();

      // A wrapper around absolutely-positioned children has no height of its
      // own, and its own top is then the wrong thing to measure. The parent is
      // the section it decorates, which is what should drive the drift.
      const parent = box.height > 0 ? null : node.parentElement?.getBoundingClientRect();
      const measured = parent ?? box;

      // The correction applies only to our own rect. The parent is not the
      // element being transformed, so its position is already untouched —
      // subtracting there overshot by a third and drifted for several frames.
      const centre = measured.top + measured.height / 2 - (parent ? 0 : applied);
      const distance = centre - window.innerHeight / 2;

      applied = -distance * speed;
      node.style.transform = "translate3d(0, " + applied.toFixed(2) + "px, 0)";
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    // Off-screen elements cost nothing: the handler returns before touching
    // the DOM, which matters on a page with a dozen of these.
    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver((entries) => {
            for (const entry of entries) visible = entry.isIntersecting;
            schedule();
          });

    observer?.observe(node);

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    schedule();

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer?.disconnect();
      if (frame) cancelAnimationFrame(frame);
      node.style.transform = "";
    };
  }, [speed]);

  return (
    <div ref={ref} className={"will-change-transform " + className}>
      {children}
    </div>
  );
}
