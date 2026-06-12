import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AUTH_EVENT = 'auth:changed';

export function notifyAuthChange() {
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!localStorage.getItem('token')) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/users/me');
      setUser(data);
    } catch {
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    window.addEventListener(AUTH_EVENT, fetchUser);
    return () => window.removeEventListener(AUTH_EVENT, fetchUser);
  }, [fetchUser]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    notifyAuthChange();
  }, []);

  return { user, loading, fetchUser, logout };
}
