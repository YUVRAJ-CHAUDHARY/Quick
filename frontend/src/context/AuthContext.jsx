import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getMe } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Auto login on refresh
  useEffect(() => {
    const token = localStorage.getItem('quickToken');
    const savedUser = localStorage.getItem('quickUser');

    if (token && savedUser && savedUser !== "undefined") {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("User parse error");
      }

      getMe()
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('quickUser', JSON.stringify(res.data));
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // 🔐 LOGIN
  const login = async (email, password) => {
    try {
      const { data } = await loginUser({ email, password });
      
      // Backend direct data bhej raha hai, data.user nahi
      const userData = data; 
      const token = data.token;

      if (token) {
        localStorage.setItem('quickToken', token);
        localStorage.setItem('quickUser', JSON.stringify(userData));
        setUser(userData);
        return userData;
      }
    } catch (error) {
      console.error("Login failed:", error.response?.data?.message);
      throw error; // Isse frontend UI handle kar lega
    }
  };

  // 📝 REGISTER
  const register = async (formData) => {
    try {
      const { data } = await registerUser(formData);
      
      localStorage.setItem('quickToken', data.token);
      localStorage.setItem('quickUser', JSON.stringify(data));
      setUser(data);
      return data;
    } catch (error) {
      console.error("Register failed:", error);
      throw error;
    }
  };

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.removeItem('quickToken');
    localStorage.removeItem('quickUser');
    setUser(null);
  };

  // 🔄 Refresh user
  const refreshUser = async () => {
    try {
      const { data } = await getMe();
      setUser(data);
      localStorage.setItem('quickUser', JSON.stringify(data));
      return data;
    } catch (error) {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);