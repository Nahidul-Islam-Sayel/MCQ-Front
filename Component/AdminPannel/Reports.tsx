import React, { useEffect, useState } from "react";

interface Result {
  _id: string;
  userId?: string | null;
  name: string;
  email?: string | null;
  step: number;
  level: string;
  score: number;
  total: number;
  percentage: number;
  certification: string;
  certificateUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

const AdminResultsReport: React.FC = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;

  useEffect(() => {
    fetch("https://mcq-back.onrender.com/StudentsExam/all-results")
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setResults(data.results || []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load results");
        setLoading(false);
        console.error(err);
      });
  }, []);

  // Calculate indexes for current page results
  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = results.slice(indexOfFirstResult, indexOfLastResult);

  const totalPages = Math.ceil(results.length / resultsPerPage);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  if (loading) return <div>Loading results...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-white rounded shadow overflow-x-auto">
      <h1 className="text-3xl font-semibold mb-6">Student Results Report</h1>

      {results.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <>
          <table className="min-w-full border-collapse border border-gray-300 text-left text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">Name</th>
                <th className="border border-gray-300 p-2">Step</th>
                <th className="border border-gray-300 p-2">Level</th>
                <th className="border border-gray-300 p-2">Score</th>
                <th className="border border-gray-300 p-2">Total</th>
                <th className="border border-gray-300 p-2">Percentage</th>
                <th className="border border-gray-300 p-2">Certification</th>
                <th className="border border-gray-300 p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {currentResults.map((r) => (
                <tr
                  key={r._id}
                  className="hover:bg-gray-50 border border-gray-300"
                >
                  <td className="border border-gray-300 p-2">{r.name}</td>
                  <td className="border border-gray-300 p-2">{r.step}</td>
                  <td className="border border-gray-300 p-2">{r.level}</td>
                  <td className="border border-gray-300 p-2">{r.score}</td>
                  <td className="border border-gray-300 p-2">{r.total}</td>
                  <td className="border border-gray-300 p-2">
                    {r.percentage.toFixed(2)}%
                  </td>
                  <td className="border border-gray-300 p-2">
                    {r.certification}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded ${
                currentPage === 1
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Previous
            </button>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded ${
                currentPage === totalPages
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminResultsReport;
