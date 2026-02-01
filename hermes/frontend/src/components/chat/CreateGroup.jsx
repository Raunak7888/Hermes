import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import config from "../api/backend_url";
import RandomPageTransition from "../randomPageTrasition";
import { FiSearch, FiArrowLeft } from "react-icons/fi";
import useDebounce from "../../hooks/useDebounce";

const API_BASE_URL = `${config.apiBaseUrl}/auth`;

export const CreateGroup = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Assuming currentUser passed from state is the ID string/number (e.g., "1")
    const currentUser = location.state?.currentUser;

    const [groupName, setGroupName] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    /**
     * EFFECT: Initialize Selected Members with Creator
     * We convert the currentUser ID into a standardized object so that
     * .map((m) => m.id) works correctly for everyone in the list.
     */
    useEffect(() => {
        if (currentUser && !selectedMembers.find((m) => m.id === currentUser)) {
            const creatorObj = { id: currentUser, name: "You (Owner)" };
            setSelectedMembers((prevMembers) => [creatorObj, ...prevMembers]);
        }
    }, [currentUser]);

    const handleSearch = useCallback(
        async (query) => {
            if (query.trim() === "") {
                setSearchResults([]);
                return;
            }
            try {
                const response = await axios.get(
                    `${API_BASE_URL}/Data/Search`,
                    { params: { query } },
                );

                const filtered = response.data.filter(
                    (user) =>
                        !user.group &&
                        // Don't let user add themselves (ID check)
                        user.id !== currentUser &&
                        // Don't show users already in the selection list
                        !selectedMembers.some(
                            (member) => member.id === user.id,
                        ),
                );
                setSearchResults(filtered);
            } catch (error) {
                console.error("Search error:", error);
                setSearchResults([]);
            }
        },
        [selectedMembers, currentUser],
    );

    const debouncedSearch = useDebounce(handleSearch, 300);

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        debouncedSearch(query);
    };

    const handleAddMember = (user) => {
        setSelectedMembers((prevMembers) => [...prevMembers, user]);
        setSearchQuery("");
        setSearchResults([]);
    };

    const handleRemoveMember = (userId) => {
        // Prevent removing the creator from the list
        if (userId === currentUser) return;
        setSelectedMembers((prevMembers) =>
            prevMembers.filter((m) => m.id !== userId),
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedMembers.length < 3) {
            setErrorMessage("A group must have at least 3 members.");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);

        // CLEAN PAYLOAD: Filter out nulls and ensure IDs are unique
        const cleanMemberIds = [
            ...new Set(
                selectedMembers
                    .map((m) => m.id)
                    .filter(
                        (id) =>
                            id !== null &&
                            id !== undefined &&
                            String(id) !== String(currentUser), // 🚫 exclude creator
                    ),
            ),
        ];
        
        const payload = {
            groupName,
            createdBy: currentUser,
            memberIds: cleanMemberIds,
        };

        try {
            await axios.post(`${API_BASE_URL}/create`, payload);
            navigate("/chat");
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message ||
                    "An error occurred while creating the group.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoBack = () => navigate(-1);

    return (
        <RandomPageTransition>
            <div className="flex items-center justify-center min-h-screen bg-background-form p-4">
                <div className="w-full max-w-xl bg-card-bg p-8 rounded-xl shadow-lg border border-border-color">
                    <div className="flex items-center mb-6">
                        <button
                            onClick={handleGoBack}
                            className="p-2 mr-4 text-on-background hover:bg-hover rounded-full transition-colors duration-200"
                            title="Go back"
                        >
                            <FiArrowLeft size={24} />
                        </button>
                        <h2 className="text-2xl font-bold text-on-background">
                            Create a New Group
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Group Name */}
                        <div>
                            <label className="block font-medium text-on-background mb-1">
                                Group Name
                            </label>
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="e.g. The Boys"
                                required
                                className="w-full bg-input text-on-background border border-border-color rounded-lg px-4 py-2.5 placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary shadow-inner transition-colors"
                            />
                        </div>

                        {/* Search Members */}
                        <div>
                            <label className="block font-medium text-on-background mb-1">
                                Add Members
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    className="w-full pl-12 pr-4 py-2.5 rounded-lg bg-input border border-border-color text-on-background placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary shadow-inner transition-colors"
                                />
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-icon" />
                            </div>

                            {/* Search Results Dropdown */}
                            {searchResults.length > 0 && (
                                <div className="absolute z-10 mt-1 w-[calc(100%-4rem)] max-w-lg bg-card border border-border-color rounded-lg max-h-48 overflow-y-auto shadow-xl">
                                    {searchResults.map((user) => (
                                        <div
                                            key={user.id}
                                            onClick={() =>
                                                handleAddMember(user)
                                            }
                                            className="px-4 py-3 hover:bg-hover cursor-pointer bg-primary transition-colors duration-200 text-background border-b border-border-color last:border-none"
                                        >
                                            {user.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Selected Members Chips */}
                        <div>
                            <label className="block font-medium text-on-background mb-2 text-sm">
                                Selected ({selectedMembers.length})
                            </label>
                            <div className="flex flex-wrap gap-2 min-h-[40px] p-2 rounded-lg bg-input/50">
                                {selectedMembers.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center bg-primary text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm animate-in fade-in zoom-in duration-200"
                                    >
                                        {member.name}
                                        {member.id !== currentUser && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveMember(
                                                        member.id,
                                                    )
                                                }
                                                className="ml-2 hover:text-red-200 transition-colors"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {selectedMembers.length === 0 && (
                                    <p className="text-xs text-muted py-1">
                                        No members selected yet.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Error Notification */}
                        {errorMessage && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50">
                                <p className="text-xs text-red-500 font-medium text-center">
                                    {errorMessage}
                                </p>
                            </div>
                        )}

                        {/* Action Button */}
                        <button
                            type="submit"
                            disabled={
                                isSubmitting ||
                                !groupName ||
                                selectedMembers.length < 3
                            }
                            className={`w-full py-3.5 rounded-xl text-white font-bold transition-all duration-300 transform shadow-lg ${
                                isSubmitting ||
                                !groupName ||
                                selectedMembers.length < 3
                                    ? "bg-gray-400 cursor-not-allowed opacity-70"
                                    : "bg-primary hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98]"
                            }`}
                        >
                            {isSubmitting
                                ? "Generating Group..."
                                : "Create Group"}
                        </button>
                    </form>
                </div>
            </div>
        </RandomPageTransition>
    );
};

export default CreateGroup;
