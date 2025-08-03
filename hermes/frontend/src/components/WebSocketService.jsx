import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import config from './backend_url';

const API_BASE_URL = config.apiBaseUrl; 


const WebSocketService = {
    client: null,

    // Connect method
    connect(onConnected, onMessageReceived, token) {
        const socket = new SockJS(`${API_BASE_URL}/chat`);  // Your WebSocket endpoint
        this.client = Stomp.over(socket);

        const headers = token ? { Authorization: token } : {};

        this.client.connect(headers, () => {
            // console.log('WebSocket connected');
            onConnected();  // callback when connected
        }, (error) => {
            console.error('WebSocket connection error:', error);
        });
    },

    // Disconnect method
    disconnect() {
        if (this.client) {
            this.client.disconnect();
        }
    },

    // Subscribe to a specific topic
    subscribe(destination, callback) {
        if (this.client) {
            return this.client.subscribe(destination, (msg) => {
                callback(JSON.parse(msg.body));  // Process received messages
            });
        }
    },

    // Send a message to a dynamic destination (like /send/message/{receiverId})
    send(receiverId, message) {
        if (this.client && this.client.connected) {
            const destination = `/send/message/${receiverId}`;
            // console.log("Sending message to:", destination);
            this.client.send(destination, {}, JSON.stringify(message));  // Send to the destination
        } else {
            console.error("WebSocket is not connected.");
        }
    },
};

export default WebSocketService;
