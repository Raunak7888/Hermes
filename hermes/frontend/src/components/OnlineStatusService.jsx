const OnlineStatusService = {
  subscribeToStatusUpdates(stompClient, recipientId, callback,isGroup) {
    if (!stompClient) {
      console.error("WebSocket client is not initialized.");
      return null;
    }

    const subscription = stompClient.subscribe(`/topic/status`, (msg) => {
      try {
        console.log(msg);
        const parsedUpdate = JSON.parse(msg.body);
        console.log("Parsed status update:", parsedUpdate);

        // Check if update is for the current recipient
        callback(parsedUpdate ? "Online" : "Offline");
      } catch (error) {
        console.error("Error processing status update:", error);
      }
    });

    return subscription;
  },

  requestUserStatus(stompClient, userId) {
    if (!stompClient || !stompClient.connected) {
      console.error("WebSocket client is not connected.");
      return;
    }
    if (!userId) {
      console.error("User ID is required to request status.");
      return;
    }
    // console.log("Requesting user status for:", userId);
    stompClient.send("/app/topic/status", {}, JSON.stringify({ userId }));
  },
};

export default OnlineStatusService;
