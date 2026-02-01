import React, { useState, useEffect } from "react";
import config from "../api/backend_url";
import { X } from "lucide-react";
import { getAuthTokenFromCookie } from "../util/auth";

const API_BASE_URL = `${config.apiBaseUrl}/auth`;

const FileView = ({ filename, isSent, imageClassName }) => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const backendUrl = `${API_BASE_URL}/files/show?filename=${filename}`;

    useEffect(() => {
        const fetchFile = async () => {
            setError("");
            setFile(null);
            setLoading(true);

            if (!filename?.trim()) {
                setError("Filename is empty or invalid.");
                setLoading(false);
                return;
            }

            const token = getAuthTokenFromCookie();

            try {
                const response = await fetch(backendUrl, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("File not found or access denied.");
                }

                const data = await response.json();
                const processedFile = {
                    ...data,
                    url: `data:${data.type};base64,${data.content}`,
                };

                setFile(processedFile);
            } catch (err) {
                setError(
                    "Maybe the sender deleted the file or it does not exist.",
                );
                console.error("Error fetching file:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFile();
    }, [filename, backendUrl]);

    const handleImageClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="relative">
            {loading ? (
                <div className="flex text-sm text-on-background px-3 py-2">
                    Loading file...
                </div>
            ) : file ? (
                <div
                    className={`flex my-2 ${isSent ? "justify-end" : "justify-start"}`}
                >
                    <img
                        src={file.url}
                        alt={file.name}
                        onClick={handleImageClick}
                        className={`w-fit max-w-[30vw] object-cover ${imageClassName} rounded-xl cursor-pointer hover:opacity-90 transition-opacity duration-200 shadow-md`}
                    />
                </div>
            ) : (
                <div
                    className={`flex text-sm text-destructive px-3 py-2 ${
                        isSent ? "justify-end" : "justify-start"
                    }`}
                >
                    {error || "File not available."}
                </div>
            )}

            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4"
                    onClick={handleCloseModal}
                >
                    <div className="relative w-full h-full">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 text-white text-3xl font-bold bg-gray-800 bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-colors duration-200"
                        >
                            <X size={24} />
                        </button>
                        <img
                            src={file?.url}
                            alt={file?.name}
                            className="w-full h-full object-contain rounded-xl shadow-lg cursor-pointer"
                            onClick={handleCloseModal}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileView;
