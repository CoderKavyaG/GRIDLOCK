import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, startAfter, getDocs, deleteDoc, doc, where } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import PageSkeleton from "../../components/PageSkeleton";

const REVIEWS_PER_PAGE = 20;

const VERDICT_COLORS = {
  mustPlay: "var(--accent-green)",
  goodEnough: "var(--accent-yellow)",
  skipIt: "var(--accent-red)",
  masterpiece: "var(--accent-purple)"
};

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [deleting, setDeleting] = useState(null); // review id being deleted

  const loadReviews = async (reset = false) => {
    setLoading(true);
    setError("");

    try {
      let q;
      if (searchTerm.trim()) {
        // Search by username (case-insensitive prefix)
        q = query(
          collection(db, "reviews"),
          where("username", ">=", searchTerm.toLowerCase()),
          where("username", "<=", searchTerm.toLowerCase() + "\uf8ff"),
          orderBy("username"),
          limit(REVIEWS_PER_PAGE)
        );
      } else {
        q = query(
          collection(db, "reviews"),
          orderBy("createdAt", "desc"),
          limit(REVIEWS_PER_PAGE)
        );
        if (!reset && lastDoc) {
          q = query(q, startAfter(lastDoc));
        }
      }

      const snapshot = await getDocs(q);
      const list = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));

      if (reset) {
        setReviews(list);
      } else {
        setReviews((prev) => [...prev, ...list]);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(list.length === REVIEWS_PER_PAGE);
    } catch (err) {
      console.error("Load reviews error:", err);
      setError("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews(true);
  }, [searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadReviews(true);
  };

  const deleteReview = async (reviewId) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    setDeleting(reviewId);
    try {
      await deleteDoc(doc(db, "reviews", reviewId));
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err) {
      console.error("Delete review error:", err);
      setError("Failed to delete review.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[22px] font-syne font-bold text-white">Review Moderation</h2>
        <p className="text-[#777] mt-2">Manage and moderate user reviews.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-600 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          placeholder="Search by username..."
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
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">Review</th>
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">User</th>
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">Game</th>
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">Verdict</th>
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">Date</th>
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id} className="border-b border-[#1a1a1a] last:border-b-0">
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-sm text-[#ccc] line-clamp-2">
                      {review.reviewText || "(No text)"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">@{review.username}</div>
                  </td>
                  <td className="px-6 py-4 text-[#ccc]">{review.gameName}</td>
                  <td className="px-6 py-4">
                    <span
                      className="text-[10px] font-[900] uppercase tracking-widest px-2 py-1 rounded-full border"
                      style={{
                        color: VERDICT_COLORS[review.verdict],
                        backgroundColor: `${VERDICT_COLORS[review.verdict]}10`,
                        borderColor: VERDICT_COLORS[review.verdict]
                      }}
                    >
                      {review.verdict}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#ccc] text-sm">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => deleteReview(review.id)}
                      disabled={deleting === review.id}
                      className="text-xs px-3 py-1 rounded border border-red-600 text-red-200 hover:bg-red-950 transition-colors disabled:opacity-50"
                    >
                      {deleting === review.id ? "Deleting..." : "Delete"}
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
              onClick={() => loadReviews()}
              className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-semibold"
            >
              Load more reviews
            </button>
          </div>
        )}

        {!loading && reviews.length === 0 && (
          <div className="p-12 text-center text-[#666]">
            {searchTerm ? "No reviews found matching your search." : "No reviews found."}
          </div>
        )}
      </div>
    </div>
  );
}

