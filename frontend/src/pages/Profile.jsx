import React, { useCallback, useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { profileStyles as ps } from "../assets/dummyStyles.js";
import Modal from "react-modal";
import { Eye, EyeOff, Lock, User, X } from "lucide-react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const BASE_URL = "https://myrevenue-backend.onrender.com/api";

Modal.setAppElement("#root");

const PasswordInput = memo(
  ({ name, label, value, error, showField, onToggle, onChange, disabled }) => (
    <div>
      <label className={ps.passwordLabel}>{label}</label>
      <div className={ps.passwordContainer}>
        <input
          type={showField ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          className={`${ps.inputWithError} ${
            error ? "border-red-300" : "border-gray-200"
          }`}
          placeholder={`Enter ${label.toLowerCase()}`}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={onToggle}
          className={ps.passwordToggle}
          disabled={disabled}
        >
          {showField ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {error && <p className={ps.errorText}>{error}</p>}
    </div>
  ),
);

PasswordInput.displayName = "PasswordInput";

const Profile = ({ onUpdateProfile, onLogout }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState({ name: "", email: "", joinDate: "" });
  const [editMode, setEditMode] = useState(false);
  const [tempUser, setTempUser] = useState({ name: "", email: "", joinDate: "" });
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [passwordErrors, setPasswordErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const getAuthToken = useCallback(() => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  }, []);

  const saveUserToStorage = (updatedUser) => {
    if (localStorage.getItem("user")) {
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }

    if (sessionStorage.getItem("user")) {
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const handleApiRequest = useCallback(
    async (method, endpoint, body = null) => {
      const token = getAuthToken();

      if (!token) {
        navigate("/login");
        return null;
      }

      try {
        setLoading(true);

        const config = {
          method,
          url: `${BASE_URL}${endpoint}`,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        };

        if (body) {
          config.data = body;
        }

        const response = await axios(config);
        return response.data;
      } catch (err) {
        console.error("API request error:", err.response?.data || err.message);

        if (err.response?.status === 401) {
          navigate("/login");
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthToken, navigate],
  );

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await handleApiRequest("get", "/user/me");

        if (data) {
          const userData = data.user || data.data || data;
          setUser(userData);
          setTempUser(userData);
        }
      } catch (err) {
        toast.error("Failed to load user data. Please try again.");
      }
    };

    fetchUserData();
  }, [handleApiRequest]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setTempUser((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handlePasswordChange = useCallback((e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const togglePasswordVisibility = useCallback((field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  }, []);

  const handleSaveProfile = async () => {
    try {
      const payload = {
        name: tempUser.name,
        email: tempUser.email,
      };

      const data = await handleApiRequest("put", "/user/profile", payload);

      if (data) {
        const updatedUser = data.user || data.data || data.updatedUser || data;

        setUser(updatedUser);
        setTempUser(updatedUser);
        saveUserToStorage(updatedUser);
        setEditMode(false);

        onUpdateProfile?.(updatedUser);
        toast.success("Profile updated successfully!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    }
  };

  const handleCancelEdit = useCallback(() => {
    setTempUser(user);
    setEditMode(false);
  }, [user]);

  const validatePassword = useCallback(() => {
    const errors = {};

    if (!passwordData.current) errors.current = "Current password is required";

    if (!passwordData.new) {
      errors.new = "New password is required";
    } else if (passwordData.new.length < 8) {
      errors.new = "Password must be at least 8 characters";
    }

    if (passwordData.new !== passwordData.confirm) {
      errors.confirm = "Passwords do not match";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  }, [passwordData]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword()) return;

    try {
      await handleApiRequest("put", "/user/password", {
        currentPassword: passwordData.current,
        newPassword: passwordData.new,
      });

      toast.success("Password changed successfully!");
      setShowPasswordModal(false);
      setPasswordData({ current: "", new: "", confirm: "" });
      setPasswordErrors({});
      setShowPassword({ current: false, new: false, confirm: false });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password.");
    }
  };

  const handleLogout = useCallback(() => {
    onLogout?.();
    navigate("/signup");
  }, [onLogout, navigate]);

  const closePasswordModal = useCallback(() => {
    if (!loading) {
      setShowPasswordModal(false);
      setPasswordData({ current: "", new: "", confirm: "" });
      setPasswordErrors({});
      setShowPassword({ current: false, new: false, confirm: false });
    }
  }, [loading]);

  return (
    <div className={ps.container}>
      <ToastContainer position="top-right" autoClose={2000} />

      <div className={ps.mainContainer}>
        <div className={ps.header}>
          <div className={ps.avatar}>
            <User className="w-12 h-12 text-white" />
          </div>

          <h1 className={ps.userName}>{user?.name || "Loading..."}</h1>
          <p className={ps.userEmail}>{user?.email || "Loading..."}</p>
        </div>

        <div className={ps.content}>
          <div className={ps.grid}>
            <div className={ps.card}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={ps.cardTitle}>
                  <User className={ps.icon} />
                  Profile Information
                </h2>

                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className={ps.editButton}
                    disabled={loading}
                  >
                    Edit
                  </button>
                )}
              </div>

              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <label className={ps.label}>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={tempUser.name || ""}
                      onChange={handleInputChange}
                      className={ps.input}
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className={ps.label}>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={tempUser.email || ""}
                      onChange={handleInputChange}
                      className={ps.input}
                      disabled={loading}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      className={ps.buttonPrimary}
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className={ps.buttonSecondary}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className={ps.label}>Full Name</p>
                    <p className="font-medium text-gray-800">
                      {user?.name || "Loading..."}
                    </p>
                  </div>

                  <div>
                    <p className={ps.label}>Email Address</p>
                    <p className="font-medium text-gray-800">
                      {user?.email || "Loading..."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className={ps.card}>
              <h2 className={ps.cardTitle}>
                <Lock className={ps.icon} />
                Account Security
              </h2>

              <div className="space-y-4">
                <div className={ps.securityItem}>
                  <div>
                    <p className={ps.securityText}>Password</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(true)}
                    className={ps.changeButton}
                    disabled={loading}
                  >
                    Change
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className={`${ps.buttonPrimary} mt-4 w-full hover:opacity-90 transition-opacity`}
                disabled={loading}
              >
                {loading ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showPasswordModal}
        onRequestClose={closePasswordModal}
        contentLabel="Change Password"
        className="modal"
        overlayClassName="modal-overlay"
        shouldCloseOnOverlayClick={!loading}
        shouldCloseOnEsc={!loading}
      >
        <div className={ps.modalContent}>
          <div className={ps.modalHeader}>
            <h3 className={ps.modalTitle}>Change Password</h3>

            <button
              type="button"
              onClick={closePasswordModal}
              className="text-gray-500 hover:text-gray-800 disabled:opacity-50"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 lg:-mx-20">
            <PasswordInput
              name="current"
              label="Current Password"
              value={passwordData.current}
              error={passwordErrors.current}
              showField={showPassword.current}
              onToggle={() => togglePasswordVisibility("current")}
              onChange={handlePasswordChange}
              disabled={loading}
            />

            <PasswordInput
              name="new"
              label="New Password"
              value={passwordData.new}
              error={passwordErrors.new}
              showField={showPassword.new}
              onToggle={() => togglePasswordVisibility("new")}
              onChange={handlePasswordChange}
              disabled={loading}
            />

            <PasswordInput
              name="confirm"
              label="Confirm New Password"
              value={passwordData.confirm}
              error={passwordErrors.confirm}
              showField={showPassword.confirm}
              onToggle={() => togglePasswordVisibility("confirm")}
              onChange={handlePasswordChange}
              disabled={loading}
            />

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className={ps.buttonPrimary}
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Password"}
              </button>

              <button
                type="button"
                onClick={closePasswordModal}
                className={ps.buttonSecondary}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
