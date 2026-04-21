import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs, getCountFromServer } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";

const VERDICT_COLORS = {
  mustPlay: "var(--accent-green)",
  goodEnough: "var(--accent-yellow)",
  skipIt: "var(--accent-red)",
  masterpiece: "var(--accent-purple)"
};

export default function Leaderboard() {
  const [topReviewers, setTopReviewers] = useState([]);
  const [topGames, setTopGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("reviewers");

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      setError("");

      try {
        // Top reviewers by review count
        const reviewsRef = collection(db, "reviews");
        const reviewsSnap = await getDocs(reviewsRef);

        const reviewerCounts = {};
        const gameVerdicts = {};

        reviewsSnap.forEach((doc) => {
          const data = doc.data();
          const uid = data.uid;
          const username = data.username;
          const gameId = data.gameId;
          const verdict = data.verdict;

          // Count reviews per user
          if (!reviewerCounts[uid]) {
            reviewerCounts[uid] = { username, count: 0, verdicts: {} };
          }
          reviewerCounts[uid].count++;
          if (!reviewerCounts[uid].verdicts[verdict]) {
            reviewerCounts[uid].verdicts[verdict] = 0;
          }
          reviewerCounts[uid].verdicts[verdict]++;

          // Count verdicts per game
          if (!gameVerdicts[gameId]) {
            gameVerdicts[gameId] = {
              gameName: data.gameName,
              gameCover: data.gameCover,
              verdicts: {}
            };
          }
          if (!gameVerdicts[gameId].verdicts[verdict]) {
            gameVerdicts[gameId].verdicts[verdict] = 0;
          }
          gameVerdicts[gameId].verdicts[verdict]++;
        });

        // Sort reviewers by count
        const sortedReviewers = Object.entries(reviewerCounts)
          .map(([uid, data]) => ({ uid, ...data }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setTopReviewers(sortedReviewers);

        // Sort games by total reviews
        const sortedGames = Object.entries(gameVerdicts)
          .map(([gameId, data]) => ({
            gameId,
            ...data,
            totalReviews: Object.values(data.verdicts).reduce((sum, count) => sum + count, 0)
          }))
          .sort((a, b) => b.totalReviews - a.totalReviews)
          .slice(0, 10);

        setTopGames(sortedGames);
      } catch (err) {
        console.error("Leaderboard load error:", err);
        setError("Failed to load leaderboard.");
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-[72px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-[72px]">
      <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-syne text-[32px] font-black mb-2">Leaderboard</h1>
          <p className="text-[#777]">Top contributors and most reviewed games.</p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-600 bg-red-950/40 px-4 py-3 text-sm text-red-200 mb-6">
            {error}
          </div>
        )}

        <div className="mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("reviewers")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === "reviewers"
                  ? "bg-[var(--accent)] text-black"
                  : "border border-[#333] text-[#ccc] hover:bg-[#111]"
              }`}
            >
              Top Reviewers
            </button>
            <button
              onClick={() => setActiveTab("games")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === "games"
                  ? "bg-[var(--accent)] text-black"
                  : "border border-[#333] text-[#ccc] hover:bg-[#111]"
              }`}
            >
              Most Reviewed Games
            </button>
          </div>
        </div>

        {activeTab === "reviewers" && (
          <div className="space-y-4">
            {topReviewers.length === 0 ? (
              <EmptyState
                icon="T"
                title="No reviews yet"
                subtitle="Be the first to write a review and top the leaderboard!"
                ctaText="Write a Review"
                ctaLink="/explore"
              />
            ) : (
              topReviewers.map((reviewer, index) => (
                <div key={reviewer.uid} className="flex items-center gap-6 bg-[#111] border border-[#222] rounded-2xl p-6 hover:border-[#333] transition-colors">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--accent)] text-black font-bold text-lg">
                    #{index + 1}
                  </div>

                  <div className="flex-1">
                    <Link to={`/user/${reviewer.username}`} className="font-bold text-white hover:text-[var(--accent)] transition-colors">
                      @{reviewer.username}
                    </Link>
                    <div className="text-sm text-[#666] mt-1">
                      {reviewer.count} review{reviewer.count !== 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {Object.entries(reviewer.verdicts).map(([verdict, count]) => (
                      <div key={verdict} className="text-center">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ backgroundColor: VERDICT_COLORS[verdict] }}
                        >
                          {count}
                        </div>
                        <div className="text-[10px] text-[#666] mt-1 capitalize">{verdict}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "games" && (
          <div className="space-y-4">
            {topGames.length === 0 ? (
              <EmptyState
                icon="G"
                title="No games reviewed yet"
                subtitle="Start reviewing games to see them on the leaderboard!"
                ctaText="Explore Games"
                ctaLink="/explore"
              />
            ) : (
              topGames.map((game, index) => (
                <div key={game.gameId} className="flex items-center gap-6 bg-[#111] border border-[#222] rounded-2xl p-6 hover:border-[#333] transition-colors">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--accent)] text-black font-bold text-lg">
                    #{index + 1}
                  </div>

                  <Link to={`/game/${game.gameId}`} className="flex items-center gap-4 flex-1 hover:opacity-80 transition-opacity">
                    <div className="w-16 h-20 rounded-lg overflow-hidden border border-[#333]">
                      <img src={game.gameCover} alt={game.gameName} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-bold text-white">{game.gameName}</div>
                      <div className="text-sm text-[#666]">{game.totalReviews} review{game.totalReviews !== 1 ? 's' : ''}</div>
                    </div>
                  </Link>

                  <div className="flex gap-2">
                    {Object.entries(game.verdicts).map(([verdict, count]) => (
                      <div key={verdict} className="text-center">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ backgroundColor: VERDICT_COLORS[verdict] }}
                        >
                          {count}
                        </div>
                        <div className="text-[10px] text-[#666] mt-1 capitalize">{verdict}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}