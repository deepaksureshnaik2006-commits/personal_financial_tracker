import type { User, AuthSession } from '@/types';

const USERS_KEY = 'finance_tracker_users';
const SESSION_KEY = 'finance_tracker_session';

export const authService = {
  getUsers(): User[] {
    try {
      const data = localStorage.getItem(USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  },

  saveUsers(users: User[]): void {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  },

  register(username: string, password: string): { success: boolean; message: string; user?: User } {
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

    const users = this.getUsers();
    
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, message: 'Username already exists' };
    }

    const isFirstUser = users.length === 0;
    const newUser: User = {
      id: Date.now().toString(),
      username,
      password,
      role: isFirstUser ? 'admin' : 'user',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);

    return { 
      success: true, 
      message: isFirstUser ? 'Account created successfully! You are the admin.' : 'Account created successfully!',
      user: newUser
    };
  },

  login(username: string, password: string): { success: boolean; message: string; user?: User } {
    if (!username || !password) {
      return { success: false, message: 'Username and password are required' };
    }

    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!user) {
      return { success: false, message: 'Invalid username or password' };
    }

    if (user.password !== password) {
      return { success: false, message: 'Invalid username or password' };
    }

    const session: AuthSession = {
      userId: user.id,
      username: user.username,
      role: user.role
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    return { success: true, message: 'Login successful', user };
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

  updateUserRole(userId: string, newRole: 'user' | 'admin'): { success: boolean; message: string } {
    const session = this.getSession();
    if (!session || session.role !== 'admin') {
      return { success: false, message: 'Unauthorized' };
    }

    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return { success: false, message: 'User not found' };
    }

    users[userIndex].role = newRole;
    this.saveUsers(users);

    if (session.userId === userId) {
      session.role = newRole;
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }

    return { success: true, message: 'User role updated successfully' };
  },

  deleteUser(userId: string): { success: boolean; message: string } {
    const session = this.getSession();
    if (!session || session.role !== 'admin') {
      return { success: false, message: 'Unauthorized' };
    }

    if (session.userId === userId) {
      return { success: false, message: 'Cannot delete your own account' };
    }

    const users = this.getUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    
    if (filteredUsers.length === users.length) {
      return { success: false, message: 'User not found' };
    }

    this.saveUsers(filteredUsers);
    return { success: true, message: 'User deleted successfully' };
  },

  deleteOwnAccount(): { success: boolean; message: string } {
    const session = this.getSession();
    if (!session) {
      return { success: false, message: 'Not authenticated' };
    }

    const users = this.getUsers();
    const filteredUsers = users.filter(u => u.id !== session.userId);
    
    if (filteredUsers.length === users.length) {
      return { success: false, message: 'User not found' };
    }

    this.saveUsers(filteredUsers);
    this.logout();
    return { success: true, message: 'Account deleted successfully' };
  }
};
