import { useEffect, useMemo, useRef, useState } from "react";
import { diagnosticQuestions } from "../data/questions";
import { bridgeText, derivativeDefinitionText, lessonBlocks } from "../data/lessons";

type ChatMessage = {
  id: string;
  role: "tutor" | "user";
  text: string;
  tone?: "diagnostic" | "lesson" | "bridge" | "definition" | "practice";
};

type ChatStep =
  | "intro"
  | "diagnostic"
  | "lesson"
  | "bridge"
  | "definition"
  | "practice";

const steps: ChatStep[] = [
  "intro",
  "diagnostic",
  "lesson",
  "bridge",
  "definition",
  "practice"
];

const practiceQuestions = [
  {
    id: "p1",
    prompt: "1) If f'(3) = 5, what does that mean in words?",
    options: [
      {
        id: "p1a",
        text: "The slope of the tangent line at x = 3 is 5.",
        feedback:
          "Yes. The derivative is the instantaneous rate of change (slope) at that point."
      },
      {
        id: "p1b",
        text: "The function equals 5 at x = 3.",
        feedback:
          "Not quite. f'(3) is about slope, not the function value."
      }
    ]
  },
  {
    id: "p2",
    prompt: "2) Use the definition: if f(x) = x², what is f'(1)?",
    options: [
      {
        id: "p2a",
        text: "2",
        feedback:
          "Correct. ( (1+h)² − 1 ) / h = (2h + h²)/h = 2 + h → 2."
      },
      {
        id: "p2b",
        text: "1",
        feedback:
          "Close, but the limit gives 2. Try expanding (1+h)²."
      },
      {
        id: "p2c",
        text: "0",
        feedback: "Not quite. The slope at x = 1 for x² is 2."
      }
    ]
  },
  {
    id: "p3",
    prompt:
      "3) Fill in the blank: A limit can exist even if f(a) is ________.",
    options: [
      {
        id: "p3a",
        text: "undefined",
        feedback:
          "Yes. The function value can be undefined while the limit still exists."
      },
      {
        id: "p3b",
        text: "different",
        feedback:
          "That can be true too, but the key idea is that f(a) doesn’t have to exist."
      }
    ],
    allowText: true
  },
  {
    id: "p4",
    prompt:
      "4) Using the definition, which expression represents f'(x)?",
    options: [
      {
        id: "p4a",
        text: "lim(h→0) (f(x+h) − f(x)) / h",
        feedback: "Correct. That is the limit definition of the derivative."
      },
      {
        id: "p4b",
        text: "lim(x→0) f(x) / x",
        feedback:
          "Not quite. That is a limit, but it doesn’t match the derivative definition."
      },
      {
        id: "p4c",
        text: "(f(x) − f(0)) / x",
        feedback:
          "Not quite. This is a secant slope unless you take a limit as x→0."
      }
    ]
  },
  {
    id: "p5",
    prompt:
      "5) If f(x) = 3x, what is f'(2) using the definition?",
    options: [
      {
        id: "p5a",
        text: "3",
        feedback:
          "Correct. The slope of 3x is constant, so the derivative is 3."
      },
      {
        id: "p5b",
        text: "6",
        feedback:
          "Not quite. f'(2) is the slope, not the function value."
      },
      {
        id: "p5c",
        text: "2",
        feedback:
          "Not quite. The derivative of 3x is 3 for all x."
      }
    ]
  }
];

const diagnosticFeedback: Record<
  string,
  { correctOptionId: string; feedback: Record<string, string> }
> = {
  q1: {
    correctOptionId: "q1b",
    feedback: {
      q1a: "Not quite. The limit talks about values near 2, not the exact value at 2.",
      q1b: "Correct. A limit describes what f(x) approaches as x gets close to 2.",
      q1c: "Not quite. The function doesn’t have to be exactly 5 near 2, just close."
    }
  },
  q2: {
    correctOptionId: "q2a",
    feedback: {
      q2a: "Correct. The limit is about the y-value the curve approaches.",
      q2b: "Not quite. A hole doesn’t prevent a limit from existing.",
      q2c: "Not quite. The limit can exist even if f(3) is different or missing."
    }
  },
  q3: {
    correctOptionId: "q3b",
    feedback: {
      q3a: "Not quite. A limit is about nearby values, not just the single point.",
      q3b: "Correct. It’s the value the function approaches near a point.",
      q3c: "Not quite. Average rate of change is slope, not the definition of a limit."
    }
  },
  q4: {
    correctOptionId: "q4b",
    feedback: {
      q4a: "Not quite. If left and right limits differ, the two-sided limit does not exist.",
      q4b: "Correct. The left and right sides disagree, so there’s no single limit value.",
      q4c: "Not quite. The limit doesn’t depend on the actual value f(1)."
    }
  },
  q5: {
    correctOptionId: "q5a",
    feedback: {
      q5a: "Correct. Shrinking the interval leads to the instantaneous rate of change.",
      q5b: "Not quite. The average changes as the interval shrinks.",
      q5c: "Not quite. The average rate is still defined for tiny intervals."
    }
  }
};

export default function ChatSession() {
  const [step, setStep] = useState<ChatStep>("intro");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro-1",
      role: "tutor",
      text:
        "Hi! I’m your tutor. We’ll start with a warmup then begin the lesson.",
      tone: "lesson"
    }
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [diagnosticIndex, setDiagnosticIndex] = useState(0);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceDone, setPracticeDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const context = useMemo(() => {
    switch (step) {
      case "intro":
        return "Intro and overview of the lesson.";
      case "diagnostic":
        return "Diagnostic quiz on limits.";
      case "lesson":
        return "Lesson on limits: approach, graph, two-sided limits.";
      case "bridge":
        return "Bridge: average to instantaneous rate of change.";
      case "definition":
        return "Definition of the derivative using a limit.";
      case "practice":
        return "Practice questions on derivative meaning and definition.";
      default:
        return "Limits and derivatives lesson.";
    }
  }, [step]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
      return;
    }
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages, step, diagnosticIndex, practiceIndex]);

  const addTutorMessage = (
    text: string,
    tone?: ChatMessage["tone"]
  ) => {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-${prev.length}`, role: "tutor", text, tone }
    ]);
  };

  const addUserMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-${prev.length}`, role: "user", text }
    ]);
  };

  const startDiagnostic = () => {
    setStep("diagnostic");
    const first = diagnosticQuestions[0];
    addTutorMessage("Here are some questions to get started:", "diagnostic");
    addTutorMessage(first.prompt, "diagnostic");
  };

  const startLesson = () => {
    setStep("lesson");
    addTutorMessage("Let's start the lesson", "lesson");
    lessonBlocks.forEach((block) => {
      addTutorMessage(`${block.title} — ${block.text}`, "lesson");
    });
    addTutorMessage("If you want another phrasing, just ask.", "lesson");
    addTutorMessage("Ready to connect this to rates of change?", "lesson");
  };

  const startBridge = () => {
    setStep("bridge");
    addTutorMessage(
      "Now, let's consider the rate of change, or slope, at a single point.",
      "bridge"
    );
    bridgeText.forEach((line) => addTutorMessage(line, "bridge"));
    addTutorMessage("Ready for the formal derivative definition?", "bridge");
  };

  const startDefinition = () => {
    setStep("definition");
    addTutorMessage("Definition of the derivative:", "definition");
    derivativeDefinitionText.forEach((line) =>
      addTutorMessage(line, "definition")
    );
    addTutorMessage("Want to try a few practice questions?", "definition");
  };

  const startPractice = () => {
    setStep("practice");
    setPracticeIndex(0);
    setPracticeDone(false);
    addTutorMessage("Practice time.", "practice");
    addTutorMessage(practiceQuestions[0].prompt, "practice");
  };

  const handleDiagnosticAnswer = (optionId: string, optionText: string) => {
    addUserMessage(optionText);
    const feedbackPack = diagnosticFeedback[currentDiagnostic.id];
    const feedbackText = feedbackPack?.feedback?.[optionId];
    if (feedbackText) {
      addTutorMessage(feedbackText, "diagnostic");
    }
    const nextIndex = diagnosticIndex + 1;
    if (nextIndex < diagnosticQuestions.length) {
      setDiagnosticIndex(nextIndex);
      addTutorMessage(diagnosticQuestions[nextIndex].prompt, "diagnostic");
    } else {
      addTutorMessage("Great! Let's get started on the lesson.", "diagnostic");
      startLesson();
    }
  };

  const handlePracticeAnswer = (optionText: string, feedback: string) => {
    addUserMessage(optionText);
    addTutorMessage(feedback, "practice");
    const nextIndex = practiceIndex + 1;
    if (nextIndex < practiceQuestions.length) {
      setPracticeIndex(nextIndex);
      addTutorMessage(practiceQuestions[nextIndex].prompt, "practice");
    } else {
      setPracticeDone(true);
      addTutorMessage(
        "Nice work. Want to review anything or ask a question?",
        "practice"
      );
    }
  };

  const sendToTutor = async (
    message: string,
    history: ChatMessage[]
  ) => {
    setIsSending(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          context,
          history: history.map((item) => ({
            role: item.role === "tutor" ? "assistant" : "user",
            content: item.text
          }))
        })
      });
      const data = await response.json();
      addTutorMessage(
        data.reply ||
          "I might have missed that. Can you rephrase your question?",
        step === "diagnostic"
          ? "diagnostic"
          : step === "bridge"
          ? "bridge"
          : step === "definition"
          ? "definition"
          : step === "practice"
          ? "practice"
          : "lesson"
      );
    } catch (error) {
      addTutorMessage(
        "Something went wrong on my side. Please try again.",
        "lesson"
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleSend = () => {
    const message = input.trim();
    if (!message || isSending) {
      return;
    }
    setInput("");
    const nextMessages: ChatMessage[] = [
      ...messages,
      { id: `${Date.now()}-${messages.length}`, role: "user", text: message }
    ];
    setMessages(nextMessages);
    sendToTutor(message, nextMessages);
  };

  const canShowDiagnosticOptions = step === "diagnostic";
  const canShowPracticeOptions = step === "practice" && !practiceDone;

  const currentDiagnostic = diagnosticQuestions[diagnosticIndex];
  const currentPractice = practiceQuestions[practiceIndex];

  return (
    <section className="mx-auto flex min-h-screen max-w-3xl flex-col bg-white px-6 py-10">
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <h1 className="text-lg font-semibold">Tutor</h1>
        <p className="text-sm text-slate-600">
          Learn about limits and definition of derivative.
        </p>
      </div>

      <div
        ref={scrollRef}
        className="mt-6 flex-1 space-y-3 overflow-y-auto rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === "user"
                ? "ml-auto max-w-[80%] rounded-md bg-blue-50 p-3 text-sm text-blue-900"
                : message.tone === "diagnostic"
                ? "mr-auto max-w-[80%] rounded-md border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-900"
                : message.tone === "bridge"
                ? "mr-auto max-w-[80%] rounded-md border border-purple-100 bg-purple-50 p-3 text-sm text-purple-900"
                : message.tone === "definition"
                ? "mr-auto max-w-[80%] rounded-md border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-900"
                : message.tone === "practice"
                ? "mr-auto max-w-[80%] rounded-md border border-rose-100 bg-rose-50 p-3 text-sm text-rose-900"
                : "mr-auto max-w-[80%] rounded-md border border-amber-100 bg-amber-50 p-3 text-sm text-amber-900"
            }
          >
            {message.text}
          </div>
        ))}

        {step === "intro" && (
          <div className="flex gap-2">
            <button
              onClick={startDiagnostic}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Start lesson
            </button>
          </div>
        )}

        {step === "lesson" && (
          <div className="flex gap-2">
            <button
              onClick={startBridge}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Continue to rates
            </button>
          </div>
        )}

        {step === "bridge" && (
          <div className="flex gap-2">
            <button
              onClick={startDefinition}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
            >
              See the definition
            </button>
          </div>
        )}

        {step === "definition" && (
          <div className="flex gap-2">
            <button
              onClick={startPractice}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Start practice
            </button>
          </div>
        )}

        {canShowDiagnosticOptions && currentDiagnostic && (
          <div className="space-y-2">
            {currentDiagnostic.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleDiagnosticAnswer(option.id, option.text)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                {option.text}
              </button>
            ))}
          </div>
        )}

        {canShowPracticeOptions && currentPractice && (
          <div className="space-y-2">
            {currentPractice.options.map((option) => (
              <button
                key={option.id}
                onClick={() =>
                  handlePracticeAnswer(option.text, option.feedback)
                }
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                {option.text}
              </button>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask a question or type a response..."
          rows={3}
          className="w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-sm"
        />
        <button
          onClick={handleSend}
          disabled={isSending}
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
    </section>
  );
}
