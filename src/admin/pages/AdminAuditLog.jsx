import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, startAfter, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import PageSkeleton from "../../components/PageSkeleton";

const LOGS_PER_PAGE = 50;

export default function AdminAuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const loadLogs = async (reset = false) => {
    setLoading(true);
    setError("");

    try {
      const q = query(
        collection(db, "audit"),
        orderBy("timestamp", "desc"),
        limit(LOGS_PER_PAGE)
      );

      if (!reset && lastDoc) {
        const nextQ = query(q, startAfter(lastDoc));
        const snapshot = await getDocs(nextQ);
        const list = [];
        snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
        setLogs((prev) => [...prev, ...list]);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(list.length === LOGS_PER_PAGE);
      } else {
        const snapshot = await getDocs(q);
        const list = [];
        snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
        setLogs(list);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(list.length === LOGS_PER_PAGE);
      }
    } catch (err) {
      console.error("Load audit logs error:", err);
      setError("Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(true);
  }, []);

  const getActionColor = (action) => {
    if (action.includes("ban") || action.includes("delete")) return "text-red-200";
    if (action.includes("unban") || action.includes("activate")) return "text-green-200";
    if (action.includes("admin")) return "text-purple-200";
    return "text-blue-200";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[22px] font-syne font-bold text-white">Audit Log</h2>
        <p className="text-[#777] mt-2">Record of all administrative actions.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-600 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-[#222] bg-[#0e0e0e] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[#222]">
              <tr className="text-left">
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">Action</th>
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">Admin</th>
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">Target</th>
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">Details</th>
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-[#1a1a1a] last:border-b-0">
                  <td className="px-6 py-4">
                    <span className={`text-sm font-semibold ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">@{log.adminUsername}</div>
                  </td>
                  <td className="px-6 py-4 text-[#ccc]">{log.targetType}: {log.targetId}</td>
                  <td className="px-6 py-4 text-[#ccc] text-sm max-w-xs truncate">
                    {log.details || "—"}
                  </td>
                  <td className="px-6 py-4 text-[#ccc] text-sm">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && <PageSkeleton />}

        {!loading && hasMore && (
          <div className="p-6 text-center">
            <button
              onClick={() => loadLogs()}
              className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-semibold"
            >
              Load more logs
            </button>
          </div>
        )}

        {!loading && logs.length === 0 && (
          <div className="p-12 text-center text-[#666]">
            No audit logs found. Admin actions will appear here.
          </div>
        )}
      </div>
    </div>
  );
}

