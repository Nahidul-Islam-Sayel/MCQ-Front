import { skipToken } from "@reduxjs/toolkit/query/react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import type { Question } from "../../src/redux/api";
import {
  useAddQuestionMutation,
  useDeleteQuestionMutation,
  useGetQuestionsQuery,
  useUpdateQuestionMutation,
} from "../../src/redux/api"; // Adjust path accordingly

const MySwal = withReactContent(Swal);

const ASSESSMENT_FLOW = [
  { step: 1, level: "A1", passRange: "25–49.99%", certified: "A1 certified" },
  { step: 1, level: "A2", passRange: "50–74.99%", certified: "A2 certified" },
  { step: 2, level: "B1", passRange: "25–49.99%", certified: "B1 certified" },
  { step: 2, level: "B2", passRange: "50–74.99%", certified: "B2 certified" },
  { step: 3, level: "C1", passRange: "25–49.99%", certified: "C1 certified" },
  { step: 3, level: "C2", passRange: "≥50%", certified: "C2 certified" },
];

export default function CertificationSetupWithAPI() {
  // View selection states
  const [viewStep, setViewStep] = useState<number | null>(null);
  const [viewLevel, setViewLevel] = useState<string | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [modalLevel, setModalLevel] = useState("A1");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);

  // For count map caching counts for step-level
  const [countMap, setCountMap] = useState<Record<string, number>>({});

  // Helper to build key
  const keyFor = (step: number, level: string) => `${step}-${level}`;

  // Queries and mutations
  // Fetch questions for viewStep & viewLevel
  const {
    data: questions = [],
    refetch: refetchQuestions,
    isFetching: loadingQuestions,
  } = useGetQuestionsQuery(
    viewStep && viewLevel ? { step: viewStep, level: viewLevel } : skipToken,
    { skip: !viewStep || !viewLevel }
  );

  // Fetch count for each step/level, we call fetchAllCounts to update countMap
  const fetchAllCounts = async () => {
    try {
      const counts: Record<string, number> = {};
      await Promise.all(
        ASSESSMENT_FLOW.map(async (item) => {
          // Using fetch manually because RTK Query can't be used outside hooks here
          const resp = await fetch(
            `https://mcq-back.onrender.com/AdminAddQuestion/count?step=${item.step}&level=${item.level}`
          );
          if (!resp.ok) {
            counts[keyFor(item.step, item.level)] = 0;
          } else {
            const data = await resp.json();
            counts[keyFor(item.step, item.level)] = data.count ?? 0;
          }
        })
      );
      setCountMap(counts);
    } catch (e) {
      MySwal.fire("Error", "Failed to fetch counts", "error");
    }
  };

  useEffect(() => {
    fetchAllCounts();
  }, []);

  // Use RTK Query mutation hooks
  const [addQuestion, { isLoading: adding }] = useAddQuestionMutation();
  const [updateQuestion, { isLoading: updating }] = useUpdateQuestionMutation();
  const [deleteQuestion, { isLoading: deleting }] = useDeleteQuestionMutation();

  // Open add modal with reset form
  const openAddModal = (step: number, level: string) => {
    const cnt = countMap[keyFor(step, level)] ?? 0;
    if (cnt >= 22) {
      MySwal.fire(
        "Limit reached",
        `Cannot add more than 22 questions for Step ${step} ${level}`,
        "warning"
      );
      return;
    }
    setModalStep(step);
    setModalLevel(level);
    setEditingId(null);
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectOptionIndex(0);
    setShowModal(true);
  };

  // Open edit modal with prefilled data
  const openEditModal = (q: Question) => {
    setModalStep(q.step);
    setModalLevel(q.level);
    setEditingId(q._id || null);
    setQuestionText(q.questionText);
    setOptions(q.options.slice());
    setCorrectOptionIndex(q.correctOptionIndex);
    setShowModal(true);
  };

  // Save question handler
  const saveQuestion = async () => {
    if (!questionText.trim()) {
      return MySwal.fire("Validation Error", "Enter question text", "warning");
    }
    if (options.some((o) => !o.trim())) {
      return MySwal.fire("Validation Error", "Fill all options", "warning");
    }

    const payload = {
      step: modalStep,
      level: modalLevel,
      questionText,
      options,
      correctOptionIndex,
    };

    try {
      if (editingId) {
        await updateQuestion({ id: editingId, data: payload }).unwrap();
        MySwal.fire("Success", "Question updated successfully", "success");
      } else {
        await addQuestion(payload).unwrap();
        MySwal.fire("Success", "Question added successfully", "success");
      }
      // refresh questions & counts
      if (viewStep === modalStep && viewLevel === modalLevel) {
        refetchQuestions();
      }
      fetchAllCounts();
      setShowModal(false);
    } catch (err: any) {
      MySwal.fire("Error", err?.data?.message || "Operation failed", "error");
    }
  };

  // Delete question handler
  const handleDelete = async (id?: string) => {
    if (!id) return;
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });
    if (result.isConfirmed) {
      try {
        await deleteQuestion(id).unwrap();
        MySwal.fire("Deleted!", "Question has been deleted.", "success");
        if (viewStep && viewLevel) refetchQuestions();
        fetchAllCounts();
      } catch (err: any) {
        MySwal.fire("Error", err?.data?.message || "Delete failed", "error");
      }
    }
  };

  // View questions handler
  const handleView = (step: number, level: string) => {
    setViewStep(step);
    setViewLevel(level);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Certification Mapping & Questions
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 border-collapse min-w-[600px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-xs sm:text-sm md:text-base">
                Step
              </th>
              <th className="border border-gray-300 p-2 text-xs sm:text-sm md:text-base">
                Level
              </th>
              <th className="border border-gray-300 p-2 text-xs sm:text-sm md:text-base">
                Score Range
              </th>
              <th className="border border-gray-300 p-2 text-xs sm:text-sm md:text-base">
                Certification
              </th>
              <th className="border border-gray-300 p-2 text-xs sm:text-sm md:text-base">
                Add Question
              </th>
              <th className="border border-gray-300 p-2 text-xs sm:text-sm md:text-base">
                View Questions
              </th>
            </tr>
          </thead>
          <tbody>
            {ASSESSMENT_FLOW.map((it) => {
              const cnt = countMap[keyFor(it.step, it.level)] ?? 0;
              const canAdd = cnt < 22;
              return (
                <tr key={`${it.step}-${it.level}`} className="text-center">
                  <td className="border border-gray-300 p-2 text-xs sm:text-sm md:text-base">
                    {it.step}
                  </td>
                  <td className="border border-gray-300 p-2 text-xs sm:text-sm md:text-base">
                    {it.level}
                  </td>
                  <td className="border border-gray-300 p-2 text-xs sm:text-sm md:text-base">
                    {it.passRange}
                  </td>
                  <td className="border border-gray-300 p-2 text-xs sm:text-sm md:text-base">
                    {it.certified}
                  </td>
                  <td className="border border-gray-300 p-2">
                    <button
                      disabled={!canAdd}
                      onClick={() => openAddModal(it.step, it.level)}
                      className={`w-full sm:w-auto px-2 sm:px-3 py-1 rounded text-white transition-colors ${
                        canAdd
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-gray-400 cursor-not-allowed"
                      } text-xs sm:text-sm md:text-base`}
                    >
                      <span className="inline sm:hidden">Add</span>
                      <span className="hidden sm:inline">Add Question</span>
                    </button>
                    <div className="text-[10px] mt-1">({cnt}/22)</div>
                  </td>
                  <td className="border border-gray-300 p-2">
                    <button
                      onClick={() => handleView(it.step, it.level)}
                      className="w-full sm:w-auto bg-green-600 text-white px-2 sm:px-3 py-1 rounded hover:bg-green-700 transition-colors text-xs sm:text-sm md:text-base"
                    >
                      <span className="inline sm:hidden">View</span>
                      <span className="hidden sm:inline">View Questions</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* View panel */}
      {viewStep && viewLevel && (
        <section className="mt-6 bg-white p-4 rounded shadow-sm overflow-x-auto">
          <h2 className="text-xl mb-3 font-semibold">
            Questions for Step {viewStep} - Level {viewLevel}
          </h2>

          {loadingQuestions ? (
            <p>Loading questions...</p>
          ) : questions.length === 0 ? (
            <p>No questions for this step & level yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 min-w-[600px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2 text-xs sm:text-sm md:text-base">
                      #
                    </th>
                    <th className="border p-2 text-xs sm:text-sm md:text-base">
                      Question
                    </th>
                    <th className="border p-2 text-xs sm:text-sm md:text-base">
                      Options
                    </th>
                    <th className="border p-2 text-xs sm:text-sm md:text-base">
                      Correct
                    </th>
                    <th className="border p-2 text-xs sm:text-sm md:text-base">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, idx) => (
                    <tr key={q._id || idx}>
                      <td className="border p-2 text-center text-xs sm:text-sm md:text-base">
                        {idx + 1}
                      </td>
                      <td className="border p-2 text-xs sm:text-sm md:text-base">
                        {q.questionText}
                      </td>
                      <td className="border p-2 text-xs sm:text-sm md:text-base">
                        <ol className="list-decimal list-inside">
                          {q.options.map((o, i) => (
                            <li
                              key={i}
                              className={
                                i === q.correctOptionIndex
                                  ? "font-bold text-green-600"
                                  : ""
                              }
                            >
                              {o}
                            </li>
                          ))}
                        </ol>
                      </td>
                      <td className="border p-2 text-center text-xs sm:text-sm md:text-base">
                        Option {q.correctOptionIndex + 1}
                      </td>
                      <td className="border p-2 text-center space-x-2 text-xs sm:text-sm md:text-base">
                        <button
                          onClick={() => openEditModal(q)}
                          className="bg-yellow-500 px-2 py-1 rounded hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(q._id)}
                          className="bg-red-600 px-2 py-1 rounded hover:bg-red-700 text-white"
                          disabled={deleting}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-3">
            <button
              onClick={() => {
                setViewStep(null);
                setViewLevel(null);
              }}
              className="bg-gray-400 px-3 py-1 rounded hover:bg-gray-500 text-xs sm:text-sm md:text-base"
            >
              Close
            </button>
          </div>
        </section>
      )}

      {/* modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded max-w-xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-3 top-2 text-2xl"
              aria-label="Close modal"
            >
              &times;
            </button>
            <h3 className="text-xl mb-3">
              {editingId ? "Edit" : "Add"} Question — Step {modalStep}{" "}
              {modalLevel}
            </h3>

            <label className="block mb-2">
              <div className="font-semibold">Question</div>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows={3}
                className="w-full border rounded p-2"
              />
            </label>

            {options.map((opt, i) => (
              <label key={i} className="block mb-2">
                <div>Option {i + 1}</div>
                <input
                  value={opt}
                  onChange={(e) =>
                    setOptions((p) => {
                      const copy = [...p];
                      copy[i] = e.target.value;
                      return copy;
                    })
                  }
                  className="w-full border rounded p-2"
                />
              </label>
            ))}

            <label className="block mb-4">
              <div className="font-semibold">Correct Option</div>
              <select
                value={correctOptionIndex}
                onChange={(e) => setCorrectOptionIndex(Number(e.target.value))}
                className="border rounded p-2"
              >
                {[0, 1, 2, 3].map((i) => (
                  <option key={i} value={i}>
                    Option {i + 1}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                disabled={adding || updating}
              >
                Cancel
              </button>
              <button
                onClick={saveQuestion}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                disabled={adding || updating}
              >
                {editingId ? "Update" : "Add"} Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
