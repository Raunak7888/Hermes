import React, { useState, useEffect, useRef, useCallback } from "react";
import WebSocketService from "../api/WebSocketService";
import OnlineStatusService from "../api/OnlineStatusService";
import ChatManager from "./ChatManager";
import { getCurrentUserWithToken, fetchMessagesUntilLastDay } from "../api/api";
import FileUpload from "./Files";
import FileView from "./FilesView";
import { ArrowLeft, Check, Ban, Paperclip, Send } from "lucide-react";
import { motion } from "framer-motion";

const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const ChatWindow = ({
  recipientId,
  recipientUsername,
  isGroup,
  isMobile,
  setShowChatWindow,
}) => {
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [status, setStatus] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const loadMessages = useCallback(async () => {
    if (!recipientId || !currentUser || messagesLoaded) return;

    try {
      const previousMessages = await fetchMessagesUntilLastDay(currentUser, recipientId, isGroup);
      setMessages(previousMessages);
      setMessagesLoaded(true);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  }, [recipientId, currentUser, isGroup, messagesLoaded]);

  const toggleModal = () => setModalOpen((prev) => !prev);
  const handleBack = () => setShowChatWindow?.(false);

  const handleSendClick = useCallback(() => {
    if (!messageContent.trim() || !currentUser) return;

    const tempId = Date.now();
    const messageDTO = {
      senderId: currentUser,
      receiverId: recipientId,
      groupId: recipientId,
      content: messageContent,
      isGroup,
      tempId,
      status: "pending",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, messageDTO]);
    setMessageContent("");

    ChatManager.sendMessage(WebSocketService.client, messageDTO, (response) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.tempId === tempId
            ? { ...msg, status: response.success ? "sent" : "failed" }
            : msg
        )
      );
    });
  }, [messageContent, currentUser, recipientId, isGroup]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSendClick();
  };

  // Get current user on mount
  useEffect(() => {
    getCurrentUserWithToken()
      .then(setCurrentUser)
      .catch(console.error);
  }, []);

  // Load messages and scroll after messagesLoaded
  useEffect(() => {
    if (messagesLoaded) {
      scrollToBottom();
    }
  }, [messagesLoaded, scrollToBottom]);

  // Reset loaded messages when recipient changes
  useEffect(() => {
    setMessagesLoaded(false);
  }, [recipientId]);

  // Subscribe to WebSocket updates
  useEffect(() => {
    if (!recipientId || !currentUser) return;

    loadMessages();

    const msgSub = ChatManager.subscribeToMessages(
      WebSocketService.client,
      currentUser,
      (newMessage) => {
        const isMatch = isGroup
          ? newMessage.groupId === recipientId
          : newMessage.senderId === recipientId;

        if (isMatch) {
          setMessages((prev) => {
            const exists = prev.some((msg) => msg.tempId === newMessage.tempId);
            return exists ? prev : [...prev, newMessage];
          });
        }
      },
      isGroup,
      recipientId
    );

    const ackSub = ChatManager.subscribeToSender(
      WebSocketService.client,
      currentUser,
      (ack) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.tempId === ack.tempId ? { ...msg, status: ack.status } : msg
          )
        );

        if (ack.content === "---FILE---") {
          const exists = messages.some((msg) => msg.tempId === ack.tempId);
          if (!exists) {
            setMessages((prev) => [...prev, ack]);
          }
        }
      },
      isGroup,
      recipientId
    );

    let statusSub;
    if (!isGroup) {
      statusSub = OnlineStatusService.subscribeToStatusUpdates(
        WebSocketService.client,
        recipientId,
        setStatus
      );
      OnlineStatusService.requestUserStatus(WebSocketService.client, recipientId);
    }

    return () => {
      msgSub?.unsubscribe();
      ackSub?.unsubscribe();
      statusSub?.unsubscribe();
    };
  }, [recipientId, currentUser, isGroup, loadMessages, messages]);

  if (!recipientId) {
    return (
      <div className="flex items-center justify-center h-full text-lg text-muted">
        Select a chat to begin messaging.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background-form rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center p-4 bg-background-form border-b border-border-color">
        {isMobile && (
          <motion.button
            onClick={handleBack}
            className="text-on-background hover:text-primary transition-colors duration-200 mr-2"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
        )}
        <div className="flex flex-col flex-1">
          <span className="font-semibold text-lg text-on-background capitalize">
            {recipientUsername || "Group Chat"}
          </span>
          {!isGroup && (
            <span
              className={`text-sm ${status ? "text-primary" : "text-muted-foreground"}`}
            >
              {status ? "Online" : "Offline"}
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 messageScrollbar overflow-y-auto p-4 space-y-4 bg-background-light">
        {messages.map((msg, index) => {
          const isSentByCurrentUser = msg.senderId == currentUser;
          const statusIcon =
            msg.status === "sent" ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Check className="w-4 h-4 text-green-500" />
              </motion.div>
            ) : (
              <Ban className="w-4 h-4 text-destructive-foreground" />
            );

          return (
            <div
              key={msg.id || `msg-${index}`}
              className={`flex w-full ${isSentByCurrentUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-xl shadow break-words ${isSentByCurrentUser
                  ? "bg-primary text-on-primary rounded-br-none"
                  : "bg-gray-600 text-on-background rounded-bl-none"
                  }`}
              >
                {msg.content === "---FILE---" ? (
                  <FileView
                    filename={msg.fileName}
                    isSent={isSentByCurrentUser}
                    imageClassName="max-w-[30vw] rounded-xl"
                  />
                ) : (
                  <span>{msg.content}</span>
                )}
                <div
                  className={`flex gap-2 mt-1 text-xs ${isSentByCurrentUser ? "text-primary-foreground" : "text-muted-foreground"
                    } justify-end items-center`}
                >
                  {formatTime(msg.timestamp)}
                  {isSentByCurrentUser && statusIcon}
                </div>
              </div>
            </div>
          );
        })}

        {/* 👇 Scroll anchor */}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex items-center p-4 border-t border-border-color bg-background-form">
        <motion.button
          onClick={toggleModal}
          className="p-2 text-icon hover:text-primary transition-colors duration-200 rounded-full"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Paperclip className="w-5 h-5" />
        </motion.button>

        {isModalOpen && (
          <FileUpload
            onClose={toggleModal}
            currentUser={currentUser?.id}
            receiverId={recipientId}
            isGroup={isGroup}
          />
        )}

        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 mx-2 px-4 py-2.5 bg-input border border-border-color rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-on-background placeholder-muted"
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          onKeyDown={handleKeyPress}
        />

        <motion.button
          onClick={handleSendClick}
          className="ml-2 p-3 bg-primary text-on-primary rounded-full shadow-md"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          disabled={!messageContent.trim()}
        >
          <Send className="w-10 h-5" />
        </motion.button>
      </div>
    </div>
  );
};

export default ChatWindow;
