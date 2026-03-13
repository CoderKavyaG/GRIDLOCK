import { useEffect, useState } from "react";
import { collection, getCountFromServer, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import PageSkeleton from "../../components/PageSkeleton";

const STAT_CARDS = [
  { key: "users", label: "Total users", description: "Registered accounts" },
  { key: "reviews", label: "Total reviews", description: "Community takes" },
  { key: "debates", label: "Total debates", description: "Active debates" },
  { key: "collections", label: "Total collections", description: "Saved game sets" }
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [usersSnap, reviewsSnap, debatesSnap, collectionsSnap] = await Promise.all([
          getCountFromServer(collection(db, "users")),
          getCountFromServer(collection(db, "reviews")),
          getCountFromServer(collection(db, "debates")),
          getCountFromServer(collection(db, "collections"))
        ]);

        setStats({
          users: usersSnap.data().count,
          reviews: reviewsSnap.data().count,
          debates: debatesSnap.data().count,
          collections: collectionsSnap.data().count
        });

        const recentReviewRef = query(collection(db, "reviews"), orderBy("createdAt", "desc"), limit(5));
        const recentSnap = await getDocs(recentReviewRef);
        const list = [];
        recentSnap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
        setRecentReviews(list);
      } catch (err) {
        console.error("Admin dashboard load error:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-[22px] font-syne font-bold text-white">Admin Dashboard</h2>
        <p className="text-[#777] mt-2">Quick stats and recent community activity.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-600 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <div key={card.key} className="rounded-2xl border border-[#222] bg-[#0e0e0e] p-6">
            <div className="text-[11px] font-[900] uppercase tracking-widest text-[#888]">{card.label}</div>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <div className="text-[38px] font-syne font-black text-white">
                  {stats?.[card.key] ?? "—"}
                </div>
                <div className="text-[12px] text-[#666] mt-1">{card.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#222] bg-[#0e0e0e] p-6">
        <h3 className="text-[18px] font-bold text-white">Recent reviews</h3>
        <p className="text-[#777] text-sm mt-1">Last 5 reviews posted to the community.</p>

        {recentReviews.length === 0 ? (
          <div className="mt-8 text-center text-[#666]">No recent reviews found.</div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4">
            {recentReviews.map((review) => (
              <div key={review.id} className="flex flex-col gap-2 rounded-xl border border-[#222] bg-[#121212] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-white">@{review.username}</div>
                    <div className="text-xs text-[#666]">
                      {new Date(review.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <span className="text-[11px] font-[900] uppercase tracking-widest text-[#bbb]">
                    {review.verdict}
                  </span>
                </div>
                <div className="text-sm text-[#ccc] line-clamp-2">{review.reviewText || "(No text)"}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
