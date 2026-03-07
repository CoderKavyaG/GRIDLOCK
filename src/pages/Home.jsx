import React from 'react';
import Navbar from '../components/Navbar';
import { Hero } from '../components/Hero';
import { GameRow } from '../components/GameRow';
import { GameMeter } from '../components/GameMeter';
import { MoodGrid } from '../components/MoodGrid';
import { DebateCards } from '../components/DebateCards';
import { FeaturesSection } from '../components/FeaturesSection';
import { CTABanner } from '../components/CTABanner';
import { Footer } from '../components/Footer';
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
                chipColor="var(--color-accent)"
                games={trending.data}
                loading={trending.loading}
                error={trending.error}
                seeAllHref="/trending"
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
                seeAllHref="/top-rated"
            />

            <MoodGrid />

            <GameRow
                title="New Releases"
                chipLabel="JUST DROPPED"
                chipColor="#ff4757"
                games={newReleases.data}
                loading={newReleases.loading}
                error={newReleases.error}
                seeAllHref="/new-releases"
            />

            <DebateCards />
            <FeaturesSection />
            <CTABanner />
            <Footer />

        </div>
    );
};

export default Home;
