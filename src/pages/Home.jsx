import React from 'react';
import { Hero } from '../components/Hero';
import { GameRow } from '../components/GameRow';
import { GameMeter } from '../components/GameMeter';
import { MoodGrid } from '../components/MoodGrid';
import { DebateCards } from '../components/DebateCards';
import { FeaturesSection } from '../components/FeaturesSection';
import { CTABanner } from '../components/CTABanner';
import { useGames } from '../hooks/useGames';
import { rawg } from '../api/rawg';

const Home = () => {
    const trending = useGames(rawg.trending);
    const topRated = useGames(rawg.topRated);
    const newReleases = useGames(rawg.newReleases);

    return (
        <div className="min-h-screen pb-[60px]">
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
                seeAllHref="/explore?sort=Popular"
                showRank={true}
            />

            <GameMeter games={trending.data || []} loading={trending.loading} />

            <GameRow
                title="🏆 Top Rated All Time"
                chipLabel="HALL OF FAME"
                chipColor="#ffffff"
                games={topRated.data}
                loading={topRated.loading}
                error={topRated.error}
                seeAllHref="/explore?sort=Top Rated"
            />

            <MoodGrid />

            <GameRow
                title="New Releases"
                chipLabel="JUST DROPPED"
                chipColor="#ff4757"
                games={newReleases.data}
                loading={newReleases.loading}
                error={newReleases.error}
                seeAllHref="/explore?sort=New Releases"
            />

            <DebateCards />
            <FeaturesSection />
            <CTABanner />
        </div>
    );
};

export default Home;

