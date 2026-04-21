export default function Guidelines() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-[72px]">
      <div className="max-w-[800px] mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-syne text-[32px] font-black mb-2">Community Guidelines</h1>
          <p className="text-[#777]">Help us keep GRIDLOCK a positive and respectful community.</p>
        </div>

        <div className="space-y-8">
          <section className="bg-[#111] border border-[#222] rounded-2xl p-6">
            <h2 className="font-syne text-[20px] font-bold mb-4 text-[var(--accent)]">Be Respectful</h2>
            <p className="text-[#ccc] leading-relaxed mb-4">
              Treat all members with respect. Harassment, hate speech, or discriminatory content will not be tolerated.
              Disagreements are fine, but keep discussions civil and constructive.
            </p>
          </section>

          <section className="bg-[#111] border border-[#222] rounded-2xl p-6">
            <h2 className="font-syne text-[20px] font-bold mb-4 text-[var(--accent)]">Honest Reviews</h2>
            <p className="text-[#ccc] leading-relaxed mb-4">
              Write genuine reviews based on your actual experience. Fake reviews, spam, or reviews written solely
              for rewards undermine the community's trust.
            </p>
          </section>

          <section className="bg-[#111] border border-[#222] rounded-2xl p-6">
            <h2 className="font-syne text-[20px] font-bold mb-4 text-[var(--accent)]">No Spoilers</h2>
            <p className="text-[#ccc] leading-relaxed mb-4">
              Use spoiler tags or warnings when discussing plot points, endings, or major game elements that could
              ruin the experience for others.
            </p>
          </section>

          <section className="bg-[#111] border border-[#222] rounded-2xl p-6">
            <h2 className="font-syne text-[20px] font-bold mb-4 text-[var(--accent)]">Copyright & Fair Use</h2>
            <p className="text-[#ccc] leading-relaxed mb-4">
              Respect copyright laws. You may discuss games and share fair use content, but do not upload or link to
              pirated materials or unauthorized copyrighted content.
            </p>
          </section>

          <section className="bg-[#111] border border-[#222] rounded-2xl p-6">
            <h2 className="font-syne text-[20px] font-bold mb-4 text-[var(--accent)]">Report Issues</h2>
            <p className="text-[#ccc] leading-relaxed mb-4">
              If you encounter inappropriate content or behavior, please report it using the report buttons available
              throughout the site. Our moderation team will review reports promptly.
            </p>
          </section>

          <section className="bg-[#111] border border-[#222] rounded-2xl p-6">
            <h2 className="font-syne text-[20px] font-bold mb-4 text-[var(--accent)]">Consequences</h2>
            <p className="text-[#ccc] leading-relaxed mb-4">
              Violations of these guidelines may result in content removal, temporary suspension, or permanent bans
              depending on severity. We aim to be fair and transparent in our moderation decisions.
            </p>
          </section>

          <div className="text-center pt-8 border-t border-[#222]">
            <p className="text-[#666] text-sm">
              These guidelines help maintain a positive community. Thank you for being part of GRIDLOCK!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}