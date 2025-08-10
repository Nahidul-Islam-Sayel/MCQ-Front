import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

type Question = {
  _id: string;
  questionText: string;
  options: string[];
  step?: number;
  level?: string;
};

type Answer = { questionId: string; selectedIndex: number };

const SECONDS_PER_QUESTION = 60;

export default function MCQStudentTestPage(): JSX.Element {
  const [step, setStep] = useState<number>(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [locked, setLocked] = useState<Record<string, boolean>>({});
  const [timers, setTimers] = useState<Record<string, number>>({});

  const questionTimerRef = useRef<number | null>(null);
  const lockAdvanceCalledRef = useRef(false);

  const [submittedResult, setSubmittedResult] = useState<any>(null);
  const [name, setName] = useState<string>(
    () => localStorage.getItem("username") || ""
  );
  const [email, setEmail] = useState<string>(
    () => localStorage.getItem("useremail") || ""
  );
  const userid = localStorage.getItem("userid") || undefined;
  const [examStarted, setExamStarted] = useState(false);

  // Load questions on exam start or step change
  useEffect(() => {
    if (examStarted) {
      loadQuestions(step);
    }
  }, [step, examStarted]);

  // Initialize timers, locked and answers on question load
  useEffect(() => {
    if (questions.length > 0) {
      const initialTimers: Record<string, number> = {};
      questions.forEach((q) => {
        initialTimers[q._id] = SECONDS_PER_QUESTION;
      });
      setTimers(initialTimers);
      setLocked({});
      setAnswers({});
      setCurrentIndex(0);
      lockAdvanceCalledRef.current = false;
      if (questionTimerRef.current) {
        clearInterval(questionTimerRef.current);
        questionTimerRef.current = null;
      }
    }
  }, [questions]);

  // Timer effect for current question
  useEffect(() => {
    if (!examStarted) return;
    if (questions.length === 0) return;

    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    if (locked[currentQ._id]) {
      // Question locked, set timer to zero and no timer
      setTimers((prev) => ({ ...prev, [currentQ._id]: 0 }));
      return;
    }

    // Clear previous interval
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
      questionTimerRef.current = null;
    }

    lockAdvanceCalledRef.current = false;

    questionTimerRef.current = window.setInterval(() => {
      setTimers((prev) => {
        const currentTime = prev[currentQ._id];
        if (currentTime <= 1) {
          if (questionTimerRef.current) {
            clearInterval(questionTimerRef.current);
            questionTimerRef.current = null;
          }
          if (!lockAdvanceCalledRef.current) {
            lockAdvanceCalledRef.current = true;
            lockCurrentQuestionAndAdvance();
          }
          return { ...prev, [currentQ._id]: 0 };
        }
        return { ...prev, [currentQ._id]: currentTime - 1 };
      });
    }, 1000);

    return () => {
      if (questionTimerRef.current) {
        clearInterval(questionTimerRef.current);
        questionTimerRef.current = null;
      }
      lockAdvanceCalledRef.current = false;
    };
  }, [currentIndex, examStarted, locked, questions]);

  // Load questions function
  async function loadQuestions(s: number) {
    setLoading(true);
    try {
      const resp = await fetch(
        `https://mcq-back.onrender.com/exam/questions?step=${s}`
      );
      const data = await resp.json();
      const qs: Question[] = data.questions || [];
      setQuestions(qs);
      setSubmittedResult(null);
    } catch (err) {
      console.error(err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }

  // Lock current question and advance one step
  const lockCurrentQuestionAndAdvance = () => {
    const q = questions[currentIndex];
    if (!q) return;

    setLocked((prev) => ({ ...prev, [q._id]: true }));

    if (currentIndex === questions.length - 1) {
      handleSubmit(true);
      return;
    }

    setCurrentIndex((i) => {
      const nextIndex = i + 1;
      return nextIndex < questions.length ? nextIndex : i;
    });
  };

  // Handle answer select - locks question immediately and disables changes
  const handleSelect = (qId: string, idx: number) => {
    if (locked[qId]) return; // locked question no change
    if (answers[qId] !== undefined) return; // already answered, no changes

    setAnswers((prev) => ({
      ...prev,
      [qId]: idx,
    }));

    // Lock this question immediately, set timer to 0
    setLocked((prev) => ({ ...prev, [qId]: true }));
    setTimers((prev) => ({ ...prev, [qId]: 0 }));

    // Auto move to next question shortly
    setTimeout(() => {
      setCurrentIndex((i) => {
        if (i >= questions.length - 1) return i;
        return i + 1;
      });
    }, 200);
  };

  const handlePrev = () => {
    if (currentIndex === 0) return;
    setCurrentIndex((i) => i - 1);
  };

  const handleNext = () => {
    if (currentIndex === questions.length - 1) return;
    setCurrentIndex((i) => i + 1);
  };

  // New SweetAlert2 powered submit handler with modal input for name and confirm modal
  const handleSubmit = async (auto = false) => {
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
      questionTimerRef.current = null;
    }

    let finalName = name;

    if (!finalName) {
      const { value: enteredName } = await MySwal.fire({
        title: "Enter your full name for the certificate",
        input: "text",
        inputLabel: "Full Name",
        inputPlaceholder: "Your full name",
        inputValue: "",
        showCancelButton: true,
        confirmButtonText: "Submit",
        cancelButtonText: "Cancel",
        inputValidator: (value) => {
          if (!value) {
            return "You need to enter your name!";
          }
          return null;
        },
        customClass: {
          popup: "max-w-md",
        },
      });

      if (!enteredName) {
        // user cancelled input
        return;
      }

      finalName = enteredName;
      setName(finalName);
    }

    // Confirm submission modal
    const confirmResult = await MySwal.fire({
      title: "Submit test now?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, submit",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "max-w-md",
      },
    });

    if (!confirmResult.isConfirmed) {
      return;
    }

    const answersArr: Answer[] = questions.map((q) => ({
      questionId: q._id,
      selectedIndex: typeof answers[q._id] === "number" ? answers[q._id] : -1,
    }));

    try {
      const res = await fetch("https://mcq-back.onrender.com/exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userid,
          name: finalName,
          email: email || "",
          step,
          level: questions[0]?.level || "A1",
          answers: answersArr,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        await MySwal.fire(
          "Submit Failed",
          err.message || "Submit failed",
          "error"
        );
        return;
      }
      const data = await res.json();
      setSubmittedResult(data);
      await MySwal.fire("Success", "Your test has been submitted!", "success");
    } catch (err) {
      console.error(err);
      await MySwal.fire(
        "Submit Failed",
        "Submit failed due to network error.",
        "error"
      );
    }
  };

  const canRetakeCheck = async () => {
    if (!userid) return true;
    try {
      const resp = await fetch(
        `https://mcq-back.onrender.com/exam/latest-result?userId=${userid}&step=${step}`
      );
      const data = await resp.json();
      if (data.result) {
        if (step === 1 && data.result.certification === "Fail") {
          return false;
        }
      }
    } catch (err) {
      console.error(err);
    }
    return true;
  };

  const examRules = `
1. Each question has 1 minute.
2. Once time is up for a question, it will be locked.
3. You cannot change answers after time expires or answer selection.
4. If you fail Step 1, you cannot retake.
5. Auto-submit on last question timer end.
6. Be honest and do not cheat.
`;

  const handleStart = async () => {
    const ok = await canRetakeCheck();
    if (!ok) {
      await MySwal.fire(
        "Not Allowed",
        "You cannot retake this step (previously failed).",
        "warning"
      );
      return;
    }

    const { isConfirmed } = await MySwal.fire({
      title: "Are you ready to start the exam?",
      html: (
        <div style={{ textAlign: "left", whiteSpace: "pre-line" }}>
          <strong>Exam Rules:</strong>
          <br />
          {examRules}
        </div>
      ),
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Yes, start exam",
      cancelButtonText: "Not yet",
      customClass: {
        popup: "max-w-md",
      },
    });

    if (!isConfirmed) return;

    setExamStarted(true);
  };

  const handleProceedNext = () => {
    if (!submittedResult) return;
    if (submittedResult.proceedToNextStep) {
      const next = Math.min(3, step + 1);
      setStep(next);
      setExamStarted(false);
    } else {
      MySwal.fire(
        "Info",
        "You are not eligible to proceed to next step.",
        "info"
      );
    }
  };

  if (loading && examStarted) {
    return (
      <div className="p-6 text-base sm:text-lg md:text-xl">
        Loading questions...
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-6 text-center mt-20">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
          Welcome to the Exam
        </h1>
        <div className="max-w-md bg-white p-6 rounded shadow mb-6 text-left whitespace-pre-line text-sm sm:text-base md:text-lg">
          <strong>Exam Rules:</strong>
          <br />
          {examRules}
        </div>
        <button
          onClick={handleStart}
          className="px-8 py-4 bg-indigo-600 text-white text-base sm:text-lg md:text-xl rounded hover:bg-indigo-700 transition"
        >
          Start Exam
        </button>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="p-6 text-base sm:text-lg md:text-xl">
        <h2 className="text-lg sm:text-xl md:text-2xl mb-2">
          No questions available for Step {step} yet.
        </h2>
        <p>Ask your admin to add questions in admin panel.</p>
      </div>
    );
  }

  if (submittedResult) {
    const { certification, percentage, certificateUrl, proceedToNextStep } =
      submittedResult;
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-20 text-base sm:text-lg md:text-xl">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
          Test Result — Step {step}
        </h2>
        <p>
          <strong>Certification:</strong> {certification}
        </p>
        <p>
          <strong>Percentage:</strong>{" "}
          {percentage?.toFixed ? percentage.toFixed(2) : percentage}%
        </p>

        {certificateUrl && (
          <div className="mt-3">
            <a
              href={`https://mcq-back.onrender.com${certificateUrl}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded text-base sm:text-lg md:text-xl inline-block"
            >
              Download Certificate
            </a>
          </div>
        )}

        <div className="mt-4 space-x-2">
          {proceedToNextStep && step < 3 && (
            <button
              onClick={handleProceedNext}
              className="px-4 py-2 bg-green-600 text-white rounded text-base sm:text-lg md:text-xl"
            >
              Proceed to Step {step + 1}
            </button>
          )}
          <button
            onClick={() => {
              setStep(1);
              setExamStarted(false);
            }}
            className="px-4 py-2 bg-gray-300 rounded text-base sm:text-lg md:text-xl"
          >
            Back to Step 1
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const lockedThis = locked[currentQ._id] === true;
  const currentTimer = timers[currentQ._id] ?? SECONDS_PER_QUESTION;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-20">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-xs sm:text-sm md:text-base">Step {step}</div>
          <div className="text-lg sm:text-xl md:text-2xl font-bold">
            Question {currentIndex + 1} / {questions.length}
          </div>
        </div>
        <div className="text-right">
          <div className="text-base sm:text-lg md:text-xl">
            Timer:{" "}
            <strong>
              {currentTimer > 0
                ? `${String(Math.floor(currentTimer / 60)).padStart(
                    2,
                    "0"
                  )}:${String(currentTimer % 60).padStart(2, "0")}`
                : "00:00"}
            </strong>
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
            Per-question timer
          </div>
        </div>
      </div>

      <div className="mb-4 p-4 border rounded">
        <div
          className={`mb-3 font-semibold text-base sm:text-lg md:text-xl ${
            lockedThis ? "text-gray-400" : ""
          }`}
        >
          {currentQ.questionText}
        </div>
        <div className="space-y-2 text-base sm:text-lg md:text-xl">
          {currentQ.options.map((opt, i) => {
            const selected = answers[currentQ._id] === i;
            return (
              <label
                key={i}
                className={`block p-3 border rounded cursor-pointer ${
                  selected ? "border-blue-500 bg-blue-50" : "border-gray-200"
                } ${lockedThis ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <input
                  type="radio"
                  name={currentQ._id}
                  checked={selected}
                  onChange={() => handleSelect(currentQ._id, i)}
                  disabled={lockedThis}
                  className="mr-2"
                />
                {opt}
              </label>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-3 py-2 bg-gray-200 rounded mr-2 text-base sm:text-lg md:text-xl"
          >
            Prev
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === questions.length - 1}
            className="px-3 py-2 bg-gray-200 rounded text-base sm:text-lg md:text-xl"
          >
            Next
          </button>
        </div>

        <div className="space-x-2">
          <button
            onClick={() => {
              if (questionTimerRef.current) {
                clearInterval(questionTimerRef.current);
                questionTimerRef.current = null;
              }
              setExamStarted(false);
            }}
            className="px-3 py-2 bg-yellow-500 text-white rounded text-base sm:text-lg md:text-xl"
          >
            Restart Exam
          </button>
          <button
            onClick={async () => {
              await handleSubmit(false);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded text-base sm:text-lg md:text-xl"
          >
            Submit
          </button>
        </div>
      </div>

      <div className="mt-4 text-sm sm:text-base md:text-lg text-gray-600">
        <div>
          Note: Each question has {SECONDS_PER_QUESTION} seconds. When time is
          up or answer selected, the question locks and you move to the next
          question automatically. Auto-submit on last question timer end.
        </div>
      </div>
    </div>
  );
}
