import React, { useState, useEffect, useRef, useCallback } from "react";
import WebSocketService from "./WebSocketService";
import OnlineStatusService from "./OnlineStatusService";
import ChatManager from "./ChatManager";
import { getCurrentUserWithToken, fetchMessagesUntilLastDay } from "./api";
import FileUpload from "./Files";
import FileView from "./FilesView";

const ChatWindow = ({ recipientId, recipientUsername, isGroup ,isMobile,setShowChatWindow}) => {
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [status, setStatus] = useState("Unknown");
  const [currentUser, setCurrentUser] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const chatEndRef = useRef(null);

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const userId = await getCurrentUserWithToken();
        setCurrentUser(userId);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    initializeUser();
  }, []);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = useCallback(async () => {
    if (!recipientId || !currentUser || currentUser === recipientId) return;

    try {
      // console.log("Hey Trying to get the previous messages!!!");
      const previousMessages = await fetchMessagesUntilLastDay(
        currentUser,
        recipientId,
        isGroup
      );
      setMessages(previousMessages);
    } catch (error) {
      console.error("Error fetching previous messages:", error);
    }
  }, [recipientId, currentUser, isGroup]);

  useEffect(() => {
    if (!recipientId || !currentUser || currentUser === recipientId) {
      return;
    }

    loadMessages();

    const messageSubscription = ChatManager.subscribeToMessages(
      WebSocketService.client,
      currentUser,
      (newMessage) => {
        if (
          (isGroup && newMessage.groupId === recipientId) ||
          (!isGroup && newMessage.senderId === recipientId)
        ) {
          setMessages((prev) => {
            const exists = prev.some((msg) => msg.tempId === newMessage.tempId);
            return exists ? prev : [...prev, newMessage];
          });
        }
      },
      isGroup,
      recipientId
    );

    const senderSubscription = ChatManager.subscribeToSender(
      WebSocketService.client,
      currentUser,
      (ackMessage) => {
        // console.log("Received ack:", ackMessage);

        if (ackMessage.content !== "---FILE---") {
          // Handle normal text message acknowledgment
          const { tempId, status } = ackMessage;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.tempId === tempId ? { ...msg, status } : msg
            )
          );
        } else {
          // Handle file acknowledgment
          const {
            id,
            content,
            senderId,
            receiverId,
            tempId,
            fileName,
            status,
          } = ackMessage;

          setMessages((prev) => {
            const exists = prev.some((msg) => msg.tempId === tempId);
            if (exists) {
              // Update the status of the existing file message
              return prev.map((msg) =>
                msg.tempId === tempId ? { ...msg, status } : msg
              );
            } else {
              // Add the new file message if it doesn't exist
              const newMessage = {
                id,
                content,
                senderId,
                receiverId,
                tempId,
                fileName,
                status,
              };
              return [...prev, newMessage];
            }
          });

          // Log updated messages safely using a callback
          setMessages((prev) => {
            // console.log("Updated Messages: ", prev);
            return prev; // Return the unchanged state
          });
        }
      },
      isGroup,
      recipientId
    );
    // console.log("Updated Messages: ", messages);

    if (!isGroup) {
      const statusSubscription = OnlineStatusService.subscribeToStatusUpdates(
        WebSocketService.client,
        recipientId,
        setStatus
      );

      OnlineStatusService.requestUserStatus(
        WebSocketService.client,
        recipientId
      );

      
    }

    return () => {
      messageSubscription.unsubscribe();
      senderSubscription.unsubscribe();
    };
  }, [recipientId, currentUser, isGroup, loadMessages]);

  const handleKeyPress = (e) => {
    // console.log(`Key pressed: ${e.key}`); // Debugging line
    if (e.key === "Enter") {
      handleSendClick();
    }
  };

  const handleBackButtonClick = () => {
    // console.log("setShowChatWindow is not a function:", setShowChatWindow);
    
    if (typeof setShowChatWindow === "function") {
      setShowChatWindow(false); // Properly update state
    } else {
      console.warn("setShowChatWindow is not a function:", setShowChatWindow);
    }
  };
  
  
  const handleSendClick = useCallback(() => {
    if (messageContent.trim() && currentUser) {
      const tempId = Date.now();
      const messageDTO = {
        senderId: currentUser,
        receiverId: recipientId,
        groupId: recipientId,
        content: messageContent,
        isGroup,
        tempId,
        status: "pending",
      };

      setMessages((prev) => [...prev, messageDTO]);

      ChatManager.sendMessage(
        WebSocketService.client,
        messageDTO,
        (response) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.tempId === tempId
                ? { ...msg, status: response.success ? "sent" : "failed" }
                : msg
            )
          );
        }
      );

      setMessageContent("");
    }
  }, [messageContent, recipientId, isGroup, currentUser]);

  return (
    <div className="chat-area">
      <div className="chat-header">
        {isMobile ? (
        <div className="back-arrow-div">
          <button className="back-arrow-button" onClick={handleBackButtonClick}>
            <img src="src/components/css/Images.css/back_arrow.png" className="back-arrow-img" />
          </button>
        </div>):null}
        <div className="chat-window-header-detail">
        <span className="chat-contact-name">
          {recipientUsername.charAt(0).toUpperCase() +
            recipientUsername.slice(1) || "Group Chat"}
        </span>
        <br />
        {!isGroup && (
          <span className={`chat-status ${status.toLowerCase()}`}>
            {status}
          </span>
        )}
        </div>
      </div>

      <div className="message-display">
        {messages.map((msg, index) => (
          <div key={msg.id || `msg-${index}`}>
            {msg.content !== null ? (
              msg.content === "---FILE---" ? (
                <FileView
                  filename={msg.fileName}
                  isSent={msg.senderId == currentUser}
                />
              ) : (
                <div
                  className={
                    msg.senderId == currentUser
                      ? "message-sent"
                      : "message-received"
                  }
                >
                  {msg.content}
                  {msg.senderId == currentUser && (
                    <span className="message-status">
                      {msg.status == "pending" ? "❌" : "✅"}
                    </span>
                  )}
                </div>
              )
            ) : null}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="input-area">
        <button className="file-button" onClick={toggleModal}>
          <img src="src/components/css/Images.css/attach_file_icon.png" className="attach-file" />
        </button>

        {/* Show the FileUpload modal when isModalOpen is true */}
        {isModalOpen && (
          <FileUpload
            onClose={toggleModal}
            currentUser={currentUser}
            receiverId={recipientId}
            isGroup={isGroup}
          />
        )}
        <input
          type="text"
          className="message-input"
          placeholder="Type a message"
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        
        <button className="send-button" onClick={handleSendClick}>
        send
        </button>
        
      </div>
    </div>
  );
};

export default ChatWindow;
