import React, { useState, useEffect, useCallback } from "react";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import WebSocketService from "./WebSocketService";
import ChatUtil from "./ChatUtil";

const Ok = () => {
  const [selectedUserId, setSelectedUserId] = useState(() => {
    const savedUserId = sessionStorage.getItem("selectedUserId");
    return savedUserId ? JSON.parse(savedUserId) : null;
  });

  const [selectedUsername, setSelectedUsername] = useState(() => {
    const savedUsername = sessionStorage.getItem("selectedUsername");
    return savedUsername ? JSON.parse(savedUsername) : null;
  });

  const [selectedIsGroup, setSelectedIsGroup] = useState(() => {
    const savedIsGroup = sessionStorage.getItem("isGroup");
    return savedIsGroup ? JSON.parse(savedIsGroup) : null;
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 500);
  const [showChatWindow, setShowChatWindow] = useState(false); // Default to false

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 500);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize WebSocket connection on mount
  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("Authorization="))
      ?.split("=")[1];

    if (token && (!WebSocketService.client || !WebSocketService.client.connected)) {
      WebSocketService.connect(
        () => console.log("WebSocket connected"),
        (error) => console.error("WebSocket connection error:", error),
        token
      );
    }
  }, []);

  // Handle user selection for chats
  const handleUserSelect = useCallback(
    (id, name, isGroup, isShowChatWindow) => {
      if (id !== selectedUserId || name !== selectedUsername || isGroup !== selectedIsGroup) {
        setSelectedUserId(id);
        setSelectedUsername(name);
        setSelectedIsGroup(isGroup);
        setShowChatWindow(isShowChatWindow);

        sessionStorage.setItem("selectedUserId", JSON.stringify(id));
        sessionStorage.setItem("selectedUsername", JSON.stringify(name));
        sessionStorage.setItem("isGroup", JSON.stringify(isGroup));
      }
    },
    [selectedUserId, selectedUsername, selectedIsGroup]
  );

  return (
    <div className="chat-container">
      {/* Sidebar - Chat List */}
      <div className="sidebar">
        <ChatList onChatSelect={handleUserSelect} isMobile={isMobile} setShowChatWindow={setShowChatWindow} />
      </div>

      {/* Chat Window - Always Visible on Desktop, Conditional on Mobile */}
      {(!isMobile || showChatWindow) && (
        <div className="chat-area">
          {WebSocketService.client?.connected && selectedUserId && selectedUsername ? (
            <ChatWindow
              recipientId={selectedUserId}
              recipientUsername={selectedUsername}
              isGroup={selectedIsGroup}
              isMobile={isMobile}
              setShowChatWindow={setShowChatWindow}
            />
          ) : (
            <div className="no-chat">Select a user to start chatting</div>
          )}
        </div>
      )}

      {/* Utility Panel */}
      <div className="chat-help-utils">
        <ChatUtil />
      </div>
    </div>
  );
};

export default Ok;
