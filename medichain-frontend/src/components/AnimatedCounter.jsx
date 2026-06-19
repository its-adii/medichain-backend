import { useEffect, useRef } from "react";
import { useMotionValue, useSpring, animate } from "framer-motion";

export default function AnimatedCounter({ value, duration = 1.2 }) {
  const ref = useRef(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 25,
    stiffness: 95,
  });

  const targetValue = typeof value === "number" ? value : Number(value) || 0;

  useEffect(() => {
    animate(motionValue, targetValue, { duration: duration, ease: "easeOut" });
  }, [targetValue, motionValue, duration]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.floor(latest).toLocaleString();
      }
    });
  }, [springValue]);

  return <span ref={ref}>0</span>;
}
