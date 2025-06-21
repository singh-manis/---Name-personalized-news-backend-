import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoadingNotifications(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/notifications`, {
        headers: { 'x-auth-token': token }
      });
      setNotifications(res.data);
    } catch (err) {
      toast.error('Failed to fetch notifications');
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  const markAsRead = useCallback(async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/user/notifications/${id}/read`, {}, {
        headers: { 'x-auth-token': token }
      });
      setNotifications((prev) => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      toast.error('Failed to mark notification as read');
    }
  }, []);

  return {
    notifications,
    loadingNotifications,
    fetchNotifications,
    markAsRead,
    setNotifications,
  };
} 