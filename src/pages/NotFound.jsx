import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent)] rounded-full filter blur-[200px] opacity-[0.04] pointer-events-none"></div>

      <div className="relative z-10 text-center max-w-lg">
        <div className="font-syne text-[120px] md:text-[160px] font-black leading-none text-[var(--accent)] opacity-20 select-none mb-[-20px]">
          404
        </div>
        <h1 className="font-syne text-[36px] md:text-[48px] font-black leading-tight mb-4">
          Page not found.
        </h1>
        <p className="text-[var(--text-muted)] text-[16px] mb-10 leading-relaxed">
          Looks like this level doesn't exist — or it's been removed from the game world.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="h-12 px-8 bg-[var(--accent)] text-black font-syne font-black rounded-lg hover:brightness-105 transition-all flex items-center justify-center"
          >
            Back to Discover
          </Link>
          <Link
            to="/explore"
            className="h-12 px-8 bg-[#161616] border border-[#2a2a2a] text-white font-syne font-bold rounded-lg hover:border-[#555] transition-all flex items-center justify-center"
          >
            Explore Games
          </Link>
        </div>
      </div>
    </div>
  );
}
