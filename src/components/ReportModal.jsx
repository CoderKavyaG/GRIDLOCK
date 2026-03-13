import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAuth } from "../../context/AuthContext";

const REPORT_REASONS = [
  "Spam",
  "Harassment",
  "Inappropriate content",
  "Copyright violation",
  "Hate speech",
  "Other"
];

export default function ReportModal({ isOpen, onClose, targetType, targetId, targetUsername }) {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please select a reason for the report.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await addDoc(collection(db, "reports"), {
        reporterId: user.uid,
        reporterUsername: user.displayName || user.email?.split("@")[0],
        targetType, // "user", "review", "debate"
        targetId,
        targetUsername,
        reason,
        details: details.trim(),
        status: "pending",
        createdAt: new Date().toISOString()
      });

      onClose();
      // Could add toast here
    } catch (err) {
      console.error("Report submission error:", err);
      setError("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#0e0e0e] border border-[#222] rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-[18px] font-syne font-bold text-white mb-4">Report {targetType}</h3>

        {error && (
          <div className="mb-4 rounded-lg border border-red-600 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#ccc] mb-2">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-[#333] bg-[#0a0a0a] px-4 py-2 text-white focus:border-[var(--accent)] focus:outline-none"
              required
            >
              <option value="">Select a reason...</option>
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#ccc] mb-2">Additional details (optional)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide more context about this report..."
              className="w-full rounded-lg border border-[#333] bg-[#0a0a0a] px-4 py-2 text-white placeholder-[#666] focus:border-[var(--accent)] focus:outline-none resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[#333] py-2 font-semibold text-[#ccc] hover:bg-[#111] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-[var(--accent)] py-2 font-semibold text-black hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}