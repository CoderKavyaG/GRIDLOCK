import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiBell, FiThumbsUp, FiMessageSquare, FiUserPlus, FiCheck } from "react-icons/fi";
import { db } from "../firebase/firebase";
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc, writeBatch } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function NotificationDropdown() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, `users/${user.uid}/notifications`),
            orderBy("createdAt", "desc"),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = [];
            let unread = 0;
            snapshot.forEach(doc => {
                const data = doc.data();
                list.push({ id: doc.id, ...data });
                if (!data.read) unread++;
            });
            setNotifications(list);
            setUnreadCount(unread);
        });

        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAllRead = async () => {
        if (!user || unreadCount === 0) return;
        try {
            const batch = writeBatch(db);
            notifications.forEach(notif => {
                if (!notif.read) {
                    const ref = doc(db, `users/${user.uid}/notifications/${notif.id}`);
                    batch.update(ref, { read: true });
                }
            });
            await batch.commit();
        } catch (err) {
            console.error("Mark all read error:", err);
        }
    };

    const markRead = async (id) => {
        try {
            const ref = doc(db, `users/${user.uid}/notifications/${id}`);
            await updateDoc(ref, { read: true });
        } catch (err) {
            console.error("Mark read error:", err);
        }
    };

    const getIcon = (type) => {
        switch(type) {
            case 'like': return <FiThumbsUp className="text-blue-500" />;
            case 'comment': return <FiMessageSquare className="text-green-500" />;
            case 'follow': return <FiUserPlus className="text-purple-500" />;
            default: return <FiBell />;
        }
    };

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="relative w-10 h-10 rounded-full bg-[#161616] border border-[#222] flex items-center justify-center text-[var(--text-muted)] hover:text-white transition-all"
            >
                <FiBell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-[var(--accent)] text-black text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#0a0a0a]">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-3 w-80 bg-[#161616] border border-[#2a2a2a] rounded-xl shadow-2xl py-2 z-[100]"
                    >
                        <div className="px-4 py-3 border-b border-[#2a2a2a] flex items-center justify-between">
                            <h3 className="text-white font-bold text-[14px]">Notifications</h3>
                            <button onClick={markAllRead} className="text-[11px] font-bold text-[var(--accent)] hover:underline">Mark all read</button>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                            {notifications.length > 0 ? (
                                notifications.map(notif => (
                                    <Link 
                                        key={notif.id} 
                                        to={notif.link || "#"} 
                                        onClick={() => { markRead(notif.id); setIsOpen(false); }}
                                        className={`flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${!notif.read ? 'bg-white/[0.02]' : ''}`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center shrink-0 border border-white/5">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] text-white leading-tight mb-1">
                                                <span className="font-bold">{notif.fromName}</span> {notif.text}
                                            </p>
                                            <span className="text-[10px] text-[#444] font-bold uppercase">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        {!notif.read && <div className="w-2 h-2 rounded-full bg-[var(--accent)] mt-2"></div>}
                                    </Link>
                                ))
                            ) : (
                                <div className="py-12 text-center text-[var(--text-muted)] text-[13px]">
                                    No notifications for now.
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
