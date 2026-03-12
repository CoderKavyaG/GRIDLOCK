import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db, googleProvider } from "../firebase/firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const GENRES = ["RPG", "Action", "Strategy", "Horror", "Indie", "Puzzle", "Shooter", "Adventure", "Sports", "Simulation", "Fighting", "Racing"];
const PLATFORMS = ["PC", "PlayStation", "Xbox", "Nintendo", "Mobile"];

export default function Signup() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Step 1
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(null); // null, true, false
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Step 3
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);

  // Check username availability
  useEffect(() => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const checkAvailability = async () => {
      setCheckingUsername(true);
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username.toLowerCase()));
        const querySnapshot = await getDocs(q);
        
        setUsernameAvailable(querySnapshot.empty);
      } catch (err) {
        console.error("Error checking username:", err);
      } finally {
        setCheckingUsername(false);
      }
    };

    const debounceTimer = setTimeout(checkAvailability, 500);
    return () => clearTimeout(debounceTimer);
  }, [username]);

  const handleUsernameChange = (e) => {
    let val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(val);
  };

  const getPasswordStrength = () => {
    if (password.length === 0) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const passwordStrength = getPasswordStrength();

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleStep2Submit = (e) => {
    e.preventDefault();
    if (username.length < 3 || username.length > 20) {
      setError("Username must be between 3 and 20 characters");
      return;
    }
    if (usernameAvailable === false) {
      setError("Username is already taken");
      return;
    }
    setError("");
    setStep(3);
  };

  const toggleSelection = (item, list, setList) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Create user profile in Firestore
      const userProfile = {
        uid: user.uid,
        email: user.email,
        displayName: displayName || username,
        username: username.toLowerCase(),
        avatar: "", // Add default later
        bio: "",
        joinedAt: new Date().toISOString(),
        gamesPlayed: 0,
        gamesWantToPlay: 0,
        gamesDropped: 0,
        preferences: {
          genres: selectedGenres,
          platforms: selectedPlatforms
        }
      };

      await setDoc(doc(db, "users", user.uid), userProfile);
      
      // 3. Redirect
      navigate("/profile"); // TODO: Add toast

    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user document already exists
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
          // Pre-populate step 2 info
          setEmail(user.email);
          setDisplayName(user.displayName || "");
          setUsername(user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, ""));
          setStep(2); // Skip Step 1 since we have auth
      } else {
          // User already exists, log them in
          navigate("/");
      }
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Google sign-up failed.");
      }
    }
  };


  return (
    <div className="min-h-screen flex text-white bg-[#0a0a0a]">
      {/* LEFT PANEL */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center items-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-[400px] flex flex-col pt-8 pb-12">
            
          <Link to="/" className="inline-block mb-12">
              <span className="font-syne text-2xl font-bold tracking-tight">GRIDLOCK</span>
          </Link>

          {/* Step Indicator */}
          <div className="flex gap-2 mb-8 items-center justify-center">
            {[1, 2, 3].map(i => (
              <div 
                key={i} 
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  step === i ? 'bg-[var(--accent)] scale-125' : 
                  step > i ? 'border border-[var(--accent)] bg-transparent' : 'bg-[#333]'
                }`}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="animate-fade-in">
              <h1 className="font-syne text-[32px] font-black leading-tight mb-8">Create your account.</h1>

              <button
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full bg-white text-[#111] h-12 rounded-lg font-semibold flex items-center justify-center gap-3 transition-transform hover:-translate-y-[1px] hover:bg-[#f0f0f0] disabled:opacity-70 disabled:hover:translate-y-0"
              >
                <FcGoogle size={20} />
                Sign up with Google
              </button>

              <div className="flex items-center my-6 text-[var(--text-muted)] text-[12px] uppercase tracking-wider">
                <div className="flex-1 h-px bg-[#2a2a2a]"></div>
                <span className="px-4">or with email</span>
                <div className="flex-1 h-px bg-[#2a2a2a]"></div>
              </div>

              <form onSubmit={handleStep1Submit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.1em] font-medium">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="bg-[#111] border border-[#2a2a2a] rounded-lg h-12 px-4 text-[15px] focus:outline-none focus:border-[var(--accent)] transition-all placeholder:text-[#444]"
                  />
                </div>

                <div className="flex flex-col gap-1.5 ">
                  <label className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.1em] font-medium">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="bg-[#111] border border-[#2a2a2a] rounded-lg h-12 px-4 w-full text-[15px] focus:outline-none focus:border-[var(--accent)] transition-all placeholder:text-[#444] pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666] hover:text-white"
                    >
                      {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                    </button>
                  </div>
                  {/* Strength indicator */}
                  {password && (
                    <div className="h-1.5 w-full bg-[#222] rounded-full mt-1.5 overflow-hidden flex">
                      <div className={`h-full transition-all duration-300 ${
                        passwordStrength <= 1 ? 'w-1/3 bg-[#ff4757]' : 
                        passwordStrength === 2 ? 'w-2/3 bg-[#ffa502]' : 'w-full bg-[#2ed573]'
                      }`}></div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.1em] font-medium">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="bg-[#111] border border-[#2a2a2a] rounded-lg h-12 px-4 text-[15px] focus:outline-none focus:border-[var(--accent)] transition-all placeholder:text-[#444]"
                  />
                </div>

                {error && <div className="text-[#ff4757] text-[13px]">{error}</div>}

                <button type="submit" className="w-full bg-[var(--accent)] text-black font-bold font-syne h-12 rounded-lg mt-4 hover:brightness-105 transition-all">
                  Continue →
                </button>
              </form>

              <div className="mt-8 text-center text-[14px]">
                <span className="text-[var(--text-muted)]">Already have an account? </span>
                <Link to="/login" className="text-[var(--accent)] hover:underline">Sign In →</Link>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <button 
                onClick={() => setStep(1)} 
                className="text-[12px] text-[var(--text-muted)] hover:text-white mb-6 flex gap-1 items-center"
              >
                ← Back
              </button>
              <h1 className="font-syne text-[32px] font-black leading-tight mb-2">What should we call you?</h1>
              <p className="text-[var(--text-muted)] text-[14px] mb-8">Set up your profile details.</p>

              <form onSubmit={handleStep2Submit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.1em] font-medium">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name or nickname (Optional)"
                    className="bg-[#111] border border-[#2a2a2a] rounded-lg h-12 px-4 text-[15px] focus:outline-none focus:border-[var(--accent)] transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.1em] font-medium flex justify-between">
                    <span>Username*</span>
                    {checkingUsername ? (
                      <span className="text-[#888]">Checking...</span>
                    ) : usernameAvailable === true ? (
                      <span className="text-[#2ed573]">Available ✓</span>
                    ) : usernameAvailable === false ? (
                      <span className="text-[#ff4757]">Taken ✗</span>
                    ) : null}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] select-none">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={handleUsernameChange}
                      required
                      placeholder="username"
                      className={`bg-[#111] border rounded-lg h-12 pl-8 pr-4 w-full text-[15px] focus:outline-none transition-all ${
                        usernameAvailable === false ? 'border-[#ff4757] focus:border-[#ff4757]' : 'border-[#2a2a2a] focus:border-[var(--accent)]'
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">Lowercase letters, numbers, and underscores only. 3-20 chars.</p>
                </div>

                {error && <div className="text-[#ff4757] text-[13px]">{error}</div>}

                <button 
                  type="submit" 
                  disabled={usernameAvailable === false || username.length < 3}
                  className="w-full bg-[var(--accent)] text-black font-bold font-syne h-12 rounded-lg mt-4 transition-all hover:brightness-105 disabled:opacity-50 disabled:grayscale"
                >
                  Continue →
                </button>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in w-full max-w-[440px] -mx-4">
               <button 
                onClick={() => setStep(2)} 
                className="text-[12px] text-[var(--text-muted)] hover:text-white mb-6 flex gap-1 items-center px-4"
              >
                ← Back
              </button>
              <div className="px-4">
                <h1 className="font-syne text-[32px] font-black leading-tight mb-2">What do you play?</h1>
                <p className="text-[var(--text-muted)] text-[14px] mb-8">Pick your favorites. We'll personalize your experience.</p>
              </div>

              <form onSubmit={handleFinalSubmit} className="flex flex-col gap-8 px-4">
                
                <div>
                  <h3 className="text-[12px] uppercase tracking-[0.1em] text-[var(--text-muted)] mb-3">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {GENRES.map(genre => (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => toggleSelection(genre, selectedGenres, setSelectedGenres)}
                        className={`px-4 py-2 rounded-full text-[13px] border transition-all ${
                          selectedGenres.includes(genre) 
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
                  <h3 className="text-[12px] uppercase tracking-[0.1em] text-[var(--text-muted)] mb-3">Platforms</h3>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map(platform => (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => toggleSelection(platform, selectedPlatforms, setSelectedPlatforms)}
                        className={`px-4 py-2 rounded-full text-[13px] border transition-all ${
                          selectedPlatforms.includes(platform) 
                            ? 'bg-[var(--accent)] text-black border-[var(--accent)] font-medium' 
                            : 'bg-[#161616] text-[var(--text-muted)] border-[#2a2a2a] hover:border-[#666]'
                        }`}
                      >
                        {platform}
                      </button>
                    ))}
                  </div>
                </div>

                {error && <div className="text-[#ff4757] text-[13px]">{error}</div>}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[var(--accent)] text-black font-bold font-syne h-12 rounded-lg mt-2 transition-all hover:brightness-105 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                      Creating Account...
                    </>
                  ) : (
                    "Create Account →"
                  )}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="hidden lg:flex w-[45%] bg-[#111] relative overflow-hidden flex-col items-center justify-center p-12">
        {/* Abstract background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#111] via-[#1a1a1a] to-black"></div>
        <div className="absolute top-[20%] right-[10%] w-64 h-64 bg-[var(--accent)] rounded-full mix-blend-overlay filter blur-[120px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-[20%] left-[10%] w-80 h-80 bg-[#a855f7] rounded-full mix-blend-overlay filter blur-[100px] opacity-10"></div>
        
        {/* Overlay grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        <div className="relative z-10 text-center max-w-md">
          <h2 className="font-syne text-[36px] font-bold text-white mb-2 leading-tight">
            Track. Review. <br/>
            <span className="text-[var(--accent)]">Debate.</span>
          </h2>
          <p className="text-[var(--text-muted)] text-[16px]">
            Join the community built for gamers who actually play games.
          </p>
        </div>
      </div>
    </div>
  );
}
