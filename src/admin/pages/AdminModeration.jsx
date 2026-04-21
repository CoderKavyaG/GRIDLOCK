import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../context/AuthContext';
import { FiCheck, FiX, FiTrash2, FiBook, FiMessageSquare } from 'react-icons/fi';

export const AdminDashboard = () => {
  const { isAdmin, user } = useAuth();
  const [pendingReviews, setPendingReviews] = useState([]);
  const [pendingDebates, setPendingDebates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reviews');

  useEffect(() => {
    if (!isAdmin) return;

    const fetchPending = async () => {
      setLoading(true);
      try {
        // Fetch pending reviews
        const reviewsRef = collection(db, 'reviews');
        const reviewsQuery = query(reviewsRef, where('approved', '==', false));
        const reviewsDocs = await getDocs(reviewsQuery);
        setPendingReviews(reviewsDocs.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch pending debates
        const debatesRef = collection(db, 'debates');
        const debatesQuery = query(debatesRef, where('approved', '==', false));
        const debatesDocs = await getDocs(debatesQuery);
        setPendingDebates(debatesDocs.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error('Error fetching pending items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
  }, [isAdmin]);

  const handleApprove = async (type, id) => {
    try {
      const docRef = doc(db, type === 'review' ? 'reviews' : 'debates', id);
      await updateDoc(docRef, { approved: true });
      
      if (type === 'review') {
        setPendingReviews(prev => prev.filter(r => r.id !== id));
      } else {
        setPendingDebates(prev => prev.filter(d => d.id !== id));
      }
    } catch (err) {
      console.error('Error approving:', err);
    }
  };

  const handleReject = async (type, id) => {
    try {
      const docRef = doc(db, type === 'review' ? 'reviews' : 'debates', id);
      await deleteDoc(docRef);
      
      if (type === 'review') {
        setPendingReviews(prev => prev.filter(r => r.id !== id));
      } else {
        setPendingDebates(prev => prev.filter(d => d.id !== id));
      }
    } catch (err) {
      console.error('Error rejecting:', err);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-[#888]">You don't have admin access</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-[#2a2a2a]">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-3 font-semibold flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
                : 'text-[#888] hover:text-white'
            }`}
          >
            <FiBook /> Pending Reviews ({pendingReviews.length})
          </button>
          <button
            onClick={() => setActiveTab('debates')}
            className={`px-6 py-3 font-semibold flex items-center gap-2 ${
              activeTab === 'debates'
                ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
                : 'text-[#888] hover:text-white'
            }`}
          >
            <FiMessageSquare /> Pending Debates ({pendingDebates.length})
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-[#888]">Loading...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === 'reviews' && (
              <div>
                {pendingReviews.length === 0 ? (
                  <div className="text-center py-12 bg-[#111] rounded-lg border border-[#2a2a2a]">
                    <p className="text-[#888]">No pending reviews</p>
                  </div>
                ) : (
                  pendingReviews.map(review => (
                    <div
                      key={review.id}
                      className="bg-[#111] border border-[#2a2a2a] rounded-lg p-6 hover:border-[#3a3a3a] transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-white mb-2">Game ID: {review.gameId}</h3>
                          <p className="text-[#888] mb-3">{review.reviewText}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-[#666]">Author: {review.authorName || 'Anonymous'}</span>
                            <span className="px-3 py-1 bg-[#1a1a1a] rounded-full text-[#888]">
                              {review.verdict}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove('review', review.id)}
                            className="p-3 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition flex items-center gap-2"
                            title="Approve"
                          >
                            <FiCheck />
                          </button>
                          <button
                            onClick={() => handleReject('review', review.id)}
                            className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition flex items-center gap-2"
                            title="Reject"
                          >
                            <FiX />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'debates' && (
              <div>
                {pendingDebates.length === 0 ? (
                  <div className="text-center py-12 bg-[#111] rounded-lg border border-[#2a2a2a]">
                    <p className="text-[#888]">No pending debates</p>
                  </div>
                ) : (
                  pendingDebates.map(debate => (
                    <div
                      key={debate.id}
                      className="bg-[#111] border border-[#2a2a2a] rounded-lg p-6 hover:border-[#3a3a3a] transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-white mb-2">{debate.title}</h3>
                          <p className="text-[#888] mb-3">{debate.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-[#666]">Creator: {debate.creatorName || 'Anonymous'}</span>
                            <span className="px-3 py-1 bg-[#1a1a1a] rounded-full text-[#888]">
                              Game ID: {debate.gameId}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove('debate', debate.id)}
                            className="p-3 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition flex items-center gap-2"
                            title="Approve"
                          >
                            <FiCheck />
                          </button>
                          <button
                            onClick={() => handleReject('debate', debate.id)}
                            className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition flex items-center gap-2"
                            title="Reject"
                          >
                            <FiX />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
