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

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const email = await AsyncStorage.getItem('userEmail');
          // Проверяем, что пользователь с таким email действительно существует в списке
          const allUsers = await getAllUsers();
          if (allUsers[email]) {
            setUser({ email });
            setIsAuthenticated(true);
          } else {
            // Токен есть, но пользователь удален из списка - очищаем сессию
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

  // Вспомогательная функция для получения всех пользователей
  const getAllUsers = async () => {
    try {
      const usersJSON = await AsyncStorage.getItem('allUsers');
      return usersJSON ? JSON.parse(usersJSON) : {};
    } catch (e) {
      console.error('Error getting all users:', e);
      return {};
    }
  };

  // Вспомогательная функция для сохранения всех пользователей
  const setAllUsers = async (users) => {
    try {
      await AsyncStorage.setItem('allUsers', JSON.stringify(users));
    } catch (e) {
      console.error('Error saving all users:', e);
    }
  };

  const signIn = async (email, password) => {
    try {
      console.log("signIn: Attempting to sign in for email:", email);

      const allUsers = await getAllUsers();
      const userData = allUsers[email];

      if (userData && userData.password === password) {
        const token = `token_${Date.now()}`;
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userEmail', email); // Сохраняем текущий email

        setUser({ email });
        setIsAuthenticated(true);

        console.log("signIn: Success, user set and authenticated");
        return { success: true };
      } else {
        console.log("signIn: Invalid credentials");
        return { success: false, message: 'Неверный email или пароль' };
      }
    } catch (e) {
      console.error('Error signing in:', e);
      return { success: false, message: 'Ошибка входа' };
    }
  };

  const signUp = async (email, password) => {
    try {
      console.log("signUp: Attempting to register for email:", email);

      const allUsers = await getAllUsers();

      // Проверяем, существует ли уже пользователь с таким email
      if (allUsers[email]) {
        console.log("signUp: ERROR - user already exists:", email);
        return { success: false, message: 'Пользователь с таким email уже существует' };
      }

      console.log("signUp: No existing user, proceeding with registration...");

      // Добавляем нового пользователя в объект
      allUsers[email] = { password };
      await setAllUsers(allUsers);

      // Создаём токен и устанавливаем текущего пользователя
      const token = `token_${Date.now()}`;
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userEmail', email);

      setUser({ email });
      setIsAuthenticated(true); // Входим автоматически

      console.log("signUp: Registration successful, user set, isAuthenticated = true");

      return { success: true };
    } catch (e) {
      console.error('Error signing up:', e);
      return { success: false, message: 'Ошибка регистрации' };
    }
  };

  const signOut = async () => {
    try {
      // Удаляем токен и email текущего пользователя
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userEmail');

      setUser(null);
      setIsAuthenticated(false);
    } catch (e) {
      console.error('Error signing out:', e);
    }
  };

  // Функция для очистки *всех* данных аутентификации (для отладки)
  const clearAuthStorage = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userEmail');
      await AsyncStorage.removeItem('allUsers'); // Удаляем список всех пользователей
      console.log("AuthProvider: All auth storage cleared");
    } catch (e) {
      console.error("AuthProvider: Error clearing auth storage:", e);
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}