// src/components/ChatManager.jsx

const ChatManager = {
    /**
     * Sends a message to the backend.
     * @param {Object} stompClient - The STOMP client instance
     * @param {Object} messageDTO - The message object
     * @param {Function} [callback] - Optional callback for message status update
     */
    sendMessage(stompClient, messageDTO, callback) {
        const destination = messageDTO.isGroup
            ? `/app/group/message`
            : `/app/send/message`;

        if (stompClient?.connected) {
            stompClient.send(destination, {}, JSON.stringify(messageDTO));
            if (callback) {
                callback({ success: true });
            }
        } else {
            if (callback) {
                callback({ success: false });
            }
        }
    },

    /**
     * Sends an image/file via WebSocket.
     */
    sendImage(stompClient, fileDTO, isGroup) {
        const destination = `/app/send/image`;
        if (stompClient?.connected) {
            stompClient.send(destination, {}, JSON.stringify(fileDTO));
        }
    },

    /**
     * Subscribe to message topic (group or private).
     */
    subscribeToMessages(stompClient, currentUser, callback, isGroup, groupId) {
        const destination = isGroup
            ? `/topic/group/${groupId}`
            : `/topic/user/${currentUser}/queue/private`;

        if (stompClient?.connected) {
            return stompClient.subscribe(destination, (msg) =>
                callback(JSON.parse(msg.body)),
            );
        }
    },

    /**
     * Subscribe to sender acknowledgment topic.
     */
    subscribeToSender(stompClient, senderId, callback, isGroup) {
        const destination = isGroup
            ? `/topic/group/${senderId}/ack`
            : `/topic/user/${senderId}/queue/ack`;

        if (stompClient?.connected) {
            return stompClient.subscribe(destination, (msg) =>
                callback(JSON.parse(msg.body)),
            );
        }
    },
};

export default ChatManager;
