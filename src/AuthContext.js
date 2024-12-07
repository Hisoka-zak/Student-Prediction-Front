
// AuthContext.js
import React, { createContext, useState, useContext } from "react";

// Create Context
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);

// Provider Component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Function to authenticate the user
  const authenticate = (password) => {
    if (password === "Predict@2024") {
      setIsAuthenticated(true);
      return true;
    } else {
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, authenticate }}>
      {children}
    </AuthContext.Provider>
  );
};
