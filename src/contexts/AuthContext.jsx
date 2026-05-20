import { createContext, useContext, useMemo, useState } from 'react';
import { getCurrentUser, login as loginUser, logout as logoutUser } from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getCurrentUser());

  const value = useMemo(
    () => ({
      user,
      login: async (identifier, password) => {
        await logoutUser();
        const authenticatedUser = await loginUser({ identifier, password });
        setUser(authenticatedUser);
        return authenticatedUser;
      },
      logout: async () => {
        await logoutUser();
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
