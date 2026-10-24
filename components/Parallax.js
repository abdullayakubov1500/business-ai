"use client";

import { useRef } from "react";
import { useLenis } from "lenis/react";
import { useReducedMotion } from "framer-motion";

export default function Parallax({ speed = 0.18, className = "", children }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  useLenis((lenis) => {
    if (reduce || !ref.current) {
      return;
    }
    ref.current.style.transform = `translate3d(0, ${lenis.scroll * speed}px, 0)`;
  });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
