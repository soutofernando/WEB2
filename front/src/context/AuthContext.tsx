import React, { createContext, useContext, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAdmin: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Admin is determined by a special email or name convention
  // For this app, any logged-in user can be made admin via the admin page
  return (
    <AuthContext.Provider value={{ isAdmin: false }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
