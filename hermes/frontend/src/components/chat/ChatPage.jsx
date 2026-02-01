// src/components/ChatPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMessageSquare, FiWifiOff } from "react-icons/fi";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import WebSocketService from "../api/WebSocketService";
import ChatUtil from "./ChatUtil";
import useIsMobile from "../../hooks/useInMobile";
import { getSessionValue } from "../util/session";
import { getAuthTokenFromCookie } from "../util/auth";
import Loading from "../util/Loading";
import config from '../api/backend_url';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 100,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const ChatPage = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUsername, setSelectedUsername] = useState(null);
  const [selectedIsGroup, setSelectedIsGroup] = useState(false);

  const [isConnected, setIsConnected] = useState(WebSocketService.client?.connected || false);
  const [loading, setLoading] = useState(false);
  const [showChatWindow, setShowChatWindow] = useState(false);
  const isMobile = useIsMobile();

  // Initialize WebSocket connection
  useEffect(() => {
    const token = getAuthTokenFromCookie();

    if (token && (!WebSocketService.isConnected())) {
      setLoading(true);
      WebSocketService.connect(
        () => {
          WebSocketService.subscribe("/topic/messages", (message) => {
            // Handle incoming messages
          });
          setIsConnected(true); // ✅ update the state
          setLoading(false);

        },
        (error) => {
          console.error("❌ WebSocket connection error:", error);
          setIsConnected(false);
          setLoading(false);

        },
        token
      );
    }

    return () => {
      WebSocketService.disconnect();
    };
  }, []);

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
    
      loading?(
        <Loading message = "Logging out..." />
      ): (
          <div className = "flex flex-col md:flex-row h-screen bg-gradient-to-br from-gradient-start to-gradient-end">
      <AnimatePresence mode = "">
        { (!isMobile || !showChatWindow) && (
      <motion.div
        key="chat-list"
        className="md:w-1/4 w-full bg-background-form shadow-2xl overflow-y-auto border-r border-border-color"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <ChatList
          onChatSelect={handleUserSelect}
          isMobile={isMobile}
          setShowChatWindow={setShowChatWindow}
        />
      </motion.div>
    )
}

{
  (!isMobile || showChatWindow) && (
    <motion.div
      key="chat-window"
      className="flex-1 bg-background-form relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      {isConnected ? (
        selectedUserId && selectedUsername ? (
          <ChatWindow
            recipientId={selectedUserId}
            recipientUsername={selectedUsername}
            isGroup={selectedIsGroup}
            isMobile={isMobile}
            setShowChatWindow={setShowChatWindow}
          />
        ) : (
          <motion.div
            className="h-full flex items-center justify-center flex-col gap-4 p-4 text-center text-muted"
            variants={itemVariants}
          >
            <FiMessageSquare className="h-16 w-16 text-primary" />
            <p className="text-xl font-semibold text-on-background">
              Select a user to start chatting
            </p>
            <p className="text-sm">
              Your conversations will appear here.
            </p>
          </motion.div>
        )
      ) : (
        <motion.div
          className="h-full flex items-center justify-center flex-col gap-4 p-4 text-center text-muted"
          variants={itemVariants}
        >
          <FiWifiOff className="h-16 w-16 text-red-500" />
          <p className="text-xl font-semibold text-on-background">
            Connecting to chat server...
          </p>
          <p className="text-sm">
            Please wait a moment while we establish the connection.
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
      </AnimatePresence >

  <div className="hidden md:flex flex-col items-center justify-start md:w-[7vh] bg-background-form shadow-inner border-l border-border-color">
    <ChatUtil />
  </div>
    </div >)
  );
};

export default ChatPage;