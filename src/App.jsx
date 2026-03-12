import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
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
import NotFound from './pages/NotFound';
import Footer from './components/Footer';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
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
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<MyProfile />} />
                <Route path="/shelf" element={<GameShelf />} />
                <Route path="/collections" element={<MyCollections />} />
                <Route path="/collections/new" element={<CreateCollection />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
