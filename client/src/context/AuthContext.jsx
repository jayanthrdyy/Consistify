import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('consistify_token');
    const savedUser = localStorage.getItem('consistify_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      authService.getMe().then(res => {
        setUser(res.data.user);
        localStorage.setItem('consistify_user', JSON.stringify(res.data.user));
      }).catch(() => {
        localStorage.removeItem('consistify_token');
        localStorage.removeItem('consistify_user');
        setUser(null);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const { token, user } = res.data;
    localStorage.setItem('consistify_token', token);
    localStorage.setItem('consistify_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const signup = async (name, email, password) => {
    const res = await authService.signup({ name, email, password });
    const { token, user } = res.data;
    localStorage.setItem('consistify_token', token);
    localStorage.setItem('consistify_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('consistify_token');
    localStorage.removeItem('consistify_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
