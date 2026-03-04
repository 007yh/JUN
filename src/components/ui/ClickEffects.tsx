import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface ClickRipple {
  id: number;
  x: number;
  y: number;
}

export const ClickEffects = () => {
  const [ripples, setRipples] = useState<ClickRipple[]>([]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const newRipple = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
      };
      setRipples((prev) => [...prev, newRipple]);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const removeRipple = (id: number) => {
    setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            onAnimationComplete={() => removeRipple(ripple.id)}
            style={{
              position: 'absolute',
              left: ripple.x - 25,
              top: ripple.y - 25,
              width: 50,
              height: 50,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 107, 157, 0.3)', // Primary color with opacity
              boxShadow: '0 0 10px rgba(255, 107, 157, 0.5)',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
