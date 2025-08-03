import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import Message from './ChatManager';
import UserStatus from './OnlineStatusService';
import config from './backend_url';

const API_BASE_URL = config.apiBaseUrl;

const Chat = ({ currentUser }) => {
    const [stompClient, setStompClient] = useState(null);
    const [message, setMessage] = useState('');
    const [recipientId, setRecipientId] = useState('');
    const [messages, setMessages] = useState([]);
    const [isOnline, setIsOnline] = useState(false);

    // Retrieve JWT token from cookies
    const getJwtToken = () => {
        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('Authorization='))?.split('=')[1];
        return token ? decodeURIComponent(token) : null;
    };

    useEffect(() => {
        // Initialize WebSocket connection
        const sockInstance = new SockJS(`${API_BASE_URL}/chat`);
        const client = Stomp.over(sockInstance);
        const token = getJwtToken();
        const headers = token ? { Authorization: token } : {};

        client.connect(headers, () => {
            setStompClient(client);

            // Subscribe to public messages
            client.subscribe('/topic/messages', (msg) => {
                const receivedMessage = JSON.parse(msg.body);
                setMessages((prevMessages) => [...prevMessages, receivedMessage]);
            });

            // Subscribe to private messages for the current user
            client.subscribe(`/user/${currentUser}/queue/private`, (msg) => {
                const receivedMessage = JSON.parse(msg.body);
                setMessages((prevMessages) => [...prevMessages, receivedMessage]);
            });
        });

        return () => {
            if (client.connected) {
                client.disconnect();
            }
        };
    }, [currentUser]);

    // Subscribe to online/offline status updates for the recipient
    useEffect(() => {
        if (stompClient) {
            const statusSubscription = stompClient.subscribe(`/topic/status`, (msg) => {
                const statusUpdate = JSON.parse(msg.body);
                // console.log("Status update received:", statusUpdate);
                if (statusUpdate.userId === recipientId) {
                    setIsOnline(statusUpdate.isOnline);
                }
            });

            // Unsubscribe when recipientId changes or component unmounts
            return () => {
                statusSubscription.unsubscribe();
            };
        }
    }, [recipientId, stompClient]);

    // Request online status of the recipient when it changes
    useEffect(() => {
        if (stompClient) {
            const userId = 2; // Replace with dynamic user ID if necessary
            try {
                stompClient.send('/app/topic/status', {}, JSON.stringify({ userId }));
            
            } catch (error) {
                console.error("Failed to send status:", error);
            }
        }
    }, [stompClient]);

    const sendMessage = () => {
        if (stompClient && message.trim()) {
            const messageDTO = {
                senderId: currentUser,
                receiverId: recipientId || null,
                content: message,
            };

            try {
                stompClient.send('/app/send/message', {}, JSON.stringify(messageDTO));
                setMessage('');
            } catch (error) {
                console.error("Failed to send message:", error);
            }
        }
    };

    return (
        <div className="chat-container">
            <UserStatus status={isOnline ? 'Online' : 'Offline'} />
            <div className="messages-list">
                {messages.map((msg, index) => (
                    <Message key={index} message={msg} currentUser={currentUser} />
                ))}
            </div>
            <input
                type="text"
                placeholder="Recipient ID (leave empty for public)"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
            />
            <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};

export default Chat;
