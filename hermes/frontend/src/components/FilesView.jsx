import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "./backend_url";

const API_BASE_URL = `${config.apiBaseUrl}/auth`; // Update with your actual backend URL

const FileView = ({ filename, isSent }) => {
  const [file, setFile] = useState(null); // Store a single file data from the backend
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state for image preview
  const backendUrl = `${API_BASE_URL}/files/show`; // Update with your actual backend URL

  useEffect(() => {
    const fetchFile = async () => {
      setError(""); // Reset error state
      setFile(null); // Clear previous file

      if (!filename.trim()) {
        setError("Filename is empty or invalid.");
        return;
      }

      try {
        const response = await axios.get(backendUrl, {
          params: { filename }, // Pass single filename as query parameter
        });

        if (response.data) {
          const fetchedFile = response.data;

          // Create a URL for the file content
          const processedFile = {
            ...fetchedFile,
            url: `data:${fetchedFile.type};base64,${fetchedFile.content}`, // Embed Base64 content directly into the URL
          };

          setFile(processedFile); // Store the file for rendering
        } else {
          setError("File not found.");
        }
      } catch (err) {
        setError("Maybe Sender has deleted the file or it does not exist.");
        console.error("Error fetching file:", err);
      }
    };

    fetchFile(); // Fetch file automatically when component is mounted or filename changes
  }, [filename]);

  const handleImageClick = () => {
    setIsModalOpen(true); // Open the modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the modal
  };

  return (
    <div>
      <div className="file-container">
      {file ? (
        <div
          className={`${isSent ? "message-sent" : "message-received"} chat-image`}
        >
          <img
            src={file.url}
            alt={file.name}
            onClick={handleImageClick}
            className="thumbnail-image"
          />
        </div>
      ) : (
        <div
          className={`${isSent ? "message-sent" : "message-received"} message-error`}
        >
          {error || "Loading file..."}
        </div>
      )}
      </div>
      {isModalOpen && (
        <div className="modal" onClick={handleCloseModal}>
          <img src={file.url} alt={file.name} className="modal-image" />
        </div>
      )}
    </div>
  );
};

export default FileView;
