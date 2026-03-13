import { useState, useEffect } from "react";
import { collection, query, where, orderBy, limit, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import EmptyState from "../components/EmptyState";
import { FaHeart, FaComment, FaShare } from "react-icons/fa";

const VERDICT_COLORS = {
  mustPlay: "var(--accent-green)",
  goodEnough: "var(--accent-yellow)",
  skipIt: "var(--accent-red)",
  masterpiece: "var(--accent-purple)"
};

export default function Feed() {
  const { user } = useAuth();
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadFeed = async () => {
      setLoading(true);
      setError("");

      try {
        // Get users I follow
        const followsRef = collection(db, "follows");
        const followsQ = query(followsRef, where("followerId", "==", user.uid));
        const followsSnap = await getDocs(followsQ);

        if (followsSnap.empty) {
          setFeedItems([]);
          setLoading(false);
          return;
        }

        const followingIds = followsSnap.docs.map(d => d.data().followingId);

        // Get recent reviews from followed users
        const reviewsRef = collection(db, "reviews");
        const reviewsQ = query(
          reviewsRef,
          where("uid", "in", followingIds.slice(0, 10)), // Firestore 'in' limit is 10
          orderBy("createdAt", "desc"),
          limit(50)
        );

        const reviewsSnap = await getDocs(reviewsQ);
        const items = [];

        for (const reviewDoc of reviewsSnap.docs) {
          const review = { id: reviewDoc.id, ...reviewDoc.data() };

          // Get user info
          const userDoc = await getDoc(doc(db, "users", review.uid));
          const userData = userDoc.exists() ? userDoc.data() : {};

          items.push({
            type: "review",
            id: review.id,
            data: review,
            user: userData,
            timestamp: review.createdAt
          });
        }

        // Sort by timestamp
        items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setFeedItems(items);
      } catch (err) {
        console.error("Load feed error:", err);
        setError("Failed to load feed.");
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-[72px] flex items-center justify-center">
        <EmptyState
          icon="🔒"
          title="Sign in to see your feed"
          subtitle="Follow other gamers to see their reviews and activity."
          ctaText="Sign In"
          ctaLink="/login"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-[72px]">
      <div className="max-w-[800px] mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-syne text-[32px] font-black mb-2">Your Feed</h1>
          <p className="text-[#777]">Recent activity from people you follow.</p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-600 bg-red-950/40 px-4 py-3 text-sm text-red-200 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            {[1,2,3].map(i => (
              <div key={i} className="bg-[#111] border border-[#222] rounded-2xl p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#333] rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-[#333] rounded w-32"></div>
                    <div className="h-3 bg-[#333] rounded w-24"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-[#333] rounded w-full"></div>
                  <div className="h-4 bg-[#333] rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : feedItems.length === 0 ? (
          <EmptyState
            icon="📭"
            title="Your feed is empty"
            subtitle="Follow some gamers to see their reviews and activity here."
            ctaText="Explore Users"
            ctaLink="/explore"
          />
        ) : (
          <div className="space-y-6">
            {feedItems.map((item) => (
              <div key={`${item.type}-${item.id}`} className="bg-[#111] border border-[#222] rounded-2xl p-6 hover:border-[#333] transition-colors">
                {item.type === "review" && (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#222] border-2 border-[var(--accent)] overflow-hidden shrink-0">
                          {item.user.avatar ? (
                            <img src={item.user.avatar} alt={item.user.username} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-sm">
                              {item.user.username?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white">@{item.user.username}</div>
                          <div className="text-xs text-[#666]">
                            {new Date(item.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="w-12 h-16 rounded-lg overflow-hidden border border-[#333] shrink-0">
                        <img src={item.data.gameCover} alt={item.data.gameName} className="w-full h-full object-cover" />
                      </div>
                    </div>

                    <div className="mb-4">
                      <span
                        className="text-[11px] font-[900] uppercase tracking-widest px-2 py-1 rounded-full border"
                        style={{
                          color: VERDICT_COLORS[item.data.verdict],
                          backgroundColor: `${VERDICT_COLORS[item.data.verdict]}10`,
                          borderColor: VERDICT_COLORS[item.data.verdict]
                        }}
                      >
                        {item.data.verdict}
                      </span>
                    </div>

                    <p className="text-[#ccc] mb-4 line-clamp-3">
                      "{item.data.reviewText || "No text provided for this verdict."}"
                    </p>

                    <div className="flex items-center justify-between text-sm text-[#666]">
                      <span className="font-semibold">{item.data.gameName}</span>
                      <div className="flex gap-4">
                        <button className="flex items-center gap-1 hover:text-[var(--accent)] transition-colors">
                          <FaHeart /> 0
                        </button>
                        <button className="flex items-center gap-1 hover:text-[var(--accent)] transition-colors">
                          <FaComment /> 0
                        </button>
                        <button className="flex items-center gap-1 hover:text-[var(--accent)] transition-colors">
                          <FaShare />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}