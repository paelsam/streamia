import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { eventBus, EVENTS } from '@streamia/shared/events';
import { TokenManager } from '@streamia/shared/utils';
import { User, AuthState } from '@streamia/shared/types';
import { createLogger } from '@streamia/shared/utils';

const logger = createLogger('Shell-Store');

interface SharedStoreContext extends AuthState {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  login: (user: User, token: string) => void;
}

const SharedStoreContext = createContext<SharedStoreContext | undefined>(undefined);

// Helper to get initial state from localStorage
const getInitialUser = (): User | null => {
  try {
    const storedUser = localStorage.getItem('user');
    const token = TokenManager.getToken();
    if (storedUser && token && TokenManager.isValidToken(token)) {
      return JSON.parse(storedUser);
    }
  } catch (error) {
    logger.error('Error getting initial user', error);
  }
  return null;
};

const getInitialAuth = (): boolean => {
  const token = TokenManager.getToken();
  const user = localStorage.getItem('user');
  return !!(token && TokenManager.isValidToken(token) && user);
};

export const SharedStoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(getInitialUser);
  const [token, setTokenState] = useState<string | null>(() => TokenManager.getToken());
  const [isAuthenticated, setIsAuthenticated] = useState(getInitialAuth);

  // Log initial state
  useEffect(() => {
    logger.info('SharedStore initialized', { 
      isAuthenticated, 
      hasUser: !!user, 
      hasToken: !!token,
      userName: user?.firstName 
    });
  }, []);

  // Clean up invalid state on mount
  useEffect(() => {
    const currentToken = TokenManager.getToken();
    const storedUser = localStorage.getItem('user');
    
    if (!currentToken || !TokenManager.isValidToken(currentToken)) {
      // Token invalid or expired, clean up
      logger.info('Cleaning up invalid token state');
      TokenManager.removeToken();
      localStorage.removeItem('user');
      setUserState(null);
      setTokenState(null);
      setIsAuthenticated(false);
    } else if (currentToken && !storedUser) {
      // Token exists but no user, clean up
      logger.info('Token exists but no user, cleaning up');
      TokenManager.removeToken();
      setTokenState(null);
      setIsAuthenticated(false);
    }
  }, []);

  // Subscribe to events from microfrontends
  useEffect(() => {
    logger.info('Setting up event subscriptions');

    const unsubLogin = eventBus.subscribe(EVENTS.USER_LOGIN, (data: { user: User; token: string } | User) => {
      // Handle both formats: { user, token } or just user (for backwards compatibility)
      const userData = 'user' in data && data.user ? data.user : data as User;
      const tokenData = 'token' in data ? data.token : TokenManager.getToken();
      
      logger.info('USER_LOGIN event received', { userId: userData.id, hasToken: !!tokenData });
      setUserState(userData);
      if (tokenData) {
        setTokenState(tokenData);
        TokenManager.setToken(tokenData);
      }
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
    });

    const unsubLogout = eventBus.subscribe(EVENTS.USER_LOGOUT, () => {
      logger.info('USER_LOGOUT event received');
      setUserState(null);
      setTokenState(null);
      setIsAuthenticated(false);
      TokenManager.removeToken();
      localStorage.removeItem('user');
    });

    const unsubUpdated = eventBus.subscribe(EVENTS.USER_UPDATED, (data: { user: User }) => {
      logger.info('USER_UPDATED event received', { userId: data.user.id });
      setUserState(data.user);
    });

    return () => {
      unsubLogin();
      unsubLogout();
      unsubUpdated();
    };
  }, []);

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      logger.debug('User set', { userId: newUser.id });
    }
  };

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      TokenManager.setToken(newToken);
      setIsAuthenticated(true);
    } else {
      TokenManager.removeToken();
      setIsAuthenticated(false);
    }
  };

  const login = (newUser: User, newToken: string) => {
    logger.info('Login called from Shell', { userId: newUser.id });
    setUserState(newUser);
    setTokenState(newToken);
    setIsAuthenticated(true);
    TokenManager.setToken(newToken);
    eventBus.publish(EVENTS.USER_LOGIN, { user: newUser, token: newToken });
  };

  const logout = () => {
    logger.info('Logout called from Shell');
    setUserState(null);
    setTokenState(null);
    setIsAuthenticated(false);
    TokenManager.removeToken();
    localStorage.removeItem('user');
    eventBus.publish(EVENTS.USER_LOGOUT);
  };

  return (
    <SharedStoreContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        setUser,
        setToken,
        logout,
        login,
      }}
    >
      {children}
    </SharedStoreContext.Provider>
  );
};

export const useSharedStore = (): SharedStoreContext => {
  const context = useContext(SharedStoreContext);
  if (!context) {
    throw new Error('useSharedStore must be used within SharedStoreProvider');
  }
  return context;
};
