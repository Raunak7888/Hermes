import React, { useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Send the token to the server to invalidate it
      // const pureToken = Cookies.get('Authorization');
      // await axios.post('http://localhost:8080/api/logout', { token: pureToken });

      // Delete the token from cookies
      Cookies.remove("Authorization", { secure: true, sameSite: "Strict" });
      localStorage.clear();
      // console.log("Logout successful");
      navigate("/login"); // Redirect to login page or any other desired page
    } catch (error) {
      console.error(
        "Error during logout:",
        error.response?.data || error.message
      );
    }
  };

  const handleCancelLogout = () => {
    navigate("/chat"); // Redirect to chat page or any other desired page
  };

  return (
      <div className="center">
        <div className="anime">
        <div className="card">
          <p className="heading-primary white-text">Are you sure you want to logout?</p>
          <button className="card-button logout-yes-button" onClick={handleLogout}>
            Yes
          </button>
          <button className="card-button logout-no-button" onClick={handleCancelLogout}>
            No
          </button>
        </div>
      </div>
      </div>
  );
};

export default Logout;
