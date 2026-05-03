import type { User, AuthSession } from '@/types';
import axios from 'axios';

const SESSION_KEY = 'finance_tracker_session';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const authService = {
  async getUsers(): Promise<User[]> {
    try {
      const response = await axios.get(`${API_URL}/users`);
      return response.data;
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  },

  async register(username: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    if (!username || !password) {
      return { success: false, message: 'Username and password are required' };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { success: false, message: 'Username can only contain letters, numbers, and underscores' };
    }

    if (username.length < 3) {
      return { success: false, message: 'Username must be at least 3 characters long' };
    }

    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long' };
    }

    try {
      const users = await this.getUsers();
      const isFirstUser = users.length === 0;

      const newUser: User = {
        id: Date.now().toString(),
        username,
        password,
        role: isFirstUser ? 'admin' : 'user',
        createdAt: new Date().toISOString()
      };

      await axios.post(`${API_URL}/users`, newUser);
      return { 
        success: true, 
        message: isFirstUser ? 'Account created successfully! You are the admin.' : 'Account created successfully!',
        user: newUser
      };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.error || 'Registration failed' };
    }
  },

  async login(username: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    if (!username || !password) {
      return { success: false, message: 'Username and password are required' };
    }

    try {
      const response = await axios.post(`${API_URL}/users/login`, { username, password });
      const user = response.data;

      const session: AuthSession = {
        userId: user.id,
        username: user.username,
        role: user.role
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(session));

      return { success: true, message: 'Login successful', user };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.error || 'Invalid username or password' };
    }
  },

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
  },

  getSession(): AuthSession | null {
    try {
      const data = localStorage.getItem(SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading session:', error);
      return null;
    }
  },

  isAuthenticated(): boolean {
    return this.getSession() !== null;
  },

  isAdmin(): boolean {
    const session = this.getSession();
    return session?.role === 'admin';
  },

  async updateUserRole(userId: string, newRole: 'user' | 'admin'): Promise<{ success: boolean; message: string }> {
    const session = this.getSession();
    if (!session || session.role !== 'admin') {
      return { success: false, message: 'Unauthorized' };
    }

    try {
      await axios.put(`${API_URL}/users/${userId}/role`, { role: newRole });
      
      if (session.userId === userId) {
        session.role = newRole;
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      }
      return { success: true, message: 'User role updated successfully' };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.error || 'Update failed' };
    }
  },

  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    const session = this.getSession();
    if (!session || session.role !== 'admin') {
      return { success: false, message: 'Unauthorized' };
    }

    if (session.userId === userId) {
      return { success: false, message: 'Cannot delete your own account' };
    }

    try {
      await axios.delete(`${API_URL}/users/${userId}`);
      return { success: true, message: 'User deleted successfully' };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.error || 'Delete failed' };
    }
  },

  async deleteOwnAccount(): Promise<{ success: boolean; message: string }> {
    const session = this.getSession();
    if (!session) {
      return { success: false, message: 'Not authenticated' };
    }

    try {
      await axios.delete(`${API_URL}/users/${session.userId}`);
      this.logout();
      return { success: true, message: 'Account deleted successfully' };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.error || 'Delete failed' };
    }
  }
};
