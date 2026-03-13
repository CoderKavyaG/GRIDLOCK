import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import PageSkeleton from "../../components/PageSkeleton";

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      setError("");

      try {
        const now = new Date();
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Recent signups (last 30 days)
        const recentUsersQ = query(
          collection(db, "users"),
          where("joinedAt", ">=", last30Days.toISOString()),
          orderBy("joinedAt", "desc")
        );
        const recentUsersSnap = await getDocs(recentUsersQ);
        const recentUsers = recentUsersSnap.size;

        // Recent reviews (last 7 days)
        const recentReviewsQ = query(
          collection(db, "reviews"),
          where("createdAt", ">=", last7Days.toISOString()),
          orderBy("createdAt", "desc")
        );
        const recentReviewsSnap = await getDocs(recentReviewsQ);
        const recentReviews = recentReviewsSnap.size;

        // Recent debates (last 7 days)
        const recentDebatesQ = query(
          collection(db, "debates"),
          where("createdAt", ">=", last7Days.toISOString()),
          orderBy("createdAt", "desc")
        );
        const recentDebatesSnap = await getDocs(recentDebatesQ);
        const recentDebates = recentDebatesSnap.size;

        // Top verdicts
        const allReviewsQ = query(collection(db, "reviews"));
        const allReviewsSnap = await getDocs(allReviewsQ);
        const verdictCounts = { mustPlay: 0, goodEnough: 0, skipIt: 0, masterpiece: 0 };
        allReviewsSnap.forEach(doc => {
          const v = doc.data().verdict;
          if (verdictCounts[v] !== undefined) verdictCounts[v]++;
        });

        setAnalytics({
          recentUsers,
          recentReviews,
          recentDebates,
          verdictCounts,
          totalReviews: allReviewsSnap.size
        });
      } catch (err) {
        console.error("Analytics load error:", err);
        setError("Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[22px] font-syne font-bold text-white">Platform Analytics</h2>
        <p className="text-[#777] mt-2">Key metrics and trends for the platform.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-600 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-[#222] bg-[#0e0e0e] p-6">
          <div className="text-[11px] font-[900] uppercase tracking-widest text-[#888] mb-2">New Users (30d)</div>
          <div className="text-[32px] font-syne font-black text-white">{analytics?.recentUsers ?? 0}</div>
          <div className="text-[12px] text-[#666] mt-1">Recent signups</div>
        </div>

        <div className="rounded-2xl border border-[#222] bg-[#0e0e0e] p-6">
          <div className="text-[11px] font-[900] uppercase tracking-widest text-[#888] mb-2">Reviews (7d)</div>
          <div className="text-[32px] font-syne font-black text-white">{analytics?.recentReviews ?? 0}</div>
          <div className="text-[12px] text-[#666] mt-1">Recent activity</div>
        </div>

        <div className="rounded-2xl border border-[#222] bg-[#0e0e0e] p-6">
          <div className="text-[11px] font-[900] uppercase tracking-widest text-[#888] mb-2">Debates (7d)</div>
          <div className="text-[32px] font-syne font-black text-white">{analytics?.recentDebates ?? 0}</div>
          <div className="text-[12px] text-[#666] mt-1">Recent discussions</div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#222] bg-[#0e0e0e] p-6">
        <h3 className="text-[18px] font-bold text-white mb-4">Verdict Distribution</h3>
        <p className="text-[#777] text-sm mb-6">How users rate games across {analytics?.totalReviews ?? 0} reviews.</p>

        <div className="space-y-4">
          {Object.entries(analytics?.verdictCounts ?? {}).map(([verdict, count]) => {
            const percentage = analytics?.totalReviews > 0 ? Math.round((count / analytics.totalReviews) * 100) : 0;
            const colors = {
              mustPlay: "#10b981",
              goodEnough: "#f59e0b",
              skipIt: "#ef4444",
              masterpiece: "#8b5cf6"
            };

            return (
              <div key={verdict} className="flex items-center gap-4">
                <div className="w-24 text-sm font-semibold text-white capitalize">{verdict}</div>
                <div className="flex-1 bg-[#222] rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: colors[verdict]
                    }}
                  />
                </div>
                <div className="w-16 text-right text-sm text-[#ccc]">{count} ({percentage}%)</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

