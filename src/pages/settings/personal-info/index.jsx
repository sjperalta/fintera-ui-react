import { useState, useEffect, useContext, useCallback } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "../../../contexts/LocaleContext";
import { useToast } from "../../../contexts/ToastContext";
import AuthContext from "../../../contexts/AuthContext";
import { API_URL } from "../../../../config";
import { getToken } from "../../../../auth";

import UserDetailsHeader from "../../../component/user/UserDetailsHeader";
import PersonalInfoCard from "../../../component/user/PersonalInfoCard";
import AccountActivityCard from "../../../component/user/AccountActivityCard";
import PersonalInfoForm from "../../../component/forms/PersonalInfoForm";

function PersonalInfo() {
  const { userId } = useParams();
  const { t } = useLocale();
  const { showToast } = useToast();
  const token = getToken();
  const { user: currentUser } = useContext(AuthContext);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Determine if credit score should be visible: Only show if an admin is viewing a different regular user profile
  const showCreditScore =
    currentUser?.role === "admin" &&
    user?.role === "user" &&
    currentUser?.id !== user?.id;

  // Sellers cannot edit other users' information (only their own profile)
  const canEditUser = currentUser?.role !== "seller" || Number(userId) === currentUser?.id;

  // Fetch User Data
  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/v1/users/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      setUser(data.user || data);
    } catch (err) {
      setError(err.message);
      showToast(t("errors.fetchUserFailed"), "error");
    } finally {
      setLoading(false);
    }
  }, [userId, token, t, showToast]);

  useEffect(() => {
    if (userId && token) {
      fetchUser();
    }
  }, [userId, token, fetchUser]);

  // Toggle User Status
  const toggleUserStatus = async () => {
    if (!user || !token) return;
    try {
      const response = await fetch(`${API_URL}/api/v1/users/${user.id}/toggle_status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Error toggling user status");

      const newStatus = user.status === "active" ? "inactive" : "active";
      setUser(prev => ({ ...prev, status: newStatus }));
      showToast(`${t("personalInfo.profileUpdated")}: ${newStatus}`, "success");
    } catch (error) {
      console.error("Error:", error);
      showToast(t("errors.updateUserFailed"), "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl text-red-500 font-bold mb-2">{t("personalInfo.errorLoadingProfile")}</h3>
        <p className="text-bgray-600 dark:text-bgray-400">{error}</p>
        <button onClick={fetchUser} className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg">{t("personalInfo.retry")}</button>
      </div>
    );
  }

  return (
    <div id="tab1" className="tab-pane active w-full">
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="edit-form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-bgray-900 dark:text-white">{t("personalInfo.editProfile")}</h2>
              <button
                onClick={() => {
                  setIsEditing(false);
                  fetchUser(); // Refresh data on cancel/back
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-darkblack-500 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors"
              >
                {t("common.cancel")}
              </button>
            </div>
            {/* Reuse existing form - pass userId */}
            <PersonalInfoForm userId={userId} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Header Section */}
            <div>
              <UserDetailsHeader
                user={user}
                toggleStatus={toggleUserStatus}
                onEdit={() => setIsEditing(true)}
                showActions={canEditUser}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <PersonalInfoCard user={user} delay={0.1} />
              <AccountActivityCard user={user} delay={0.2} showCreditScore={showCreditScore} />
            </div>

            {/* Temporary Edit Button if Header doesn't have it wired yet */}
            {canEditUser && (
              <div className="fixed bottom-8 right-8 z-50 xl:hidden">
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PersonalInfo;
