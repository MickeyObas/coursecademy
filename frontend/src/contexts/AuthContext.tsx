import { createContext, useContext, useState } from "react";
import type { ReactNode, SetStateAction } from 'react';

interface AuthContextType {
  login: (data: LoginResponseData) => void,
  user: LoginResponseData["user"] | null,
  setUser: React.Dispatch<SetStateAction<User | null>>
}

type User = {
  username: string,
  email: string,
}

interface LoginResponseData {
  access: string,
  // refresh: string,
  user: {
    username: string,
    email: string,
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const storedUser = localStorage.getItem('user')
  const [user, setUser] = useState<LoginResponseData["user"] | null>(
    storedUser ? JSON.parse(storedUser) : null
  );

  const login = (data: LoginResponseData) => {
    localStorage.setItem('accessToken', data.access);
    // localStorage.setItem('refreshToken', data.refresh);
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user);
  }

  return (
    <AuthContext.Provider value={{ login, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
