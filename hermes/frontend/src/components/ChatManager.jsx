const ChatManager = {
  /**
   * Sends a message to the backend
   * @param {Object} stompClient - The Stomp client instance
   * @param {Object} messageDTO - The message DTO containing senderId, receiverId, content, and isGroup flag
   */
  sendMessage(stompClient, messageDTO) {
    // console.log(messageDTO.receiverId, messageDTO.content, messageDTO.isGroup);
    const destination = messageDTO.isGroup
      ? `/app/group/message` // Group message endpoint
      : `/app/send/message`; // Private message endpoint
    // console.log(destination + "Destination For Sending Message");
    if (stompClient) {
      stompClient.send(destination, {}, JSON.stringify(messageDTO));
    }
  },

  sendImage(stompClient, fileDTO,isGroup) {
    // console.log(fileDTO.receiverId,fileDTO.userId ,fileDTO.tempID, fileDTO.status);
    const destination = `/app/send/image`; // Private message endpoint
      
    // console.log(destination + "Destination For Sending Message");
    if (stompClient) {
      stompClient.send(destination, {}, JSON.stringify(fileDTO),isGroup);
    }
  },

  /**
   * Subscribes to messages for a specific recipient (group or private)
   * @param {Object} stompClient - The Stomp client instance
   * @param {String} recipientId - The recipient's user ID or group ID
   * @param {Function} callback - Callback for processing received messages
   * @param {Boolean} isGroup - Whether the subscription is for a group
   */
  subscribeToMessages(stompClient, currentUser, callback, isGroup,groupId) {
    const destination = isGroup
      ? `/topic/group/${groupId}` // Group subscription
      : `/topic/user/${currentUser}/queue/private`; // Private subscription

    if (stompClient) {
      return stompClient.subscribe(destination, (msg) => {
        callback(JSON.parse(msg.body)); // Process the received message
      });
    }
  },

  /**
   * Subscribes to private messages or acknowledgments for the sender
   * @param {Object} stompClient - The Stomp client instance
   * @param {String} senderId - The sender's user ID
   * @param {Function} callback - Callback for processing acknowledgments or private messages
   */
  subscribeToSender(stompClient, senderId, callback, isGroup) {
    const destination = isGroup ? `/topic/group/${senderId}/ack` : `/topic/user/${senderId}/queue/ack`; // Subscription for sender-specific messages
    // console.log(destination + " Destination for Sender Subscriptions");

    if (stompClient) {
      return stompClient.subscribe(destination, (msg) => {
        callback(JSON.parse(msg.body)); // Process the acknowledgment or private message
      });
    }
  },
};

export default ChatManager;
