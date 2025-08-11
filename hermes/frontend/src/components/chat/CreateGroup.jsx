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
  const currentUser = location.state?.currentUser;

  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Add the current user to the selected members list on component load
  useEffect(() => {
    if (currentUser && !selectedMembers.find((m) => m.id === currentUser.id)) {
      setSelectedMembers((prevMembers) => [currentUser, ...prevMembers]);
    }
  }, [currentUser]);

  const handleSearch = useCallback(async (query) => {
    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/Data/Search`, {
        params: { query },
      });
      const filtered = response.data.filter(
        (user) =>
          !user.group &&
          !selectedMembers.some((member) => member.id === user.id)
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    }
  }, [selectedMembers]);

  const debouncedSearch = useDebounce(handleSearch, 300);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedMembers.length < 3) {
      setErrorMessage("A group must have at least 3 members.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = {
      groupName,
      createdBy: currentUser.id,
      memberIds: selectedMembers.map((member) => member.id),
    };

    try {
      await axios.post(`${API_BASE_URL}/create`, payload);
      navigate("/chat");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMember = (user) => {
    setSelectedMembers((prevMembers) => [...prevMembers, user]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemoveMember = (userId) => {
    if (userId === currentUser.id) return; // Prevent removing the creator
    setSelectedMembers((prevMembers) =>
      prevMembers.filter((m) => m.id !== userId)
    );
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <RandomPageTransition>
      <div className="flex items-center justify-center min-h-screen bg-background-form p-4">
        <div className="w-full max-w-xl bg-card-bg p-8 rounded-xl shadow-lg">
          <div className="flex items-center mb-6">
            <button
              onClick={handleGoBack}
              className="p-2 mr-4 text-on-background hover:bg-hover rounded-full transition-colors duration-200"
              title="Go back"
            >
              <FiArrowLeft size={24} />
            </button>
            <h2 className="text-2xl font-bold text-on-background">Create a New Group</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Group Name */}
            <div>
              <label className="block font-medium text-on-background mb-1">Group Name:</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                required
                className="w-full bg-input border border-border-color rounded-lg px-4 py-2.5 text-on-background placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary shadow-inner transition-colors duration-300"
              />
            </div>

            {/* Search Users */}
            <div>
              <label className="block font-medium text-on-background mb-1">Add Members:</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-12 pr-4 py-2.5 rounded-lg bg-input border border-border-color text-on-background placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary shadow-inner transition-colors duration-300"
                />
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-icon" />
              </div>
              {searchResults.length > 0 && (
                <div className="mt-2 bg-card-bg border border-border-color rounded-lg max-h-48 overflow-y-auto shadow-md">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleAddMember(user)}
                      className="px-4 py-3 hover:bg-hover cursor-pointer transition-colors duration-200 text-on-background"
                    >
                      {user.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Members */}
            <div>
              <label className="block font-medium text-on-background mb-2">Selected Members:</label>
              {selectedMembers.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {selectedMembers.map((member) => (
                    <li
                      key={member.id}
                      className="flex items-center bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {member.name}
                      {member.id === currentUser.id && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-primary-hover rounded-full text-white">
                          You
                        </span>
                      )}
                      {member.id !== currentUser.id && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.id)}
                          className="ml-2 text-primary-foreground hover:text-white"
                        >
                          ×
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">No members selected</p>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && <p className="text-sm text-destructive-foreground">{errorMessage}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !groupName || selectedMembers.length < 3}
              className={`w-full py-3 rounded-lg text-white font-semibold transition-all duration-300 transform shadow-md ${
                isSubmitting || !groupName || selectedMembers.length < 3
                  ? "bg-muted-foreground cursor-not-allowed"
                  : "bg-primary hover:bg-primary-hover hover:scale-105"
              }`}
            >
              {isSubmitting ? "Creating..." : "Create Group"}
            </button>
          </form>
        </div>
      </div>
    </RandomPageTransition>
  );
};