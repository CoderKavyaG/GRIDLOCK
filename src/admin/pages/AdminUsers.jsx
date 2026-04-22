import { useState, useEffect } from "react";
import { collection, query, where, orderBy, limit, startAfter, getDocs, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import PageSkeleton from "../../components/PageSkeleton";

const USERS_PER_PAGE = 20;

export default function AdminUsers() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [updating, setUpdating] = useState(null); // user id being updated

  const logAction = async (action, targetId, details = "") => {
    try {
      await addDoc(collection(db, "audit"), {
        action,
        adminId: user.uid,
        adminUsername: user.displayName || user.email?.split("@")[0],
        targetType: "user",
        targetId,
        details,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Audit log error:", err);
    }
  };

  const loadUsers = async (reset = false) => {
    setLoading(true);
    setError("");

    try {
      let q;
      if (searchTerm.trim()) {
        // Search by username or email (case-insensitive)
        q = query(
          collection(db, "users"),
          where("username", ">=", searchTerm.toLowerCase()),
          where("username", "<=", searchTerm.toLowerCase() + "\uf8ff"),
          orderBy("username"),
          limit(USERS_PER_PAGE)
        );
      } else {
        q = query(
          collection(db, "users"),
          orderBy("joinedAt", "desc"),
          limit(USERS_PER_PAGE)
        );
        if (!reset && lastDoc) {
          q = query(q, startAfter(lastDoc));
        }
      }

      const snapshot = await getDocs(q);
      const list = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));

      if (reset) {
        setUsers(list);
      } else {
        setUsers((prev) => [...prev, ...list]);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(list.length === USERS_PER_PAGE);
    } catch (err) {
      console.error("Load users error:", err);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(true);
  }, [searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadUsers(true);
  };

  const toggleBan = async (userId, currentlyBanned) => {
    setUpdating(userId);
    try {
      await updateDoc(doc(db, "users", userId), {
        banned: !currentlyBanned
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, banned: !currentlyBanned } : u))
      );
      await logAction(currentlyBanned ? "unban user" : "ban user", userId);
    } catch (err) {
      console.error("Toggle ban error:", err);
      setError("Failed to update user status.");
    } finally {
      setUpdating(null);
    }
  };

  const toggleAdmin = async (userId, currentlyAdmin) => {
    setUpdating(userId);
    try {
      await updateDoc(doc(db, "users", userId), {
        isAdmin: !currentlyAdmin
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isAdmin: !currentlyAdmin } : u))
      );
      await logAction(currentlyAdmin ? "remove admin" : "grant admin", userId);
    } catch (err) {
      console.error("Toggle admin error:", err);
      setError("Failed to update admin status.");
    } finally {
      setUpdating(null);
    }
  };

  const deleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to permanently delete user @${username}? This cannot be undone.`)) {
      return;
    }

    setUpdating(userId);
    try {
      // Delete user document from Firestore
      await deleteDoc(doc(db, "users", userId));
      
      // Remove from local state
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      
      // Log the action
      await logAction("delete user", userId, `Deleted user @${username}`);
      
      addToast(`User @${username} has been deleted`, "success");
    } catch (err) {
      console.error("Delete user error:", err);
      setError("Failed to delete user.");
      addToast("Failed to delete user", "error");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[22px] font-syne font-bold text-white">User Management</h2>
        <p className="text-[#777] mt-2">Search, view, and manage user accounts.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-600 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          placeholder="Search by username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 rounded-lg border border-[#333] bg-[#0e0e0e] px-4 py-2 text-white placeholder-[#666] focus:border-[var(--accent)] focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-[var(--accent)] px-6 py-2 font-semibold text-black hover:bg-[var(--accent-hover)] transition-colors"
        >
          Search
        </button>
      </form>

      <div className="rounded-2xl border border-[#222] bg-[#0e0e0e] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[#222]">
              <tr className="text-left">
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">User</th>
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">Email</th>
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">Joined</th>
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">Status</th>
                <th className="px-6 py-4 text-[11px] font-[900] uppercase tracking-widest text-[#888]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-[#1a1a1a] last:border-b-0">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#222] border border-[#333] overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-xs">
                            {user.username?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-white">@{user.username}</div>
                        <div className="text-xs text-[#666]">{user.displayName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#ccc]">{user.email}</td>
                  <td className="px-6 py-4 text-[#ccc] text-sm">
                    {new Date(user.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {user.banned && (
                        <span className="text-[10px] font-[900] uppercase tracking-widest px-2 py-1 rounded-full bg-red-950 text-red-200 border border-red-600">
                          Banned
                        </span>
                      )}
                      {user.isAdmin && (
                        <span className="text-[10px] font-[900] uppercase tracking-widest px-2 py-1 rounded-full bg-purple-950 text-purple-200 border border-purple-600">
                          Admin
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleBan(user.id, user.banned)}
                        disabled={updating === user.id}
                        className={`text-xs px-3 py-1 rounded border transition-colors ${
                          user.banned
                            ? "border-green-600 text-green-200 hover:bg-green-950"
                            : "border-red-600 text-red-200 hover:bg-red-950"
                        } disabled:opacity-50`}
                      >
                        {updating === user.id ? "..." : user.banned ? "Unban" : "Ban"}
                      </button>
                      <button
                        onClick={() => toggleAdmin(user.id, user.isAdmin)}
                        disabled={updating === user.id}
                        className={`text-xs px-3 py-1 rounded border transition-colors ${
                          user.isAdmin
                            ? "border-gray-600 text-gray-200 hover:bg-gray-950"
                            : "border-purple-600 text-purple-200 hover:bg-purple-950"
                        } disabled:opacity-50`}
                      >
                        {updating === user.id ? "..." : user.isAdmin ? "Remove Admin" : "Make Admin"}
                      </button>
                      <button
                        onClick={() => deleteUser(user.id, user.username)}
                        disabled={updating === user.id}
                        className="text-xs px-3 py-1 rounded border border-red-700 text-red-300 hover:bg-red-950 transition-colors disabled:opacity-50"
                      >
                        {updating === user.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && <PageSkeleton />}

        {!loading && hasMore && !searchTerm && (
          <div className="p-6 text-center">
            <button
              onClick={() => loadUsers()}
              className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-semibold"
            >
              Load more users
            </button>
          </div>
        )}

        {!loading && users.length === 0 && (
          <div className="p-12 text-center text-[#666]">
            {searchTerm ? "No users found matching your search." : "No users found."}
          </div>
        )}
      </div>
    </div>
  );
}

