import { Link } from "react-router-dom";

export default function EmptyState({ icon, title, subtitle, ctaText, ctaLink, onCtaClick }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-[#111] border border-[#1e1e1e] rounded-[16px]">
      <div className="text-[48px] mb-6 select-none opacity-80">
        {icon || "🎮"}
      </div>
      <h3 className="font-syne text-[20px] font-bold text-white mb-2">
        {title || "Nothing here yet."}
      </h3>
      <p className="text-[14px] text-[var(--text-muted)] max-w-sm mb-6">
        {subtitle || "There's no content to show at the moment."}
      </p>

      {ctaText && (
        <>
          {ctaLink ? (
            <Link 
              to={ctaLink}
              className="px-6 py-3 bg-[var(--accent)] text-black font-syne font-bold rounded-lg hover:brightness-105 transition-all text-[14px]"
            >
              {ctaText}
            </Link>
          ) : (
            <button 
              onClick={onCtaClick}
              className="px-6 py-3 bg-[var(--accent)] text-black font-syne font-bold rounded-lg hover:brightness-105 transition-all text-[14px]"
            >
              {ctaText}
            </button>
          )}
        </>
      )}
    </div>
  );
}
