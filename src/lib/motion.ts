export const springTransition = {
  type: "spring" as const,
  stiffness: 150,
  damping: 24,
  mass: 0.9,
};

export const softSpringTransition = {
  type: "spring" as const,
  stiffness: 110,
  damping: 22,
  mass: 1,
};

export const fadeTransition = {
  duration: 0.32,
  ease: [0.22, 1, 0.36, 1] as const,
};

export const quickFadeTransition = {
  duration: 0.08,
  ease: [0.22, 1, 0.36, 1] as const,
};
