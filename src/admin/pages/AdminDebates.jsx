import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, startAfter, getDocs, deleteDoc, doc, where } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import PageSkeleton from "../../components/PageSkeleton";

const DEBATES_PER_PAGE = 20;

export default function AdminDebates() {
  const [debates, setDebates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [deleting, setDeleting] = useState(null); // debate id being deleted

  const loadDebates = async (reset = false) => {
    setLoading(true);
    setError("");

    try {
      let q;
      if (searchTerm.trim()) {
        // Search by title (case-insensitive prefix)
        q = query(
          collection(db, "debates"),
          where("title", ">=", searchTerm.toLowerCase()),
          where("title", "<=", searchTerm.toLowerCase() + "\uf8ff"),
          orderBy("title"),
          limit(DEBATES_PER_PAGE)
        );
      } else {
        q = query(
          collection(db, "debates"),
          orderBy("createdAt", "desc"),
          limit(DEBATES_PER_PAGE)
        );
        if (!reset && lastDoc) {
          q = query(q, startAfter(lastDoc));
        }
      }

      const snapshot = await getDocs(q);
      const list = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));

      if (reset) {
        setDebates(list);
      } else {
        setDebates((prev) => [...prev, ...list]);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(list.length === DEBATES_PER_PAGE);
    } catch (err) {
      console.error("Load debates error:", err);
      setError("Failed to load debates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDebates(true);
  }, [searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadDebates(true);
  };

  const deleteDebate = async (debateId) => {
    if (!confirm("Are you sure you want to delete this debate?")) return;

    setDeleting(debateId);
    try {
      await deleteDoc(doc(db, "debates", debateId));
      setDebates((prev) => prev.filter((d) => d.id !== debateId));
    } catch (err) {
      console.error("Delete debate error:", err);
      setError("Failed to delete debate.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[22px] font-syne font-bold text-white">Debate Moderation</h2>
        <p className="text-[#777] mt-2">Manage and moderate user debates.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-600 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          placeholder="Search by debate title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 rounded-lg border border-[#333] bg-[#0e0e0e] px-4 py-2 text-white placeholder-[#666] focus:border-[var(--accent)] focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-[var(--accent)] px-6 py-2 font-semibold text-black hover:bg-[var(--accent-hover)] transition-colors"
        >
          Search
        </button>
      </form>

      <div className="rounded-2xl border border-[#222] bg-[#0e0e0e] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[#222]">
              <tr className="text-left">
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">Debate</th>
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">Creator</th>
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">Sides</th>
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">Votes</th>
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">Date</th>
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {debates.map((debate) => (
                <tr key={debate.id} className="border-b border-[#1a1a1a] last:border-b-0">
                  <td className="px-6 py-4 max-w-xs">
                    <div>
                      <div className="font-semibold text-white line-clamp-1">{debate.title}</div>
                      <p className="text-sm text-[#666] line-clamp-2 mt-1">
                        {debate.description || "(No description)"}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">@{debate.creatorUsername}</div>
                  </td>
                  <td className="px-6 py-4 text-[#ccc]">
                    {debate.sideA} vs {debate.sideB}
                  </td>
                  <td className="px-6 py-4 text-[#ccc]">
                    {debate.votesA || 0} - {debate.votesB || 0}
                  </td>
                  <td className="px-6 py-4 text-[#ccc] text-sm">
                    {new Date(debate.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => deleteDebate(debate.id)}
                      disabled={deleting === debate.id}
                      className="text-xs px-3 py-1 rounded border border-red-600 text-red-200 hover:bg-red-950 transition-colors disabled:opacity-50"
                    >
                      {deleting === debate.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && <PageSkeleton />}

        {!loading && hasMore && !searchTerm && (
          <div className="p-6 text-center">
            <button
              onClick={() => loadDebates()}
              className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-semibold"
            >
              Load more debates
            </button>
          </div>
        )}

        {!loading && debates.length === 0 && (
          <div className="p-12 text-center text-[#666]">
            {searchTerm ? "No debates found matching your search." : "No debates found."}
          </div>
        )}
      </div>
    </div>
  );
}

