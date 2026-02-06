export type LessonBlock = {
  id: string;
  title: string;
  text: string;
};

export const lessonBlocks: LessonBlock[] = [
  {
    id: "core-idea",
    title: "Limits describe approach",
    text:
      "A limit tells you what value a function is heading toward as x gets close to a point. It does not require the function to actually land there."
  },
  {
    id: "approach-not-equal",
    title: "Approach vs. equal",
    text:
      "f(2) and lim(x→2) f(x) are related but not the same. The limit is about nearby x-values, not the exact point."
  },
  {
    id: "graph-vs-value",
    title: "Graph shape matters",
    text:
      "When reading a limit from a graph, focus on where the curve is heading from both sides, not just the single dot."
  },
  {
    id: "two-sided",
    title: "Two-sided limits",
    text:
      "A two-sided limit exists only when the left-hand and right-hand limits match."
  }
];

export const bridgeText = [
  "Average rate of change over [a, b] is the slope of the secant line: (f(b) − f(a)) / (b − a).",
  "If we slide b closer to a, the secant line tilts toward a tangent line.",
  "That limiting slope is the instantaneous rate of change at a."
];

export const derivativeDefinitionText = [
  "The derivative at x is defined by a limit:",
  "f'(x) = lim(h→0) (f(x+h) − f(x)) / h",
  "It measures how fast the function is changing at a single instant."
];
