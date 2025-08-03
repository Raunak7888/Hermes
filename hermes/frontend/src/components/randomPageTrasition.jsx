import React from "react";
import { motion } from "framer-motion";

// Define target elements for animation
const targetTags = ["h1", "h2", "input", "button", "div"];

/**
 * Recursively converts a target React element into its motion version with a refined bounce effect.
 * @param {React.ReactNode} element The element to process.
 * @returns {React.ReactNode} The animated element.
 */
function animateElement(element) {
  if (!React.isValidElement(element)) return element;

  const { children } = element.props;
  const animatedChildren = children
    ? React.Children.map(children, (child) => animateElement(child))
    : children;

  if (typeof element.type === "string" && targetTags.includes(element.type)) {
    const MotionComponent = motion[element.type] || motion.div;

    return (
      <MotionComponent
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          transition: {
            duration: 0.6,
            ease: [0.25, 1, 0.5, 1], // Smooth bounce easing
          },
        }}
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.4 } }}
        {...element.props}
      >
        {animatedChildren}
      </MotionComponent>
    );
  }

  return React.cloneElement(element, { children: animatedChildren });
}

export default function RandomPageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.6 } }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      style={{ overflow: "hidden" }}
    >
      {React.Children.map(children, (child) => animateElement(child))}
    </motion.div>
  );
}
