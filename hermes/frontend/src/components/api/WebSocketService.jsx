// src/services/WebSocketService.js

import config from './backend_url';

const API_BASE_URL = config.apiBaseUrl;

const WebSocketService = {
  client: null,

  connect(onConnected = () => { }, onMessageReceived = () => { }, token = null) {

    const socket = new SockJS(`${API_BASE_URL}/chat`);
    const client = Stomp.over(socket);

    // Disable logging
    client.debug = () => {};


    client.connect(
      token ? { Authorization: `Bearer ${token}` } : {},
      (frame) => {
        console.log('✅ WebSocket connected:', frame);
        this.client = client;
        onConnected();
      },
      (error) => {
        console.error('🚨 WebSocket connection error:', error);
      }
    );
  }
  ,

  disconnect() {
    if (this.client && this.client.connected) {
      this.client.disconnect(() => {
        console.log('🛑 WebSocket disconnected');
      });
    }
  },

  subscribe(destination, callback) {
    if (this.client && this.client.connected) {
      return this.client.subscribe(destination, (message) => {
        try {
          const body = JSON.parse(message.body);
          callback(body);
        } catch (err) {
          console.error('❌ Failed to parse message:', err);
        }
      });
    } else {
      console.warn('⚠️ Cannot subscribe: WebSocket not connected');
    }
  },

  send(receiverId, message) {
    if (this.client && this.client.connected) {
      const destination = `/send/message/${receiverId}`;
      this.client.send(destination, {}, JSON.stringify(message));
      console.log('📨 Message sent to', destination);
    } else {
      console.warn('⚠️ Cannot send: WebSocket not connected');
    }
  },

  isConnected() {
    return this.client && this.client.connected;
  },
};

export default WebSocketService;
