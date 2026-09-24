"use client";

import { useLenis } from "lenis/react";
import Snap from "lenis/snap";
import { useReducedMotion } from "motion/react";
import { useEffect, type ReactNode } from "react";

type PageSnapProps = {
  children: ReactNode;
  /** CSS selector for full-page sections */
  selector?: string;
};

/**
 * Mandatory Lenis snap — one wheel/trackpad gesture lands on the next section
 * (true “next page” behavior), instead of free continuous scrolling.
 */
export function PageSnap({
  children,
  selector = "[data-page-section]",
}: PageSnapProps) {
  const lenis = useLenis();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!lenis || reduceMotion) return;

    const snap = new Snap(lenis, {
      type: "mandatory",
      duration: 1.1,
      debounce: 50,
    });

    const elements = [
      ...document.querySelectorAll<HTMLElement>(selector),
    ];

    if (elements.length === 0) {
      snap.destroy();
      return;
    }

    const remove = snap.addElements(elements, {
      align: ["start"],
      ignoreTransform: true,
    });

    const onResize = () => snap.resize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      remove();
      snap.destroy();
    };
  }, [lenis, reduceMotion, selector]);

  return <>{children}</>;
}
