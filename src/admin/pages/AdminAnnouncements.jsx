import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import PageSkeleton from "../../components/PageSkeleton";

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info", // info, warning, success
    active: true
  });

  const loadAnnouncements = async () => {
    setLoading(true);
    setError("");

    try {
      const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const list = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setAnnouncements(list);
    } catch (err) {
      console.error("Load announcements error:", err);
      setError("Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      setError("Title and message are required.");
      return;
    }

    try {
      const data = {
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editing) {
        await updateDoc(doc(db, "announcements", editing.id), {
          ...data,
          updatedAt: new Date().toISOString()
        });
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === editing.id ? { ...a, ...data } : a))
        );
      } else {
        const docRef = await addDoc(collection(db, "announcements"), data);
        setAnnouncements((prev) => [{ id: docRef.id, ...data }, ...prev]);
      }

      setShowForm(false);
      setEditing(null);
      setFormData({ title: "", message: "", type: "info", active: true });
    } catch (err) {
      console.error("Save announcement error:", err);
      setError("Failed to save announcement.");
    }
  };

  const startEdit = (announcement) => {
    setEditing(announcement);
    setFormData({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      active: announcement.active
    });
    setShowForm(true);
  };

  const deleteAnnouncement = async (id) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      await deleteDoc(doc(db, "announcements", id));
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Delete announcement error:", err);
      setError("Failed to delete announcement.");
    }
  };

  const toggleActive = async (id, currentlyActive) => {
    try {
      await updateDoc(doc(db, "announcements", id), {
        active: !currentlyActive,
        updatedAt: new Date().toISOString()
      });
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, active: !currentlyActive } : a))
      );
    } catch (err) {
      console.error("Toggle active error:", err);
      setError("Failed to update announcement.");
    }
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[22px] font-syne font-bold text-white">Announcements</h2>
          <p className="text-[#777] mt-2">Create and manage site-wide banners.</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            setFormData({ title: "", message: "", type: "info", active: true });
          }}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 font-semibold text-black hover:bg-[var(--accent-hover)] transition-colors"
        >
          New Announcement
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-600 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {showForm && (
        <div className="rounded-2xl border border-[#222] bg-[#0e0e0e] p-6">
          <h3 className="text-[18px] font-bold text-white mb-4">
            {editing ? "Edit Announcement" : "Create Announcement"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#ccc] mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-lg border border-[#333] bg-[#0a0a0a] px-4 py-2 text-white placeholder-[#666] focus:border-[var(--accent)] focus:outline-none"
                placeholder="Announcement title..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#ccc] mb-2">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full rounded-lg border border-[#333] bg-[#0a0a0a] px-4 py-2 text-white placeholder-[#666] focus:border-[var(--accent)] focus:outline-none resize-none"
                rows={3}
                placeholder="Announcement message..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#ccc] mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full rounded-lg border border-[#333] bg-[#0a0a0a] px-4 py-2 text-white focus:border-[var(--accent)] focus:outline-none"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 text-sm font-semibold text-[#ccc]">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded border-[#333] bg-[#0a0a0a] focus:ring-[var(--accent)]"
                  />
                  Active
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
                className="flex-1 rounded-lg border border-[#333] py-2 font-semibold text-[#ccc] hover:bg-[#111] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-[var(--accent)] py-2 font-semibold text-black hover:bg-[var(--accent-hover)] transition-colors"
              >
                {editing ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-2xl border border-[#222] bg-[#0e0e0e] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[#222]">
              <tr className="text-left">
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">Announcement</th>
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">Type</th>
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">Status</th>
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">Created</th>
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((announcement) => (
                <tr key={announcement.id} className="border-b border-[#1a1a1a] last:border-b-0">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-white">{announcement.title}</div>
                      <div className="text-sm text-[#666] line-clamp-1">{announcement.message}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                      announcement.type === "warning"
                        ? "border-yellow-600 text-yellow-200 bg-yellow-950/40"
                        : announcement.type === "success"
                        ? "border-green-600 text-green-200 bg-green-950/40"
                        : "border-blue-600 text-blue-200 bg-blue-950/40"
                    }`}>
                      {announcement.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                      announcement.active
                        ? "border-green-600 text-green-200 bg-green-950/40"
                        : "border-gray-600 text-gray-200 bg-gray-950/40"
                    }`}>
                      {announcement.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#ccc] text-sm">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleActive(announcement.id, announcement.active)}
                        className={`text-xs px-3 py-1 rounded border transition-colors ${
                          announcement.active
                            ? "border-gray-600 text-gray-200 hover:bg-gray-950"
                            : "border-green-600 text-green-200 hover:bg-green-950"
                        }`}
                      >
                        {announcement.active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => startEdit(announcement)}
                        className="text-xs px-3 py-1 rounded border border-blue-600 text-blue-200 hover:bg-blue-950 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteAnnouncement(announcement.id)}
                        className="text-xs px-3 py-1 rounded border border-red-600 text-red-200 hover:bg-red-950 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && announcements.length === 0 && (
          <div className="p-12 text-center text-[#666]">
            No announcements found. Create your first one above.
          </div>
        )}
      </div>
    </div>
  );
}

