import React, { useState, useEffect, useCallback } from "react";
import { searchUsers } from "./api";
import ChatUtil from "./ChatUtil";

const ChatList = ({ onChatSelect,isMobile,setShowChatWindow }) => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [chatList, setChatList] = useState(() => {
    return JSON.parse(localStorage.getItem("chatList")) || [];
  });
  const [activeChat, setActiveChat] = useState(null);
  
  // Handle search input change
  const handleSearchChange = useCallback(async (e) => {
    const newQuery = e.target.value.trim();
    setQuery(newQuery);

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

  // Add a chat to the list and set it as active
  const handleChatSelect = useCallback(
    (chat) => {
      if (
        !chatList.some(
          (item) => item.id === chat.id && item.group === chat.group
        )
      ) {
        const updatedList = [...chatList, chat];
        setChatList(updatedList);
        localStorage.setItem("chatList", JSON.stringify(updatedList));
      }
      setActiveChat(chat);
      setSearchResults([]);
      setQuery("");
      onChatSelect(chat.id, chat.name, chat.group);
      setShowChatWindow(true)
    },
    [chatList, onChatSelect]
  );

  // Handle click on an existing chat
  const handleChatListClick = useCallback(
    (chat) => {
      setActiveChat(chat);
      onChatSelect(chat.id, chat.name, chat.group);
      setShowChatWindow(true)
      // console.log("Chat clicked:");
    },
    [onChatSelect]
  );

  // Effect for logging updates to the chat list (optional for debugging)
  // useEffect(() => {
  //   console.log("Updated Chat List:", chatList);
  // }, [chatList]);

  return (
    <div className="chat-sidebar">
      <div className="chat-sidebar-header">
        <span className="h1">Chat App</span>
        {isMobile ? (
        <div className="chat-help-utils-Mobile">
           {/* idar logout and create group add karna hai */}
            <ChatUtil/>
        </div>):null}
      </div>
      <div className="chat-sidebar-search">
        {/* <div className="search-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg></div> */}
        <input
          type="text"
          placeholder="Search users or groups"
          value={query}
          onChange={handleSearchChange}
          className="search-input"
        />
        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((chat) => (
              <div
                key={`${chat.id}-${chat.group}`}
                className="search-result-item"
                onClick={() => handleChatSelect(chat)}
              >
                {chat.name}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="chat-list">
        {chatList.length > 0 ? (
          chatList.map((chat) => (
            <div
              key={`${chat.id}-${chat.group}`}
              className={`chat-list-item ${
                activeChat?.id === chat.id && activeChat?.group === chat.group
                  ? "active"
                  : ""
              }`}
              onClick={() => handleChatListClick(chat)}
            >
              <span className="chat-name">{chat.name}</span>
            </div>
          ))
        ) : (
          <div className="chat-list-item"><span className="chat-name">No active chats</span></div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
