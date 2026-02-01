// src/components/util/auth.js
export const getAuthTokenFromCookie = () => {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("Authorization="))
    ?.split("=")[1];
};
