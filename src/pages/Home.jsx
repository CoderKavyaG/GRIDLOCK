import React from 'react';
import Navbar from '../components/Navbar';
import { Hero } from '../components/Hero';
import { GameRow } from '../components/GameRow';
import { useGames } from '../hooks/useGames';
import { rawg } from '../api/rawg';

const Home = () => {
    const trending = useGames(rawg.trending);
    const topRated = useGames(rawg.topRated);
    const newReleases = useGames(rawg.newReleases);

    return (
        <div className="min-h-screen pb-[80px]">
            <Navbar />
            <Hero />

            {/* Spacer between hero and first row */}
            <div className="h-[40px]"></div>

            <GameRow
                title="Trending Now"
                chipLabel="THIS WEEK"
                chipColor="var(--accent)"
                games={trending.data}
                loading={trending.loading}
                error={trending.error}
                seeAllHref="/trending"
                showRank={true}
            />

            <GameRow
                title="🏆 Top Rated All Time"
                chipLabel="HALL OF FAME"
                chipColor="#ffffff"
                games={topRated.data}
                loading={topRated.loading}
                error={topRated.error}
                seeAllHref="/top-rated"
            />

            <GameRow
                title="New Releases"
                chipLabel="JUST DROPPED"
                chipColor="#ff4757"
                games={newReleases.data}
                loading={newReleases.loading}
                error={newReleases.error}
                seeAllHref="/new-releases"
            />

        </div>
    );
};

export default Home;
