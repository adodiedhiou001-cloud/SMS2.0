'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, Organization } from '@/types';
import { authApi } from '@/lib/api';
import Cookies from 'js-cookie';

interface AuthState {
  user: User | null;
  organization: Organization | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; organization?: Organization; token: string } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User };

const initialState: AuthState = {
  user: null,
  organization: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        organization: action.payload.organization || null,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        organization: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        organization: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string, email?: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

useEffect(() => {
  // Check for existing token on mount
  const token = Cookies.get('token');
  if (token) {
    dispatch({ type: 'AUTH_START' });
    // Verify token with backend
    fetch('/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Token invalide');
        }
        const data = await response.json();
        if (data.success && data.data) {
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: data.data.user,
              organization: data.data.organization,
              token,
            },
          });
        } else {
          throw new Error('Réponse invalide');
        }
      })
      .catch((error) => {
        console.error('Token verification failed:', error);
        Cookies.remove('token');
        dispatch({ type: 'AUTH_FAILURE' });
      });
  } else {
    dispatch({ type: 'AUTH_FAILURE' });
  }
}, []);  const login = async (username: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur de connexion');
      }

      const data = await response.json();
      if (data.success && data.data) {
        const { token, user, organization } = data.data;
        
        Cookies.set('token', token, { expires: 7 }); // 7 days
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, organization, token },
        });
      } else {
        throw new Error('Réponse de connexion invalide');
      }
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: 'AUTH_FAILURE' });
      throw error;
    }
  };

  const signup = async (username: string, password: string, email?: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur de création de compte');
      }

      const data = await response.json();
      if (data.success && data.data) {
        const { token, user, organization } = data.data;
        
        Cookies.set('token', token, { expires: 7 });
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, organization, token },
        });
      } else {
        throw new Error('Réponse de création de compte invalide');
      }
    } catch (error) {
      console.error('Signup error:', error);
      dispatch({ type: 'AUTH_FAILURE' });
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove('token');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
