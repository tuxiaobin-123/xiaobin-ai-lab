'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const unsub = scrollYProgress.on('change', (v) => setVisible(v > 0.01));
    return unsub;
  }, [scrollYProgress]);

  if (!visible) return null;

  return (
    <motion.div
      style={{ scaleX, transformOrigin: '0%' }}
      className="fixed top-0 left-0 right-0 z-[300] h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500"
    />
  );
}
