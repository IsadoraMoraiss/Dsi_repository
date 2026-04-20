import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserData {
  nome: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<boolean>;
  cadastro: (nome: string, email: string, senha: string) => Promise<boolean>;
  verificarOTP: (codigo: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verifica se há usuário logado ao iniciar
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      // Aqui você pode fazer uma validação com seu backend
      // Por enquanto, salvamos os dados localmente
      const userData: UserData = {
        nome: email.split('@')[0], // Usa a parte anterior do email como nome para exemplo
        email,
      };
      
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('userPassword', senha);
      
      setUser(userData);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const cadastro = async (nome: string, email: string, senha: string): Promise<boolean> => {
    try {
      // Aqui você pode fazer uma chamada para seu backend para salvar o cadastro
      const userData: UserData = {
        nome,
        email,
      };
      
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('userPassword', senha);
      await AsyncStorage.setItem('userNome', nome);
      
      setUser(userData);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('userEmail');
      await AsyncStorage.removeItem('userPassword');
      await AsyncStorage.removeItem('userNome');
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const verificarOTP = async (codigo: string) => {
    try {
      // Aqui você pode fazer uma validação com seu backend
      // Por enquanto, apenas confirmamos o OTP localmente
      await AsyncStorage.setItem('isVerified', 'true');
      // O usuário já foi marcado como autenticado durante o cadastro
    } catch (error) {
      console.error('Erro ao verificar OTP:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        login,
        cadastro,
        verificarOTP,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
