// src/utils/session.js
// src/components/util/session.js
export const getSessionValue = (key, fallback = null) => {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Error parsing session value for key "${key}":`, error);
    return fallback;
  }
};


export const setSessionValue = (key, value) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};
