import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const email = await AsyncStorage.getItem('userEmail');
          const allUsers = await getAllUsers();
          if (allUsers[email]) {
            setUser({ email });
            setIsAuthenticated(true);
          } else {
            await signOut();
          }
        }
      } catch (e) {
        console.error('Error during initial auth check:', e);
      } finally {
        setIsAuthLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const getAllUsers = async () => {
    try {
      const usersJSON = await AsyncStorage.getItem('allUsers');
      return usersJSON ? JSON.parse(usersJSON) : {};
    } catch (e) {
      console.error('Error getting all users:', e);
      return {};
    }
  };

  const setAllUsers = async (users) => {
    try {
      await AsyncStorage.setItem('allUsers', JSON.stringify(users));
    } catch (e) {
      console.error('Error saving all users:', e);
    }
  };

  const signIn = async (email, password) => {
    try {
      const allUsers = await getAllUsers();
      const userData = allUsers[email];

      if (userData && userData.password === password) {
        const token = `token_${Date.now()}`;
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userEmail', email);

        setUser({ email });
        setIsAuthenticated(true);

        return { success: true };
      } else {
        return { success: false, message: 'Неверный email или пароль' };
      }
    } catch (e) {
      console.error('Error signing in:', e);
      return { success: false, message: 'Ошибка входа' };
    }
  };

  const signUp = async (email, password) => {
    try {
      const allUsers = await getAllUsers();

      if (allUsers[email]) {
        return { success: false, message: 'Пользователь с таким email уже существует' };
      }

      allUsers[email] = { password };
      await setAllUsers(allUsers);

      const token = `token_${Date.now()}`;
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userEmail', email);

      setUser({ email });
      setIsAuthenticated(true);
      setIsNewUser(true);

      return { success: true, isNewUser: true };
    } catch (e) {
      console.error('Error signing up:', e);
      return { success: false, message: 'Ошибка регистрации' };
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userEmail');

      setUser(null);
      setIsAuthenticated(false);
      setIsNewUser(false);
    } catch (e) {
      console.error('Error signing out:', e);
    }
  };

  const markUserAsOnboarded = () => {
    setIsNewUser(false);
  };

  const clearAuthStorage = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userEmail');
      await AsyncStorage.removeItem('allUsers');
    } catch (e) {
      console.error("Error clearing auth storage:", e);
    }
  };

  const value = {
    user,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    clearAuthStorage,
    isAuthLoading,
    isNewUser,
    markUserAsOnboarded,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}