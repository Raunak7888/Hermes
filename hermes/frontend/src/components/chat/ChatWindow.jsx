import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useLayoutEffect,
} from "react";
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
    const scrollContainerRef = useRef(null);

    /** * Robust Scroll Function
     * Uses a slight delay to ensure the browser has calculated new element heights
     */
    const scrollToBottom = useCallback((behavior = "smooth") => {
        const container = scrollContainerRef.current;
        if (!container) return;

        requestAnimationFrame(() => {
            container.scrollTo({
                top: container.scrollHeight,
                behavior,
            });
        });
    }, []);

    // Scroll when messages array changes
    useLayoutEffect(() => {
        if (messages.length > 0) {
            scrollToBottom(messagesLoaded ? "smooth" : "auto");
        }
    }, [messages, messagesLoaded, scrollToBottom]);

    const loadMessages = useCallback(async () => {
        if (!recipientId || !currentUser || messagesLoaded) return;

        try {
            const previousMessages = await fetchMessagesUntilLastDay(
                currentUser,
                recipientId,
                isGroup,
            );
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

        ChatManager.sendMessage(
            WebSocketService.client,
            messageDTO,
            (response) => {
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.tempId === tempId
                            ? {
                                    ...msg,
                                    status: response.success ? "sent" : "failed",
                                }
                            : msg,
                    ),
                );
            },
        );
    }, [messageContent, currentUser, recipientId, isGroup]);

    const handleKeyPress = (e) => {
        if (e.key === "Enter") handleSendClick();
    };

    // Get current user on mount
    useEffect(() => {
        getCurrentUserWithToken().then(setCurrentUser).catch(console.error);
    }, []);

    // Reset loaded messages when recipient changes
    useEffect(() => {
        setMessagesLoaded(false);
        setMessages([]); // Clear messages immediately for UI responsiveness
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
                        const exists = prev.some(
                            (msg) => msg.tempId === newMessage.tempId,
                        );
                        return exists ? prev : [...prev, newMessage];
                    });
                }
            },
            isGroup,
            recipientId,
        );

        const ackSub = ChatManager.subscribeToSender(
            WebSocketService.client,
            currentUser,
            (ack) => {
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.tempId === ack.tempId
                            ? { ...msg, status: ack.status }
                            : msg,
                    ),
                );

                if (ack.content === "---FILE---") {
                    setMessages((prev) => {
                        const exists = prev.some(
                            (msg) => msg.tempId === ack.tempId,
                        );
                        return exists ? prev : [...prev, ack];
                    });
                }
            },
            isGroup,
            recipientId,
        );

        let statusSub;
        if (!isGroup) {
            statusSub = OnlineStatusService.subscribeToStatusUpdates(
                WebSocketService.client,
                recipientId,
                setStatus,
            );
            OnlineStatusService.requestUserStatus(
                WebSocketService.client,
                recipientId,
            );
        }

        return () => {
            msgSub?.unsubscribe();
            ackSub?.unsubscribe();
            statusSub?.unsubscribe();
        };
    }, [recipientId, currentUser, isGroup, loadMessages]);

    if (!recipientId) {
        return (
            <div className="flex items-center justify-center h-full text-lg text-gray-400">
                Select a chat to begin messaging.
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800">
            {/* Header */}
            <div className="flex items-center p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                {isMobile && (
                    <motion.button
                        onClick={handleBack}
                        className="text-gray-600 dark:text-gray-300 hover:text-blue-500 mr-2"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </motion.button>
                )}
                <div className="flex flex-col flex-1">
                    <span className="font-bold text-lg text-gray-900 dark:text-white capitalize">
                        {recipientUsername || "Group Chat"}
                    </span>
                    {!isGroup && (
                        <div className="flex items-center space-x-1.5">
                            <div
                                className={`w-2 h-2 rounded-full ${status ? "bg-green-500" : "bg-gray-400"}`}
                            />
                            <span
                                className={`text-xs font-medium ${status ? "text-green-500" : "text-gray-500"}`}
                            >
                                {status ? "Online" : "Offline"}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            {/* Messages Area */}
            <div
                ref={scrollContainerRef}
                className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950 
    scrollbar-thin 
    [&::-webkit-scrollbar]:w-1.5
    [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-thumb]:bg-gray-300
    dark:[&::-webkit-scrollbar-thumb]:bg-gray-700"
            >
                {messages.map((msg, index) => {
                    const isSentByCurrentUser = msg.senderId == currentUser;

                    // Logic to determine if we should show the sender's name
                    // Show if it's a group AND not the current user
                    const showSenderName = isGroup && !isSentByCurrentUser;

                    const statusIcon =
                        msg.status === "sent" ? (
                            <Check className="w-3 h-3 text-blue-400" />
                        ) : msg.status === "pending" ? (
                            <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Ban className="w-3 h-3 text-red-500" />
                        );

                    return (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={msg.id || msg.tempId || `msg-${index}`}
                            className={`flex w-full ${isSentByCurrentUser ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`flex flex-col max-w-[80%] ${isSentByCurrentUser ? "items-end" : "items-start"}`}
                            >
                                {/* SENDER NAME LABEL */}
                                {showSenderName && (
                                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mb-1 ml-2 transition-all">
                                        {msg.senderName || "Unknown User"}
                                    </span>
                                )}

                                <div
                                    className={`px-4 py-2.5 rounded-2xl shadow-sm break-words ${
                                        isSentByCurrentUser
                                            ? "bg-blue-600 text-white rounded-tr-none"
                                            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-700"
                                    }`}
                                >
                                    {msg.content === "---FILE---" ? (
                                        <FileView
                                            filename={msg.fileName}
                                            isSent={isSentByCurrentUser}
                                            imageClassName="w-full rounded-lg"
                                            onLoad={() =>
                                                scrollToBottom("smooth")
                                            }
                                        />
                                    ) : (
                                        <p className="text-[15px] leading-relaxed">
                                            {msg.content}
                                        </p>
                                    )}
                                    <div
                                        className={`flex gap-1.5 mt-1 text-[10px] font-medium uppercase tracking-wider ${
                                            isSentByCurrentUser
                                                ? "text-blue-100/80"
                                                : "text-gray-400"
                                        } justify-end items-center`}
                                    >
                                        {formatTime(msg.timestamp)}
                                        {isSentByCurrentUser && statusIcon}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
                <div ref={chatEndRef} className="h-2" />
            </div>
            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-2xl p-2 px-3 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                    <motion.button
                        onClick={toggleModal}
                        className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Paperclip className="w-5 h-5" />
                    </motion.button>

                    <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white py-2"
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        onKeyDown={handleKeyPress}
                    />

                    <motion.button
                        onClick={handleSendClick}
                        disabled={!messageContent.trim()}
                        className={`p-2.5 rounded-xl shadow-md transition-all ${
                            messageContent.trim()
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                        }`}
                        whileHover={
                            messageContent.trim() ? { scale: 1.05 } : {}
                        }
                        whileTap={messageContent.trim() ? { scale: 0.95 } : {}}
                    >
                        <Send className="w-5 h-5" />
                    </motion.button>
                </div>

                {isModalOpen && (
                    <FileUpload
                        onClose={toggleModal}
                        currentUser={currentUser}
                        receiverId={recipientId}
                        isGroup={isGroup}
                    />
                )}
            </div>
        </div>
    );
};

export default ChatWindow;
