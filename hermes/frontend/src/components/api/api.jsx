// src\components\api.jsx
import axios from 'axios';
import config from './backend_url';

const API_BASE_URL = `${config.apiBaseUrl}/auth`;

export const getUserData = async (userId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Data/UserData`, {
            params: { userId },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching user data:", error);
        throw error;
    }
};

export const fetchMessagesUntilLastDay = async (senderId, receiverId,isGroup) => {

    try {
        const response = await axios.get(`${API_BASE_URL}/messages/user`, {
            params: {
                senderId,
                receiverId,
                isGroup,
            },
        });
        console.log("Previous Messages: ",response);
        return response.data; // Assuming the API returns an array of messages
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
    }
};

export const searchUsers = async (query) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Data/Search`, {
            params: { query },
        });
        return response.data;
    } catch (error) {
        console.error("Error searching users:", error);
        throw error;
    }
};

export const getCurrentUserWithToken = async () => {
    try {
        // Extract token from cookies
        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('Authorization='))
            ?.split('=')[1];

        if (!token) {
            console.warn('Authorization token not found in cookies');
            throw new Error('Authorization token not found in cookies');
        }

        // Make an API call with the token as a query parameter
        const response = await fetch(`${API_BASE_URL}/api/user?authorizationHeader=${encodeURIComponent(token)}`, {
            method: 'GET',
        });

        if (!response.ok) {
            const errorText = await response.text(); // Capture server response for debugging
            console.error(`API error: ${response.status} - ${errorText}`);
            throw new Error(`Failed to fetch user details: ${response.status} ${response.statusText}`);
        }

        // Parse response as plain text since API returns a string (e.g., user ID)
        const userId = await response.text();
        // console.log('Fetched user ID:', userId);
        return userId; // Return the user ID as a string
    } catch (error) {
        console.error('Error in getCurrentUserWithToken:', error.message);
        throw error;
    }
};
