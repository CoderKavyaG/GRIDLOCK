import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { useToast } from "../context/ToastContext";
import { FaUser, FaLock, FaCog, FaBell, FaCamera, FaTrash } from "react-icons/fa";

const GENRES = ["RPG", "Action", "Strategy", "Horror", "Indie", "Puzzle", "Shooter", "Adventure", "Sports", "Simulation", "Fighting", "Racing"];
const PLATFORMS = ["PC", "PlayStation", "Xbox", "Nintendo", "Mobile"];

export default function Settings() {
  const { user, userProfile } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);

  // Profile
  const [displayName, setDisplayName] = useState(userProfile?.displayName || "");
  const [bio, setBio] = useState(userProfile?.bio || "");
  const [avatar, setAvatar] = useState(userProfile?.avatar || "");
  const [genres, setGenres] = useState(userProfile?.preferences?.genres || []);
  const [platforms, setPlatforms] = useState(userProfile?.preferences?.platforms || []);
  const fileInputRef = useRef(null);

  // Account
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Prefs
  const [defaultStatus, setDefaultStatus] = useState("wantToPlay");
  const [showSpoilers, setShowSpoilers] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);

  if (!user || !userProfile) return null;

  const toggleSelection = (item, list, setList) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleAvatarSelect = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onloadend = () => {
          setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
       e.preventDefault();
       setLoading(true);
       try {
           const userRef = doc(db, "users", user.uid);
           await updateDoc(userRef, {
               displayName,
               bio,
               avatar,
               "preferences.genres": genres,
               "preferences.platforms": platforms
           });
           addToast("Profile updated ✓", "success");
       } catch (err) {
           console.error("Error updating profile:", err);
           addToast("Failed to update profile", "error");
       } finally {
           setLoading(false);
       }
  };

  const handleUpdatePassword = async (e) => {
       e.preventDefault();
       if (newPassword !== confirmPassword) {
           addToast("Passwords do not match", "error");
           return;
       }
       if (newPassword.length < 6) {
           addToast("Password must be at least 6 characters", "error");
           return;
       }
       
       setLoading(true);
       try {
           const credential = EmailAuthProvider.credential(user.email, currentPassword);
           await reauthenticateWithCredential(user, credential);
           await updatePassword(user, newPassword);
           addToast("Password updated successfully", "success");
           setCurrentPassword("");
           setNewPassword("");
           setConfirmPassword("");
       } catch (err) {
           console.error("Error updating password:", err);
           if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
               addToast("Incorrect current password", "error");
           } else {
               addToast("Failed to update password", "error");
           }
       } finally {
           setLoading(false);
       }
  };

  const handleDeleteAccount = () => {
       const confirmWord = window.prompt("Type DELETE to confirm account deletion:");
       if (confirmWord === "DELETE") {
           addToast("Account deletion is disabled for demo.", "info");
       }
  };

  const isGoogleAuth = user.providerData.some(p => p.providerId === 'google.com');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-[72px] pb-24">
         <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-12 flex flex-col md:flex-row gap-12">
              
              {/* SIDEBAR */}
              <div className="w-full md:w-64 shrink-0">
                   <div className="flex items-center gap-4 mb-8">
                       <div className="w-16 h-16 rounded-full bg-[#222] overflow-hidden border border-[#333]">
                           {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : null}
                       </div>
                       <div>
                           <div className="font-bold text-[16px]">{displayName || `@${userProfile.username}`}</div>
                           <div className="text-[12px] text-[var(--text-muted)]">@{userProfile.username}</div>
                       </div>
                   </div>

                   <nav className="flex flex-col gap-2">
                       {[
                           { id: "profile", icon: <FaUser />, label: "Edit Profile" },
                           { id: "account", icon: <FaLock />, label: "Account" },
                           { id: "preferences", icon: <FaCog />, label: "Preferences" },
                           { id: "notifications", icon: <FaBell />, label: "Notifications" },
                       ].map(tab => (
                           <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id)}
                              className={`flex items-center gap-3 px-4 py-3 rounded-[10px] text-[14px] font-bold transition-all ${
                                  activeTab === tab.id 
                                      ? 'bg-[#161616] text-white border-l-[3px] border-[var(--accent)]' 
                                      : 'text-[var(--text-muted)] hover:bg-[#111] hover:text-white border-l-[3px] border-transparent'
                              }`}
                           >
                               <span className="opacity-70">{tab.icon}</span>
                               {tab.label}
                           </button>
                       ))}
                   </nav>
              </div>

              {/* CONTENT */}
              <div className="flex-1 bg-[#111] border border-[#1e1e1e] rounded-2xl p-6 md:p-10">
                   
                   {activeTab === 'profile' && (
                       <div className="animate-fade-in">
                           <h2 className="font-syne text-[28px] font-bold mb-8">Edit Profile</h2>
                           
                           <form onSubmit={handleSaveProfile} className="space-y-8">
                               {/* Avatar */}
                               <div className="flex items-center gap-6 pb-8 border-b border-[#1e1e1e]">
                                    <div className="w-24 h-24 rounded-full bg-[#222] overflow-hidden border border-[#333] shrink-0 relative group">
                                         {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : null}
                                         <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                             <FaCamera size={20} className="text-white" />
                                         </div>
                                    </div>
                                    <div>
                                         <div className="font-bold text-[14px] mb-2">Profile Picture</div>
                                         <p className="text-[12px] text-[var(--text-muted)] max-w-sm leading-relaxed mb-4">
                                            We recommend an image of at least 200x200px. Store as base64 for this demo.
                                         </p>
                                         <div className="flex gap-3">
                                             <button 
                                                 type="button" 
                                                 onClick={() => fileInputRef.current?.click()}
                                                 className="px-4 py-2 bg-[#161616] border border-[#2a2a2a] rounded-lg text-[12px] font-bold transition-colors hover:border-[#444]"
                                             >
                                                Upload New
                                             </button>
                                             {avatar && (
                                                 <button 
                                                     type="button" 
                                                     onClick={() => setAvatar("")}
                                                     className="px-4 py-2 bg-transparent text-[#ff4757] text-[12px] font-bold transition-colors hover:bg-[rgba(255,71,87,0.1)] rounded-lg"
                                                 >
                                                    Remove
                                                 </button>
                                             )}
                                         </div>
                                         <input type="file" ref={fileInputRef} onChange={handleAvatarSelect} accept="image/*" className="hidden" />
                                    </div>
                               </div>

                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                   <div className="flex flex-col gap-2">
                                       <label className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.1em] font-medium">Display Name</label>
                                       <input
                                           type="text"
                                           value={displayName}
                                           onChange={(e) => setDisplayName(e.target.value)}
                                           className="bg-[#161616] border border-[#2a2a2a] rounded-lg h-12 px-4 text-[14px] focus:outline-none focus:border-[var(--accent)] transition-all"
                                       />
                                   </div>
                                   <div className="flex flex-col gap-2">
                                       <label className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.1em] font-medium">Username</label>
                                       <div className="relative">
                                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">@</span>
                                           <input
                                               type="text"
                                               value={userProfile.username}
                                               disabled
                                               className="bg-[#1a1a1a] border border-[#222] rounded-lg h-12 pl-8 pr-4 w-full text-[14px] text-[#666] cursor-not-allowed"
                                           />
                                       </div>
                                       <p className="text-[11px] text-[#666] mt-1">Username cannot be changed in this demo.</p>
                                   </div>
                               </div>

                               <div className="flex flex-col gap-2">
                                   <label className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.1em] font-medium">Bio</label>
                                   <textarea
                                       value={bio}
                                       onChange={(e) => setBio(e.target.value)}
                                       maxLength={160}
                                       className="bg-[#161616] border border-[#2a2a2a] rounded-lg min-h-[100px] p-4 text-[14px] focus:outline-none focus:border-[var(--accent)] transition-all resize-none"
                                   />
                                   <div className="text-right text-[11px] text-[#555]">{bio.length}/160</div>
                               </div>

                               <div className="border-t border-[#1e1e1e] pt-8">
                                    <h4 className="font-syne text-[18px] font-bold mb-4">Gaming Preferences</h4>
                                    
                                    <div className="mb-6">
                                        <label className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.1em] font-medium mb-3 block">Favourite Genres</label>
                                        <div className="flex flex-wrap gap-2">
                                            {GENRES.map(genre => (
                                                <button
                                                    key={genre}
                                                    type="button"
                                                    onClick={() => toggleSelection(genre, genres, setGenres)}
                                                    className={`px-4 py-1.5 rounded-full text-[12px] border transition-all ${
                                                    genres.includes(genre) 
                                                        ? 'bg-[var(--accent)] text-black border-[var(--accent)] font-medium' 
                                                        : 'bg-[#161616] text-[var(--text-muted)] border-[#2a2a2a] hover:border-[#666]'
                                                    }`}
                                                >
                                                    {genre}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.1em] font-medium mb-3 block">Platforms</label>
                                        <div className="flex flex-wrap gap-2">
                                            {PLATFORMS.map(platform => (
                                                <button
                                                    key={platform}
                                                    type="button"
                                                    onClick={() => toggleSelection(platform, platforms, setPlatforms)}
                                                    className={`px-4 py-1.5 rounded-full text-[12px] border transition-all ${
                                                    platforms.includes(platform) 
                                                        ? 'bg-[var(--accent)] text-black border-[var(--accent)] font-medium' 
                                                        : 'bg-[#161616] text-[var(--text-muted)] border-[#2a2a2a] hover:border-[#666]'
                                                    }`}
                                                >
                                                    {platform}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                               </div>

                               <div className="flex justify-end pt-4">
                                   <button 
                                      type="submit"
                                      disabled={loading}
                                      className="h-12 px-8 bg-[var(--accent)] text-black font-syne font-bold rounded-lg transition-all hover:brightness-105"
                                   >
                                       {loading ? "Saving..." : "Save Changes"}
                                   </button>
                               </div>
                           </form>
                       </div>
                   )}

                   {activeTab === 'account' && (
                       <div className="animate-fade-in space-y-12">
                            <div>
                                <h2 className="font-syne text-[28px] font-bold mb-2">Account Details</h2>
                                <p className="text-[var(--text-muted)] text-[14px]">Manage your email and password.</p>
                            </div>

                            <div className="flex flex-col gap-2 max-w-md">
                               <label className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.1em] font-medium">Email Address</label>
                               <input
                                   type="email"
                                   value={user.email}
                                   disabled
                                   className="bg-[#1a1a1a] border border-[#222] rounded-lg h-12 px-4 text-[14px] text-[#666] cursor-not-allowed"
                               />
                               {isGoogleAuth && <p className="text-[11px] text-[var(--accent)] mt-1">Managed via Google Sign-In</p>}
                            </div>

                            {!isGoogleAuth && (
                                <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md border-t border-[#1e1e1e] pt-8">
                                    <h3 className="font-bold text-[16px] mb-4">Change Password</h3>
                                    
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.1em] font-medium">Current Password</label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            required
                                            className="bg-[#161616] border border-[#2a2a2a] rounded-lg h-12 px-4 text-[14px] focus:border-[var(--accent)] focus:outline-none"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.1em] font-medium">New Password</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            className="bg-[#161616] border border-[#2a2a2a] rounded-lg h-12 px-4 text-[14px] focus:border-[var(--accent)] focus:outline-none"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2 mb-4">
                                        <label className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.1em] font-medium">Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="bg-[#161616] border border-[#2a2a2a] rounded-lg h-12 px-4 text-[14px] focus:border-[var(--accent)] focus:outline-none"
                                        />
                                    </div>
                                    <button 
                                      type="submit"
                                      disabled={loading}
                                      className="h-10 px-6 bg-[#222] border border-[#333] hover:border-[#555] text-white font-bold rounded-lg text-[13px] transition-colors"
                                    >
                                        {loading ? "Updating..." : "Update Password"}
                                    </button>
                                </form>
                            )}

                            {/* Danger Zone */}
                            <div className="border-t border-red-500/20 pt-8 mt-12">
                                <h3 className="font-bold text-[16px] text-[#ff4757] mb-2 flex items-center gap-2"><FaTrash /> Danger Zone</h3>
                                <p className="text-[13px] text-[var(--text-muted)] mb-6 leading-relaxed max-w-md">
                                    Once you delete your account, there is no going back. Please be certain.
                                </p>
                                <button 
                                   onClick={handleDeleteAccount}
                                   className="h-10 px-6 bg-transparent border border-[#ff4757] text-[#ff4757] font-bold rounded-lg text-[13px] hover:bg-[rgba(255,71,87,0.1)] transition-colors"
                                >
                                    Delete Account
                                </button>
                            </div>
                       </div>
                   )}

                   {(activeTab === 'preferences' || activeTab === 'notifications') && (
                       <div className="animate-fade-in space-y-8 max-w-lg">
                            <h2 className="font-syne text-[28px] font-bold mb-8 capitalize">{activeTab}</h2>
                            
                            {activeTab === 'preferences' && (
                                <>
                                <div className="space-y-4">
                                    <div>
                                        <div className="font-bold text-[14px] mb-1">Default Shelf Status</div>
                                        <div className="text-[12px] text-[var(--text-muted)] mb-3">What status should a game get when you click "Add to Shelf"?</div>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { id: 'wantToPlay', label: "Want to Play" },
                                                { id: 'played', label: "Played" },
                                                { id: 'playing', label: "Playing" }
                                            ].map(s => (
                                                <button
                                                    key={s.id}
                                                    onClick={() => setDefaultStatus(s.id)}
                                                    className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all border-2 ${
                                                        defaultStatus === s.id 
                                                            ? 'border-[var(--accent)] bg-[rgba(232,255,71,0.05)] text-white' 
                                                            : 'border-[#2a2a2a] bg-[#161616] text-[#666] hover:border-[#444]'
                                                    }`}
                                                >
                                                    {s.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="border-t border-[#1e1e1e] pt-6 flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-[14px]">Show Spoiler Reviews</div>
                                        <div className="text-[12px] text-[var(--text-muted)]">Don't blur out reviews marked as spoilers.</div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={showSpoilers} onChange={() => setShowSpoilers(!showSpoilers)} />
                                        <div className="w-11 h-6 bg-[#2a2a2a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#888] peer-checked:after:bg-black after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                                    </label>
                                </div>
                                </>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="border-b border-[#1e1e1e] pb-6 flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-[14px]">Email Notifications</div>
                                        <div className="text-[12px] text-[var(--text-muted)] max-w-[280px] mt-1">Receive emails when someone replies to your debate or review.</div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} />
                                        <div className="w-11 h-6 bg-[#2a2a2a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#888] peer-checked:after:bg-black after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                                    </label>
                                </div>
                            )}

                       </div>
                   )}
              </div>
         </div>
    </div>
  );
}
