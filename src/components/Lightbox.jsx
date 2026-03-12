import { useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";

export default function Lightbox({ images, currentIndex, onClose, onNavigate }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate("prev");
      if (e.key === "ArrowRight") onNavigate("next");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNavigate]);

  if (!images || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center">
      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full bg-black/50 hover:bg-black transition-all z-10"
      >
        <FaTimes size={24} />
      </button>

      {/* Navigation arrows */}
      <button 
        onClick={(e) => { e.stopPropagation(); onNavigate("prev"); }}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] transition-all z-10"
      >
        <FaChevronLeft size={32} />
      </button>

      <button 
        onClick={(e) => { e.stopPropagation(); onNavigate("next"); }}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] transition-all z-10"
      >
        <FaChevronRight size={32} />
      </button>

      {/* Image container */}
      <div className="relative w-full max-w-[90vw] max-h-[90vh] flex items-center justify-center p-4" onClick={onClose}>
        <img 
          src={images[currentIndex]?.image} 
          alt={`Screenshot ${currentIndex + 1}`}
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()} // Prevent click from closing
        />
      </div>

      {/* Counter */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-1.5 rounded-full text-white/80 text-[13px] tracking-widest pointer-events-none">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}
