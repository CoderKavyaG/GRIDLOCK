import React from 'react';
import { EditorialHero } from './EditorialHero';
import { MarqueeStrip } from './MarqueeStrip';
import { CommunityStats } from './CommunityStats';
import { GameRow } from '../GameRow';
import { GameMeter } from '../GameMeter';
import { ExplainerStrip } from './ExplainerStrip';
import { MoodGrid } from '../MoodGrid';
import { FeatureComparison } from './FeatureComparison';
import { CommunityReviewsGrid } from './CommunityReviewsGrid';
import { CTABanner } from '../CTABanner';
import { useGames } from '../../hooks/useGames';
import { rawg } from '../../api/rawg';

export const LoggedOutHome = ({ user }) => {
    const trending = useGames(rawg.trending);
    const topRated = useGames(rawg.topRated);
    const newReleases = useGames(rawg.newReleases);

    return (
        <div className="animate-fade-in">
            {/* Optional greeting for signed-in users (doesn't change layout) */}
            {user && (
                <div className="max-w-[1400px] mx-auto px-4 lg:px-8 pt-24 pb-8">
                    <div className="rounded-2xl border border-[#2a2a2a] bg-[#121212] px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h2 className="font-syne text-[22px] font-black text-white">Welcome back, {user.displayName || user.email?.split('@')[0] || 'Gamer'}.</h2>
                            <p className="text-[14px] text-[var(--text-muted)]">Your main feed is right below — explore, review, and save games anytime.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <a href="/shelf" className="rounded-full bg-[var(--accent)] px-5 py-2 text-[13px] font-bold text-black hover:brightness-110 transition">Go to Shelf</a>
                            <a href="/collections" className="rounded-full border border-white/10 px-5 py-2 text-[13px] font-bold text-white hover:bg-white/5 transition">My Collections</a>
                        </div>
                    </div>
                </div>
            )}

            <EditorialHero />
            <MarqueeStrip />
            <CommunityStats />

            <div className="bg-[#0a0a0a] py-12">
                <GameRow
                    title="Trending Now"
                    chipLabel="TRENDING THIS WEEK"
                    chipColor="var(--accent)"
                    games={trending.data}
                    loading={trending.loading}
                    error={trending.error}
                    seeAllHref="/explore?sort=Popular"
                    showRank={true}
                />

                <div className="mt-20">
                    <GameMeter games={trending.data || []} loading={trending.loading} />
                    <ExplainerStrip />
                </div>

                <div className="mt-20">
                    <GameRow
                        title="Top Rated All Time"
                        chipLabel="TOP RATED ALL TIME"
                        chipColor="#ffffff"
                        games={topRated.data}
                        loading={topRated.loading}
                        error={topRated.error}
                        seeAllHref="/explore?sort=Top Rated"
                    />
                </div>

                <MoodGrid />

                <div className="mt-20">
                    <GameRow
                        title="New Releases"
                        chipLabel="NEW RELEASES"
                        chipColor="#ff4757"
                        games={newReleases.data}
                        loading={newReleases.loading}
                        error={newReleases.error}
                        seeAllHref="/explore?sort=New Releases"
                    />
                </div>
            </div>

            <FeatureComparison />
            <CommunityReviewsGrid />
            <CTABanner />
        </div>
    );
};
