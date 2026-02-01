import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FiSearch, FiUser, FiUsers } from "react-icons/fi";
import { searchUsers } from "../api/api";
import useDebounce from "../../hooks/useDebounce";

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const ChatList = ({ onChatSelect, isMobile, setShowChatWindow }) => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [chatList, setChatList] = useState(() => {
    return JSON.parse(localStorage.getItem("chatList")) || [];
  });
  const [activeChat, setActiveChat] = useState(null);

  const handleSearch = useCallback(async (newQuery) => {
    if (newQuery) {
      try {
        const results = await searchUsers(newQuery);
        setSearchResults(results || []);
      } catch (error) {
        console.error("Error searching users/groups:", error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  }, []);

  const debouncedSearch = useDebounce(handleSearch, 300);

  const handleSearchChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    debouncedSearch(newQuery);
  };

  const handleChatSelect = useCallback(
    (chat) => {
      const chatExists = chatList.some(
        (item) => item.id === chat.id && item.group === chat.group
      );
      if (!chatExists) {
        const updatedList = [...chatList, chat];
        setChatList(updatedList);
        localStorage.setItem("chatList", JSON.stringify(updatedList));
      }
      setActiveChat(chat);
      setSearchResults([]);
      setQuery("");
      onChatSelect(chat.id, chat.name, chat.group, true);
    },
    [chatList, onChatSelect, setShowChatWindow]
  );

  const handleChatListClick = useCallback(
    (chat) => {
      setActiveChat(chat);
      onChatSelect(chat.id, chat.name, chat.group, true);
    },
    [onChatSelect]
  );

  return (
    <div className="w-full h-full bg-background-form p-4 border-r border-border-color flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-on-background">Hermes</h2>
      </div>

      {/* Search Box */}
      <div className="relative mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users or groups"
            value={query}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-input text-on-background placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-300"
            style={{
              boxShadow: `inset -2px 4px 6px rgba(0, 0, 0, 0.3), inset 2px -4px 6px rgba(255, 255, 255, 0.3)`,
            }}
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-icon" />
        </div>
        {searchResults.length > 0 && (
          <motion.div
            className="absolute top-full left-0 right-0 z-10 bg-background-form border border-border-color rounded-xl mt-2 max-h-64 overflow-y-auto shadow-lg"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            {searchResults.map((chat) => (
              <motion.div
                key={`${chat.id}-${chat.group}`}
                onClick={() => handleChatSelect(chat)}
                className="flex items-center px-4 py-3 hover:bg-hover cursor-pointer transition-colors duration-200"
                variants={itemVariants}
              >
                {chat.group ? (
                  <FiUsers className="h-5 w-5 mr-3 text-on-background" />
                ) : (
                  <FiUser className="h-5 w-5 mr-3 text-on-background" />
                )}
                <span className="text-on-background font-medium">
                  {chat.name}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chatList.length > 0 ? (
          <motion.div variants={listVariants} initial="hidden" animate="visible">
            {chatList.map((chat) => (
              <motion.div
                key={`${chat.id}-${chat.group}`}
                onClick={() => handleChatListClick(chat)}
                className={`flex items-center px-4 py-3 rounded-xl  cursor-pointer mb-2 transition-colors duration-200 ${
                  activeChat?.id === chat.id && activeChat?.group === chat.group
                    ? "bg-primary dark:text-black text-white shadow-md"
                    : "hover:bg-hover dark:text-white text-black bg-card-bg"
                }`}
              >
                {chat.group ? (
                  <FiUsers className="h-5 w-5 mr-3 " />
                ) : (
                  <FiUser className="h-5 w-5 mr-3 " />
                )}
                <span className="font-medium">{chat.name}</span>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="px-4 py-2 text-muted text-center mt-8">
            <p className="text-xl">No active chats</p>
            <p className="text-sm">Search for users or groups to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;