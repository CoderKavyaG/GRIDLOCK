import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import PageSkeleton from "../../components/PageSkeleton";

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("pending"); // pending, resolved
  const [updating, setUpdating] = useState(null); // report id being updated

  const loadReports = async () => {
    setLoading(true);
    setError("");

    try {
      const q = query(
        collection(db, "reports"),
        where("status", "==", filter),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      const list = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setReports(list);
    } catch (err) {
      console.error("Load reports error:", err);
      setError("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [filter]);

  const updateStatus = async (reportId, newStatus) => {
    setUpdating(reportId);
    try {
      await updateDoc(doc(db, "reports", reportId), {
        status: newStatus,
        resolvedAt: new Date().toISOString()
      });
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (err) {
      console.error("Update report status error:", err);
      setError("Failed to update report status.");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[22px] font-syne font-bold text-white">Reports Queue</h2>
        <p className="text-[#777] mt-2">Review and manage user-submitted reports.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-600 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            filter === "pending"
              ? "bg-[var(--accent)] text-black"
              : "border border-[#333] text-[#ccc] hover:bg-[#111]"
          }`}
        >
          Pending ({reports.filter(r => r.status === "pending").length})
        </button>
        <button
          onClick={() => setFilter("resolved")}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            filter === "resolved"
              ? "bg-[var(--accent)] text-black"
              : "border border-[#333] text-[#ccc] hover:bg-[#111]"
          }`}
        >
          Resolved
        </button>
      </div>

      <div className="rounded-2xl border border-[#222] bg-[#0e0e0e] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[#222]">
              <tr className="text-left">
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">Report</th>
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">Reporter</th>
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">Target</th>
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">Reason</th>
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">Date</th>
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-b border-[#1a1a1a] last:border-b-0">
                  <td className="px-6 py-4 max-w-xs">
                    <div className="text-sm text-[#ccc] line-clamp-2">
                      {report.details || "No additional details"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">@{report.reporterUsername}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-semibold text-white capitalize">{report.targetType}</div>
                      <div className="text-[#666]">@{report.targetUsername}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#ccc]">{report.reason}</td>
                  <td className="px-6 py-4 text-[#ccc] text-sm">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {filter === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateStatus(report.id, "resolved")}
                          disabled={updating === report.id}
                          className="text-xs px-3 py-1 rounded border border-green-600 text-green-200 hover:bg-green-950 transition-colors disabled:opacity-50"
                        >
                          {updating === report.id ? "..." : "Resolve"}
                        </button>
                        <button
                          onClick={() => updateStatus(report.id, "dismissed")}
                          disabled={updating === report.id}
                          className="text-xs px-3 py-1 rounded border border-gray-600 text-gray-200 hover:bg-gray-950 transition-colors disabled:opacity-50"
                        >
                          {updating === report.id ? "..." : "Dismiss"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && <PageSkeleton />}

        {!loading && reports.length === 0 && (
          <div className="p-12 text-center text-[#666]">
            No {filter} reports found.
          </div>
        )}
      </div>
    </div>
  );
}

