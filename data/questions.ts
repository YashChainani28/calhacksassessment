export type DiagnosticOption = {
  id: string;
  text: string;
};

export type DiagnosticQuestion = {
  id: string;
  prompt: string;
  options: DiagnosticOption[];
};

export const diagnosticQuestions: DiagnosticQuestion[] = [
  {
    id: "q1",
    prompt:
      "If lim(x→2) f(x) = 5, which statement must be true?",
    options: [
      {
        id: "q1a",
        text: "f(2) = 5"
      },
      {
        id: "q1b",
        text: "f(x) is close to 5 when x is close to 2"
      },
      {
        id: "q1c",
        text: "f(x) is exactly 5 for all x near 2"
      }
    ]
  },
  {
    id: "q2",
    prompt:
      "The graph of f has a hole at x = 3 but the curve approaches 7 there. The limit is:",
    options: [
      {
        id: "q2a",
        text: "7"
      },
      {
        id: "q2b",
        text: "Undefined because there is a hole"
      },
      {
        id: "q2c",
        text: "Whatever f(3) is"
      }
    ]
  },
  {
    id: "q3",
    prompt:
      "A limit describes:",
    options: [
      {
        id: "q3a",
        text: "A value at a single point"
      },
      {
        id: "q3b",
        text: "A value the function approaches near a point"
      },
      {
        id: "q3c",
        text: "The average rate of change around a point"
      }
    ]
  },
  {
    id: "q4",
    prompt:
      "If the left-hand limit is 4 and the right-hand limit is 6 at x = 1, then the limit is:",
    options: [
      {
        id: "q4a",
        text: "5"
      },
      {
        id: "q4b",
        text: "Does not exist"
      },
      {
        id: "q4c",
        text: "f(1)"
      }
    ]
  },
  {
    id: "q5",
    prompt:
      "Average rate of change from x = 2 to x = 3 is about 4. What happens as the interval shrinks?",
    options: [
      {
        id: "q5a",
        text: "It approaches the instantaneous rate of change"
      },
      {
        id: "q5b",
        text: "It stays the same because the average is fixed"
      },
      {
        id: "q5c",
        text: "It becomes undefined for small intervals"
      }
    ]
  }
];
