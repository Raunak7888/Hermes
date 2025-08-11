// src/components/OnlineStatusService.jsx
const OnlineStatusService = {
  /**
   * Subscribe to user status updates
   */
  subscribeToStatusUpdates(stompClient, userId, callback, isGroup = false) {
    if (!stompClient || !userId) {
      console.error("Invalid stompClient or userId for status subscription.");
      return null;
    }

    return stompClient.subscribe(`/topic/status`, (msg) => {
      try {
        const update = JSON.parse(msg.body);
        // Expected format: { userId: "...", status: "ONLINE" | "OFFLINE" }
        if (update) {
          callback(update);
        }
      } catch (error) {
        console.error("Status update parse error:", error);
      }
    });
  },

  /**
   * Request backend to push current status of user
   */
  requestUserStatus(stompClient, userId) {
    if (!stompClient || !stompClient.connected) {
      console.error("Cannot request status — client not connected.");
      return;
    }

    stompClient.send(
      '/app/topic/status',
      {},
      JSON.stringify({ userId })
    );
  },
};

export default OnlineStatusService;
