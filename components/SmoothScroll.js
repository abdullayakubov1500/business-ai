"use client";

import "lenis/dist/lenis.css";
import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "framer-motion";

export default function SmoothScroll({ children }) {
  const reduce = useReducedMotion();

  return (
    <ReactLenis
      root
      options={{
        lerp: reduce ? 1 : 0.09,
        duration: reduce ? 0 : 1.1,
        smoothWheel: !reduce,
      }}
    >
      {children}
    </ReactLenis>
  );
}
