// context/AuthContext.jsx
// This makes login state available everywhere in the app

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in when page loads
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Helper checks
  const isLoggedIn = !!token;
  const isAdmin = user?.role === 'admin';
  const isSeller = user?.role === 'seller';
  const isCustomer = user?.role === 'customer';
  const isApprovedSeller = isSeller && user?.seller_status === 'approved';

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, logout,
      isLoggedIn, isAdmin, isSeller, isCustomer, isApprovedSeller,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook so any component can access auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};