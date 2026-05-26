import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginStyles as ls } from "../assets/dummyStyles.js";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import axios from "axios";

const Login = ({ onLogin, API_URL = "https://myrevenue-backend.onrender.com" }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  //to fetch profile

  const fetchProfile = async (token) => {
    if (!token) return null;
    const res = await axios.get(`${API_URL}/api/user/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  };
  const persistAuth = (profile, token) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    try {
      if (profile) storage.setItem("user", JSON.stringify(profile));
      if (token) storage.setItem("token", token);
    } catch (err) {
      console.error("Error persisting auth data:", err);
    }
  };

  //to login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${API_URL}/api/user/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } },
      );
      const data = res.data || {};
      const token = data.token || null;

      //to drive the profile from token
      let profile = data.user ?? null;
      if (!profile) {
        const copy = { ...data };
        delete copy.token;
        delete copy.user;
        if (Object.keys(copy).length > 0) {
          profile = copy;
        }
      }
      if (token && !profile) {
        try {
          profile = await fetchProfile(token);
        } catch (err) {
          console.warn("Error fetching profile after login:", err);
          profile = { email };
        }
      }
      if (!profile) profile = { email };
      persistAuth(profile, token);
      if (typeof onLogin === "function") {
        try {
          onLogin(profile, token, rememberMe);
        } catch (err) {
          console.warn("Error in onLogin callback:", err);
          navigate("/");
        }
      } else {
        navigate("/");
      }
      setPassword("");
    } catch (err) {
      console.error("Login error:", err?.response || err);
      const serverMsg =
        err.response?.data?.message ||
        (err.response?.data ? JSON.stringify(err.response.data) : null) ||
        err.message ||
        "Login failed";
      setError(serverMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={ls.pageContainer}>
      <div className={ls.cardContainer}>
        <div className={ls.header}>
          <div className={ls.avatar}>
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className={ls.headerTitle}>Welcome Back!</h1>
          <p className={ls.headerSubtitle}>
            Sign into your one and only MyRevenue Account
          </p>
        </div>
        <div className={ls.formContainer}>
          {error && (
            <div className={ls.errorContainer}>
              <div className={ls.errorIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className={ls.errorText}>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className={ls.label}>
                Email Address
              </label>
              <div className={ls.inputContainer}>
                <div className={ls.inputIcon}>
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  id="email"
                  className={ls.input}
                  placeholder="Enter your email e.g: john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mb-6">
              <label htmlFor="password" className={ls.label}>
                Password
              </label>
              <div className={ls.inputContainer}>
                <div className={ls.inputIcon}>
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className={ls.passwordInput}
                  placeholder="Enter your password eg: ********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={ls.passwordToggle}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div className={ls.checkboxContainer}>
              <input
                type="checkbox"
                id="remember"
                className={ls.checkbox}
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                required
              />
              <label htmlFor="remember" className={ls.checkboxLabel}>
                Remember Me
              </label>
            </div>
            <button
              type="submit"
              className={`${ls.button} ${isLoading ? ls.buttonDisabled : ""}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className={ls.spinner}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
          <div className={ls.signUpContainer}>
            <p className={ls.signUpText}>
              Don't have an account?{" "}
              <Link to="/signup" className={ls.signUpLink}>
                Create One
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
