import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUserWithToken } from "./api";

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
  }

  return (
    <div className="util-container">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <button
          onClick={handleCreateGroupClick}
          className="util-button"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            color: "#fff",
            border: "none",
            cursor: currentUser ? "pointer" : "not-allowed",
            margin: "10px",
            padding: "0px",
            backgroundColor: currentUser ? "#007bff" : "#ccc",
          }}
          disabled={!currentUser}
        >
          <svg
            className="createGroupButton"
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#FFFFFF"
          >
            <path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T440-640q0-33-23.5-56.5T360-720q-33 0-56.5 23.5T280-640q0 33 23.5 56.5T360-560Zm0 320Zm0-400Z" />
          </svg>
        </button>
      )}
      <button
          onClick={handleLogoutClick}
          className="util-button"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            margin: "10px",
            padding: "0px",
            backgroundColor: "#007bff",
          }}
          >
            <svg className="logoutButton" xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#FFFFFF"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/></svg>
          </button>
    </div>
  );
};

export default ChatUtil;
