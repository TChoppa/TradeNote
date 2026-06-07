import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tradenote_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData, token) => {
    localStorage.setItem('tradenote_token', token);
    localStorage.setItem('tradenote_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('tradenote_token');
    localStorage.removeItem('tradenote_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);