import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SearchProvider, useSearch } from './context/SearchContext';
import { HelmetProvider } from 'react-helmet-async';
import ProtectedRoute from './components/ProtectedRoute';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Explore from './pages/Explore';
import GameDetail from './pages/GameDetail';
import MyProfile from './pages/MyProfile';
import GameShelf from './pages/GameShelf';
import MyCollections from './pages/MyCollections';
import CreateCollection from './pages/CreateCollection';
import CollectionDetail from './pages/CollectionDetail';
import Debates from './pages/Debates';
import SingleDebate from './pages/SingleDebate';
import Settings from './pages/Settings';
import UserProfile from './pages/UserProfile';
import Rewind from './pages/Rewind';
import Feed from './pages/Feed';
import NotFound from './pages/NotFound';
import { Footer } from './components/Footer';
import { SearchOverlay } from './components/SearchOverlay';

import AdminRoute from './components/AdminRoute';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminUsers from './admin/pages/AdminUsers';
import AdminUserDetail from './admin/pages/AdminUserDetail';
import AdminReviews from './admin/pages/AdminReviews';
import AdminDebates from './admin/pages/AdminDebates';
import AdminReports from './admin/pages/AdminReports';
import AdminAnalytics from './admin/pages/AdminAnalytics';
import AdminAnnouncements from './admin/pages/AdminAnnouncements';
import AdminAuditLog from './admin/pages/AdminAuditLog';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <ToastProvider>
          <SearchProvider>
            <AppContent />
          </SearchProvider>
        </ToastProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

function AppContent() {
  const { isSearchOpen, closeSearch } = useSearch();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <SearchOverlay isOpen={isSearchOpen} onClose={closeSearch} />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/game/:gameId" element={<GameDetail />} />
          <Route path="/debates" element={<Debates />} />
          <Route path="/debates/:debateId" element={<SingleDebate />} />
          <Route path="/collections/:id" element={<CollectionDetail />} />
          <Route path="/user/:username" element={<UserProfile />} />

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="users/:uid" element={<AdminUserDetail />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="debates" element={<AdminDebates />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="audit-log" element={<AdminAuditLog />} />
            </Route>
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/feed" element={<Feed />} />
            <Route path="/profile" element={<MyProfile />} />
            <Route path="/shelf" element={<GameShelf />} />
            <Route path="/collections" element={<MyCollections />} />
            <Route path="/collections/new" element={<CreateCollection />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/rewind" element={<Rewind />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
