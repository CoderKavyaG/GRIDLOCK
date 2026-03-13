import { useMemo, useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { DashboardGreeting } from "./DashboardGreeting";
import { GameRow } from "../GameRow";
import { CommunityReviewsGrid } from "./CommunityReviewsGrid"; // Reuse this for activity
import { DebateCards } from "../DebateCards";
import { rawg } from "../../api/rawg";
import { useGames } from "../../hooks/useGames";

export const LoggedInHome = () => {
    const { user, userProfile } = useAuth();
    const [shelfStats, setShelfStats] = useState({ played: 0, wantToPlay: 0 });
    const [playingGames, setPlayingGames] = useState([]);
    const [backlogGames, setBacklogGames] = useState([]);
    const [loading, setLoading] = useState(true);

    const favoriteGenre = userProfile?.preferences?.genres?.[0] || null;

    const recommendationsEndpoint = useMemo(() => {
        if (!favoriteGenre) return rawg.trending;
        return () => rawg.explore({ genres: favoriteGenre.toLowerCase(), ordering: "-rating", page_size: 12 });
    }, [favoriteGenre]);

    const recommendations = useGames(recommendationsEndpoint);

    useEffect(() => {
        if (!user) return;

        const fetchShelf = async () => {
            setLoading(true);
            try {
                const shelfRef = collection(db, `gameShelf/${user.uid}/games`);
                const snapshot = await getDocs(shelfRef);

                let p = 0,
                    w = 0;
                const playing = [];
                const backlog = [];

                snapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.status === "played") p++;
                    if (data.status === "playing") {
                        playing.push(data);
                    }
                    if (data.status === "wantToPlay") {
                        w++;
                        backlog.push(data);
                    }
                });

                setShelfStats({ played: p, wantToPlay: w });
                setPlayingGames(playing.slice(0, 6));
                setBacklogGames(
                    backlog
                        .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
                        .slice(0, 10)
                );
            } catch (error) {
                console.error("Logged in home fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchShelf();
    }, [user]);

    return (
        <div className="animate-fade-in bg-[#0a0a0a] min-h-screen pb-20">
            <DashboardGreeting stats={shelfStats} />

            <div className="space-y-[80px] pt-12">
                <GameRow
                    title="Currently Playing"
                    games={playingGames}
                    loading={loading}
                    emptyMessage="Nothing in progress. Time to start something?"
                    seeAllHref="/shelf"
                />

                <GameRow
                    title="Up Next on Your Shelf"
                    games={backlogGames}
                    loading={loading}
                    emptyMessage="Your backlog is empty. Are you even a gamer?"
                    seeAllHref="/shelf"
                />

                <GameRow
                    title={favoriteGenre ? `Because You Love ${favoriteGenre}` : "Discover Something New"}
                    games={recommendations.data}
                    loading={recommendations.loading}
                    seeAllHref="/explore"
                />

                <div className="py-8 bg-[#0d0d0d] border-y border-[#1a1a1a]">
                    <CommunityReviewsGrid title="What Players Are Saying Right Now" horizontal={true} limit={10} />
                </div>

                <div className="px-6">
                    <h3 className="max-w-[1400px] mx-auto font-syne text-[28px] font-black text-white mb-8">
                        Debates Heating Up 🔥
                    </h3>
                    <DebateCards limit={3} horizontal={true} />
                </div>
            </div>
        </div>
    );
};
