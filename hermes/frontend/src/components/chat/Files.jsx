import React, { useState } from "react";
import ChatManager from "./ChatManager";
import WebSocketService from "../api/WebSocketService";
import { X, UploadCloud } from "lucide-react";

const MAX_FILE_SIZE = 256 * 1024; // 256 KB

const FileUpload = ({ onClose, currentUser, receiverId, isGroup }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError("File size exceeds 256 KB. Please select a smaller file.");
        setFile(null);
      } else {
        setError("");
        setFile(selectedFile);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64File = e.target.result;
        const plainBase64 = base64File.split(",")[1];
        const filenameWithNoSpace = file.name.replace(/\s+/g, "");

        const tempId = Date.now();

        const fileDTO = {
          file: plainBase64,
          fileName: filenameWithNoSpace,
          fileType: file.type,
          fileSize: file.size,
          userId: currentUser,
          receiverId,
          tempId,
          status: "pending",
          isGroup: `${isGroup}`,
        };

        // Assuming ChatManager.sendImage handles the upload logic
        ChatManager.sendImage(WebSocketService.client, fileDTO, isGroup, () => {
          console.log("File sent successfully.");
        });

        onClose();
      } catch (uploadError) {
        setError("An error occurred during upload. Please try again.");
        console.error("Upload error:", uploadError);
      } finally {
        setUploading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4">
      <div className="bg-background-form rounded-xl shadow-lg p-6 w-full max-w-sm relative">
        <button
          className="absolute top-4 right-4 text-on-background hover:text-muted transition-colors duration-200"
          onClick={onClose}
        >
          <X size={24} />
        </button>
        <h2 className="text-xl font-semibold mb-4 text-on-background">Send Image</h2>
        
        <div className="flex items-center justify-center p-6 border-2 border-dashed border-border-color rounded-xl mb-4">
          <label className="flex flex-col items-center justify-center cursor-pointer text-center">
            <UploadCloud size={48} className="text-muted mb-2" />
            <span className="text-on-background font-medium">
              Drag & drop or <span className="text-primary hover:underline">browse</span>
            </span>
            <span className="text-muted text-sm mt-1">Max file size: 256 KB</span>
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {file && (
          <p className="text-sm text-on-background mb-3">
            Selected file: <span className="font-medium text-primary">{file.name}</span>
          </p>
        )}

        {error && (
          <p className="text-sm text-destructive mb-3">
            {error}
          </p>
        )}
        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className={`w-full py-3 rounded-lg dark:text-white text-black font-semibold transition-all duration-300 transform shadow-md ${
            uploading || !file
              ? "bg-muted-foreground text-muted cursor-not-allowed"
              : "bg-primary hover:bg-primary-hover hover:scale-105"
          }`}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
};

export default FileUpload;