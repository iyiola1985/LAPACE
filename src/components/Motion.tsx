"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  animate,
  type HTMLMotionProps,
  type PanInfo,
  type Variants,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const ease = [0.22, 1, 0.36, 1] as const;

export function useMotionSafe() {
  const reduce = useReducedMotion();
  return !reduce;
}

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.08 },
  },
};

type FadeInProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function FadeIn({
  children,
  className,
  delay = 0,
  ...props
}: FadeInProps) {
  const animateMotion = useMotionSafe();

  if (!animateMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.7, ease: "easeOut", delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Full section reveal — matches SocialAdverts whileInView page effect.
 */
type PageRevealProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
  compact?: boolean;
  pageSection?: boolean;
};

export function PageReveal({
  children,
  className,
  as = "div",
  compact = false,
  pageSection = false,
}: PageRevealProps) {
  const animateMotion = useMotionSafe();
  const Tag = as === "section" ? motion.section : motion.div;
  const sectionProps = pageSection
    ? ({ "data-page-section": true } as const)
    : {};

  if (!animateMotion) {
    const Static = as === "section" ? "section" : "div";
    return (
      <Static className={className} {...sectionProps}>
        {children}
      </Static>
    );
  }

  return (
    <Tag
      className={className}
      {...sectionProps}
      initial={{
        opacity: 0,
        y: compact ? 30 : 80,
        scale: 0.96,
      }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{
        duration: compact ? 0.6 : 0.9,
        ease: "easeOut",
      }}
    >
      {children}
    </Tag>
  );
}

type StaggerProps = {
  children: ReactNode;
  className?: string;
};

export function Stagger({ children, className }: StaggerProps) {
  const animateMotion = useMotionSafe();

  if (!animateMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-8%" }}
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const animateMotion = useMotionSafe();

  if (!animateMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 28, scale: 0.97 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.55, ease },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

type HeroRevealProps = {
  children: ReactNode;
  className?: string;
};

export function HeroReveal({ children, className }: HeroRevealProps) {
  const animateMotion = useMotionSafe();

  if (!animateMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  );
}

export function HeroItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const animateMotion = useMotionSafe();

  if (!animateMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={fadeUpVariants}>
      {children}
    </motion.div>
  );
}

export function HeroImage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const animateMotion = useMotionSafe();

  if (!animateMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ scale: 1.06, opacity: 0.85 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1.1, ease }}
    >
      {children}
    </motion.div>
  );
}

type TouchCarouselProps = {
  children: ReactNode[];
  className?: string;
  gap?: number;
};

/**
 * Mobile swipe carousel (SocialAdverts-style ← Swipe →).
 * Desktop callers should hide this and show a normal grid.
 */
export function TouchCarousel({
  children,
  className = "",
  gap = 16,
}: TouchCarouselProps) {
  const animateMotion = useMotionSafe();
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [slideWidth, setSlideWidth] = useState(0);
  const x = useMotionValue(0);
  const maxIndex = Math.max(0, children.length - 1);

  useEffect(() => {
    const node = trackRef.current;
    if (!node) return;

    function measure() {
      if (!node) return;
      setSlideWidth(node.clientWidth);
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!slideWidth) return;
    void animate(x, -(index * (slideWidth + gap)), {
      type: "spring",
      stiffness: 400,
      damping: 30,
    });
  }, [index, slideWidth, gap, x]);

  const goTo = useCallback(
    (next: number) => {
      setIndex(Math.min(Math.max(0, next), maxIndex));
    },
    [maxIndex],
  );

  function onDragEnd(_: unknown, info: PanInfo) {
    const threshold = slideWidth * 0.2;
    if (Math.abs(info.offset.x) > threshold || Math.abs(info.velocity.x) > 500) {
      if (info.offset.x < 0 && index < maxIndex) {
        goTo(index + 1);
        return;
      }
      if (info.offset.x > 0 && index > 0) {
        goTo(index - 1);
        return;
      }
    }
    void animate(x, -(index * (slideWidth + gap)), {
      type: "spring",
      stiffness: 400,
      damping: 30,
    });
  }

  if (!animateMotion) {
    return (
      <div className={`flex gap-4 overflow-x-auto ${className}`}>{children}</div>
    );
  }

  return (
    <div className={`flex w-full flex-col ${className}`}>
      <div ref={trackRef} className="touch-carousel w-full overflow-hidden">
        <motion.div
          className="flex cursor-grab active:cursor-grabbing"
          style={{ x, gap }}
          drag="x"
          dragConstraints={{
            left: -(maxIndex * (slideWidth + gap)),
            right: 0,
          }}
          dragElastic={0.12}
          onDragEnd={onDragEnd}
        >
          {children.map((child, i) => (
            <div
              key={i}
              className="w-full shrink-0"
              style={{ width: slideWidth || "100%" }}
            >
              {child}
            </div>
          ))}
        </motion.div>
      </div>

      {maxIndex > 0 ? (
        <div className="mt-4 flex flex-col items-center gap-3">
          <div className="flex gap-2">
            {children.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index
                    ? "w-6 bg-primary"
                    : "w-2 bg-outline-variant hover:bg-outline"
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant opacity-60">
            ← Swipe →
          </span>
        </div>
      ) : null}
    </div>
  );
}
