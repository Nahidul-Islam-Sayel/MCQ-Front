import { ChangeEvent, useEffect, useState } from "react";

interface Visit {
  ip: string;
  country: string;
  city: string;
  timestamp: string;
}

const Analysis: React.FC = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<Visit[]>([]);
  const [countryStats, setCountryStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Filter states
  const [filterNumber, setFilterNumber] = useState<string>("");
  const [filterUnit, setFilterUnit] = useState<
    "hours" | "days" | "weeks" | "months" | "years"
  >("days");
  const [searchCountry, setSearchCountry] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5000/SingUpAdmin/visits")
      .then((res) => res.json())
      .then((data: Visit[]) => {
        setVisits(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch visits:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    filterData();
    setCurrentPage(1); // Reset page when filter changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visits, filterNumber, filterUnit, searchCountry]);

  const filterData = () => {
    const now = new Date();

    let msFilter = Infinity;
    if (
      filterNumber &&
      !isNaN(Number(filterNumber)) &&
      Number(filterNumber) > 0
    ) {
      const n = Number(filterNumber);
      switch (filterUnit) {
        case "hours":
          msFilter = n * 60 * 60 * 1000;
          break;
        case "days":
          msFilter = n * 24 * 60 * 60 * 1000;
          break;
        case "weeks":
          msFilter = n * 7 * 24 * 60 * 60 * 1000;
          break;
        case "months":
          msFilter = n * 30 * 24 * 60 * 60 * 1000; // Approximate
          break;
        case "years":
          msFilter = n * 365 * 24 * 60 * 60 * 1000; // Approximate
          break;
      }
    }

    const filtered = visits.filter((visit) => {
      const visitTime = new Date(visit.timestamp);
      const diff = now.getTime() - visitTime.getTime();

      const isInTimeRange = diff <= msFilter;
      const matchesCountry = searchCountry
        ? visit.country.toLowerCase().includes(searchCountry.toLowerCase())
        : true;

      return isInTimeRange && matchesCountry;
    });

    setFilteredVisits(filtered);

    const stats: Record<string, number> = {};
    filtered.forEach((visit) => {
      stats[visit.country] = (stats[visit.country] || 0) + 1;
    });
    setCountryStats(stats);
  };

  const uniqueVisitors = new Set(filteredVisits.map((v) => v.ip)).size;

  const handleFilterNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilterNumber(e.target.value);
  };
  const handleFilterUnitChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilterUnit(e.target.value as typeof filterUnit);
  };
  const handleSearchCountryChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchCountry(e.target.value);
  };

  // Pagination handlers
  const totalPages = Math.ceil(filteredVisits.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentVisits = filteredVisits.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const goToPrevious = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  const goToNext = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 bg-white rounded-xl shadow-md max-w-full mx-auto">
      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-gray-800">
        Visitor Analysis
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 sm:gap-4 mb-6 items-center">
        <input
          type="number"
          min={0}
          placeholder="Enter number"
          value={filterNumber}
          onChange={handleFilterNumberChange}
          className="
            p-2 border rounded text-sm sm:text-base
            w-full max-w-[140px] sm:max-w-[100px] md:max-w-[110px] lg:max-w-[130px]"
        />

        <select
          className="p-2 border rounded text-sm sm:text-base max-w-[110px]"
          value={filterUnit}
          onChange={handleFilterUnitChange}
        >
          <option value="hours">Hours</option>
          <option value="days">Days</option>
          <option value="weeks">Weeks</option>
          <option value="months">Months</option>
          <option value="years">Years</option>
        </select>

        <input
          type="text"
          placeholder="Search by country..."
          className="
            p-2 border rounded text-sm sm:text-base
            flex-grow min-w-[150px]
            max-w-full md:max-w-[300px] lg:max-w-[200px]"
          onChange={handleSearchCountryChange}
          value={searchCountry}
        />
      </div>

      {loading ? (
        <p className="text-center text-gray-600 text-lg py-10">Loading...</p>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6">
            <div className="bg-blue-100 p-4 rounded-lg shadow text-center">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-blue-700">
                Total Visits
              </h3>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold">
                {filteredVisits.length}
              </p>
            </div>

            <div className="bg-yellow-100 p-4 rounded-lg shadow text-center">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-yellow-700">
                Unique Visitors
              </h3>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold">
                {uniqueVisitors}
              </p>
            </div>

            <div className="bg-green-100 p-4 rounded-lg shadow text-center">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-green-700">
                Unique Countries
              </h3>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold">
                {Object.keys(countryStats).length}
              </p>
            </div>

            <div className="bg-purple-100 p-4 rounded-lg shadow text-center">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-purple-700">
                Top Country
              </h3>
              <p className="text-xl sm:text-2xl md:text-3xl font-semibold">
                {Object.entries(countryStats).sort(
                  (a, b) => b[1] - a[1]
                )[0]?.[0] || "N/A"}
              </p>
            </div>
          </div>

          {/* Table */}
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 text-gray-700">
            Recent Visitors
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm sm:text-base border">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-2 sm:p-3 border">IP</th>
                  <th className="p-2 sm:p-3 border">Country</th>
                  <th className="p-2 sm:p-3 border">City</th>
                  <th className="p-2 sm:p-3 border">Time</th>
                </tr>
              </thead>
              <tbody>
                {currentVisits.length === 0 ? (
                  <tr>
                    <td className="p-3 text-center" colSpan={4}>
                      No data available.
                    </td>
                  </tr>
                ) : (
                  currentVisits.map((visit, index) => (
                    <tr
                      key={startIndex + index}
                      className="border-b hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="p-2 sm:p-3 border break-words">
                        {visit.ip}
                      </td>
                      <td className="p-2 sm:p-3 border break-words">
                        {visit.country}
                      </td>
                      <td className="p-2 sm:p-3 border break-words">
                        {visit.city}
                      </td>
                      <td className="p-2 sm:p-3 border break-words">
                        {new Date(visit.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {filteredVisits.length > itemsPerPage && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                onClick={goToPrevious}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded ${
                  currentPage === 1
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                Previous
              </button>

              <span className="text-gray-700 font-semibold">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={goToNext}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded ${
                  currentPage === totalPages
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Analysis;
