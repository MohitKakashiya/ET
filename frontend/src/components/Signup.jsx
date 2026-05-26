import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupStyles as ss } from "../assets/dummyStyles.js";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import axios from "axios";

const Signup = ({ API_URL = "http://localhost:4000", onSignup }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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

  //to valiate the form
  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //to signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/user/register`,
        { name, email, password },
        { headers: { "Content-Type": "application/json" } },
      );
      const data = res.data || {};
      const token = data.token ?? null;
      let profile = data.user ?? null;
      if (!profile) {
        // check for any extra fields returned that could be user info
        const copy = { ...data };
        delete copy.token;
        delete copy.user;
        if (Object.keys(copy).length) profile = copy;
      }

      if (!profile && token) {
        try {
          profile = await fetchProfile(token);
        } catch (fetchErr) {
          console.warn("Could not fetch profile after signup token:", fetchErr);
          profile = null;
        }
      }

      if (!profile) profile = { name, email };
      persistAuth(profile, token);
      if (typeof onSignup === "function") {
        try {
          onSignup(profile, rememberMe, token);
        } catch (callErr) {
          console.warn("onSignup threw:", callErr);
          navigate("/");
        }
      } else {
        navigate("/");
      }
      setPassword("");
    } catch (err) {
      console.error("Signup error:", err?.response || err);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setErrors({ api: err.response.data.message });
      } else {
        setErrors({ api: err.message || "An unexpected error occurred" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={ss.pageContainer}>
      <div className={ss.cardContainer}>
        <div className={ss.header}>
          <button onClick={() => navigate(-1)} className={ss.backButton}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className={ss.avatar}>
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className={ss.headerTitle}>Create Account</h1>
          <p className={ss.headerSubtitle}>
            Join MyRevenue to manage your finances!
          </p>
        </div>
        <div className={ss.formContainer}>
          {errors.api && <p className={ss.apiError}>{errors.api}</p>}
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-6">
              <label htmlFor="name" className={ss.label}>
                Full Name
              </label>
              <div className={ss.inputContainer}>
                <div className={ss.inputIcon}>
                  <User className="w-5 h-5" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`${ss.input},${errors.name ? "border-red-300" : "border-gray-200"}`}
                  placeholder="Enter your full name e.g. John Doe"
                />
              </div>
              {errors.name && <p className={ss.fieldError}>{errors.name}</p>}
            </div>
            <div className="mb-6">
              <label htmlFor="email" className={ss.label}>
                Email Address
              </label>
              <div className={ss.inputContainer}>
                <div className={ss.inputIcon}>
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${ss.input},${errors.email ? "border-red-300" : "border-gray-200"}`}
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && <p className={ss.fieldError}>{errors.email}</p>}
            </div>
            <div className="mb-6">
              <label htmlFor="password" className={ss.label}>
                Password
              </label>
              <div className={ss.inputContainer}>
                <div className={ss.inputIcon}>
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${ss.passwordInput},${errors.password ? "border-red-300" : "border-gray-200"}`}
                  placeholder="Enter your password e.g. ********"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={ss.passwordToggle}
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className={ss.fieldError}>{errors.password}</p>
              )}
            </div>
            <div className={ss.checkboxContainer}>
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={ss.checkbox}
              />
              <label htmlFor="remember" className={ss.checkboxLabel}>
                Remember Me
              </label>
            </div>
            <button
              type="submit"
              className={`${ss.button} ${isLoading ? ss.buttonDisabled : ""}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className={ss.spinner}
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2-647z"
                    ></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
          <div className={ss.signInContainer}>
            <p className={ss.signInText}>
              Already have an account?{' '}
              <Link to="/login" className={ss.signInLink}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
