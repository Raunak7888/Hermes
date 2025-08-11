// src/components/randomPageTrasition.jsx
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      mass: 0.4,
      damping: 10,
      stiffness: 100,
      duration: 0.5,
    },
  },
  out: {
    opacity: 0,
    y: 0,
    scale: 0,
    transition: {
      duration: 0.3,
    },
  },
};

const RandomPageTransition = ({ children }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={window.location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="in"
        exit="out"
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default RandomPageTransition;