import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import config from "./backend_url";

const API_BASE_URL = `${config.apiBaseUrl}/auth`;

const CreateGroup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = location.state?.currentUser;

  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [responseMessage, setResponseMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedMembers.length < 3) {
      setErrorMessage("A group must have at least 3 members.");
      return;
    }

    // Payload to send to the backend
    const payload = {
      groupName: groupName,
      createdBy: currentUser,
      memberIds: selectedMembers.map((member) => member.id),
    };

    try {
      // Send POST request to the backend
      const response = await axios.post(`${API_BASE_URL}/create`, payload);

      // Handle success response
      setResponseMessage(`Group created successfully: ${response.data.groupName}`);
      setErrorMessage(null);
      setGroupName("");
      setSelectedMembers([]);

      // Redirect to /chat
      navigate("/chat");
    } catch (error) {
      // Handle error response
      setErrorMessage(error.response?.data?.message || "An error occurred");
      setResponseMessage(null);
    }
  };

  // Handler for user search
  const handleSearchChange = async (e) => {
    setSearchQuery(e.target.value);

    if (e.target.value.trim() === "") {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/Data/Search`, {
        params: { query: e.target.value },
      });
      const filteredResults = response.data.filter((user) => !user.group);
      setSearchResults(filteredResults);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  // Add user to the selected members list
  const handleAddMember = (user) => {
    if (!selectedMembers.find((member) => member.id === user.id)) {
      setSelectedMembers([...selectedMembers, user]);
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  // Remove user from the selected members list
  const handleRemoveMember = (userId) => {
    setSelectedMembers(selectedMembers.filter((member) => member.id !== userId));
  };

  return (
    <div className="center ">
      <div className="anime">
      <div className="card shadow">
        <h2 className="heading-primary">Create a New Group</h2>
        <form onSubmit={handleSubmit} className="form-group">
          {/* Group Name Field */}
          <div className="">
            <label className="label">Group Name:</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter the Group Name"
              required
              className="input-field"
            />
          </div>

          {/* Search Users Field */}
          <div className="form-group">
            <label className="label">Search Users:</label>
            <input
              type="text"
              placeholder="Search User by Name"
              value={searchQuery}
              onChange={handleSearchChange}
              className="input-field"
            />
            {searchResults.length > 0 && (
              <div className="search-results card  ">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="result-item"
                    onClick={() => handleAddMember(user)}
                  >
                    {user.name} {user.email}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Members List */}
          <div className="form-group">
            <label className="label">Selected Members:</label>
            {selectedMembers.length > 0 ? (
              <ul className="selected-members-list p-0">
                {selectedMembers.map((member) => (
                  <li key={member.id} className="selected-member">
                    {member.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.id)}
                      className="remove-member-button"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="20px"
                        viewBox="0 -960 960 960"
                        width="20px"
                        fill="#F00"
                      >
                        <path d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-members-message">No members selected</p>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" className="card-button create-group-button">
            Create Group
          </button>
        </form>

        {/* Response and Error Messages */}
        {responseMessage && (
          <p className="response-message message-success">{responseMessage}</p>
        )}
        {errorMessage && (
          <p className="error-message message-error">{errorMessage}</p>
        )}
      </div>
      </div>
    </div>
  );
};

export default CreateGroup;
