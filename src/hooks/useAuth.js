import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user_session')) || null;
    } catch {
      return null;
    }
  });

  const login = useCallback((credentialResponse) => {
    // Decoding JWT credential payload returned by Google
    try {
      const payloadBase64 = credentialResponse.credential.split('.')[1];
      const decodedJson = atob(payloadBase64);
      const decoded = JSON.parse(decodedJson);
      
      const userData = {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        seat: null // Empty seat initially
      };
      
      setUser(userData);
      localStorage.setItem('user_session', JSON.stringify(userData));
    } catch (e) {
      console.error('Failed to decode google credential', e);
    }
  }, []);

  const updateSeat = useCallback((seatInfo) => {
    setUser(prev => {
      const updated = { ...prev, seat: seatInfo };
      localStorage.setItem('user_session', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user_session');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateSeat }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
