import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useUserRole, UserRole } from '../hooks/useUserRole';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: UserRole;
  isAdmin: boolean;
  isEditor: boolean;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  role: null,
  isAdmin: false,
  isEditor: false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoadingUser(false);
    });

    return unsubscribe;
  }, []);

  const { role, loading: loadingRole, isAdmin, isEditor } = useUserRole(user?.email, user?.uid);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading: loadingUser || loadingRole,
      role,
      isAdmin: isAdmin(),
      isEditor: isEditor()
    }}>
        {children}
    </AuthContext.Provider>
  );
};
