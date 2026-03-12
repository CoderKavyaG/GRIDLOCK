import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth, googleProvider } from "../firebase/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const returnUrl = location.state?.returnUrl || "/";

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Wrong password or email. Try again.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/too-many-requests":
        return "Too many attempts. Try again later.";
      case "auth/invalid-email":
        return "Invalid email address.";
      default:
        return "Failed to sign in. Please try again.";
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(returnUrl);
    } catch (err) {
        console.error("Login error:", err);
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate(returnUrl);
    } catch (err) {
      console.error("Google login error:", err);
      // Ignore "popup-closed-by-user" error usually
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Google sign-in failed. Please try again.");
      }
    } finally {
        setLoading(false);
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

          <h1 className="font-syne text-[42px] font-black leading-tight mb-2">Welcome back.</h1>
          <p className="text-[var(--text-muted)] text-[16px] mb-8">Your shelf is waiting.</p>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-[#111] h-12 rounded-lg font-semibold flex items-center justify-center gap-3 transition-transform hover:-translate-y-[1px] hover:bg-[#f0f0f0] disabled:opacity-70 disabled:hover:translate-y-0"
          >
            <FcGoogle size={20} />
            Continue with Google
          </button>

          <div className="flex items-center my-8 text-[var(--text-muted)] text-[12px] uppercase tracking-wider">
            <div className="flex-1 h-px bg-[#2a2a2a]"></div>
            <span className="px-4">or continue with email</span>
            <div className="flex-1 h-px bg-[#2a2a2a]"></div>
          </div>

          <form onSubmit={handleEmailLogin} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[12px] text-[var(--text-muted)] uppercase tracking-[0.1em] font-medium">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="bg-[#111] border border-[#2a2a2a] rounded-lg h-12 px-4 text-[15px] focus:outline-none focus:border-[var(--accent)] focus:ring-[3px] focus:ring-[rgba(232,255,71,0.1)] transition-all placeholder:text-[#444]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12px] text-[var(--text-muted)] uppercase tracking-[0.1em] font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="bg-[#111] border border-[#2a2a2a] rounded-lg h-12 px-4 w-full text-[15px] focus:outline-none focus:border-[var(--accent)] focus:ring-[3px] focus:ring-[rgba(232,255,71,0.1)] transition-all placeholder:text-[#444] pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666] hover:text-white transition-colors"
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
              <div className="text-right mt-1">
                <a href="#" className="text-[12px] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--accent)] text-black font-bold font-syne text-[15px] h-12 rounded-lg mt-2 transition-all hover:brightness-105 disabled:opacity-70 disabled:hover:brightness-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                "Sign In →"
              )}
            </button>
            
            {error && (
              <div className="bg-[rgba(255,71,87,0.1)] border border-[rgba(255,71,87,0.3)] rounded-md p-3 text-[#ff4757] text-[13px] mt-2">
                {error}
              </div>
            )}
          </form>

          <div className="mt-8 text-center text-[14px]">
            <span className="text-[var(--text-muted)]">New here? </span>
            <Link to="/signup" className="text-[var(--accent)] hover:underline">
              Join Free →
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL (Desktop only) */}
      <div className="hidden lg:flex w-[45%] bg-[#111] relative overflow-hidden flex-col items-center justify-center p-12">
        {/* Placeholder for scroll of blurred game cover art */}
        <div className="absolute inset-0 grid grid-cols-3 gap-4 p-4 opacity-30 transform rotate-12 scale-125 pointer-events-none">
            {/* Generate some dummy game covers */}
            {Array.from({length: 15}).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-[#222] rounded-lg animate-pulse" style={{animationDelay: `${i * 0.1}s`}}></div>
            ))}
        </div>
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative z-10 text-center max-w-md">
          <h2 className="font-syne text-[28px] font-bold text-white mb-4">
            "100,000 gamers have opinions."
          </h2>
          <p className="text-[var(--text-muted)] text-[16px]">
            Be one of them.
          </p>
        </div>
      </div>
    </div>
  );
}
