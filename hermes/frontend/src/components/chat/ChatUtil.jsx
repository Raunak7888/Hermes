import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUserWithToken } from "../api/api";
import { Users, LogOut, Moon } from "lucide-react";
import ThemeToggle from "../util/ThemeToggle";

const ChatUtil = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const userId = await getCurrentUserWithToken();
        setCurrentUser(userId);
      } catch (error) {
        console.error("Error fetching current user:", error);
      } finally {
        setLoading(false);
      }
    };
    initializeUser();
  }, []);

  const handleCreateGroupClick = () => {
    if (currentUser) {
      navigate("/Group", { state: { currentUser } });
    } else {
      console.error("Current user is not available");
    }
  };

  const handleLogoutClick = () => {
    navigate("/logout");
  };

  const baseButtonStyle =
    "rounded-full w-10 h-10 flex items-center justify-center transition-colors";

  return (
    <div className="flex flex-col gap-3 p-2 items-center">
      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      ) : (
        <>
          {/* Group Button */}
          <button
            onClick={handleCreateGroupClick}
            className={`${baseButtonStyle} ${currentUser
                ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                : "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
              }`}
            disabled={!currentUser}
            title="Create Group"
          >
            <Users size={20} className="text-white" />
          </button>

          {/* Theme Toggle Button (dummy for now) */}
          <ThemeToggle/>

          {/* Logout Button */}
          <button
            onClick={handleLogoutClick}
            className={`${baseButtonStyle} bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700`}
            title="Logout"
          >
            <LogOut size={18} className="text-white" />
          </button>
        </>
      )}
    </div>
  );
};

export default ChatUtil;
