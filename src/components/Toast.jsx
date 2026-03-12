import { useEffect, useState } from "react";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from "react-icons/fa";

export default function Toast({ message, type, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Slight delay for entry animation to take effect
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const getIcon = () => {
    switch (type) {
      case "success": return <FaCheckCircle className="text-[#2ed573]" />;
      case "error": return <FaExclamationCircle className="text-[#ff4757]" />;
      default: return <FaInfoCircle className="text-[var(--accent)]" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case "success": return "border-l-[#2ed573]";
      case "error": return "border-l-[#ff4757]";
      default: return "border-l-[var(--accent)]";
    }
  };

  return (
    <div 
      className={`bg-[#161616] border-l-4 rounded-lg shadow-2xl p-4 pr-10 min-w-[280px] flex items-center gap-3 transition-all duration-300 pointer-events-auto relative
        ${getBorderColor()} 
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="shrink-0 text-[18px]">
        {getIcon()}
      </div>
      <p className="text-[14px] text-white font-medium break-words leading-tight">
        {message}
      </p>
      
      <button 
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white transition-colors p-1"
      >
        <FaTimes size={14} />
      </button>
    </div>
  );
}
