import type { Transaction, Budget } from '@/types';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const financeStorage = {
  async getTransactions(userId?: string): Promise<Transaction[]> {
    try {
      const response = await axios.get(`${API_URL}/transactions`, { params: { userId } });
      return response.data;
    } catch (error) {
      console.error('Error loading transactions:', error);
      return [];
    }
  },

  async addTransaction(transaction: Transaction): Promise<void> {
    try {
      await axios.post(`${API_URL}/transactions`, transaction);
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  },

  async deleteTransaction(id: string, userId: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/transactions/${id}`, { params: { userId } });
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  },

  async clearUserData(userId: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/users/${userId}/data`);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  },

  async exportToCSV(userId: string): Promise<string> {
    const transactions = await this.getTransactions(userId);
    if (transactions.length === 0) {
      return 'No transactions to export';
    }

    const headers = ['Date', 'Type', 'Category', 'Amount', 'Note'];
    const rows = transactions.map(t => [
      t.date,
      t.type,
      t.category,
      t.amount.toString(),
      t.note || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  },

  async getBudgets(userId?: string): Promise<Budget[]> {
    try {
      const response = await axios.get(`${API_URL}/budgets`, { params: { userId } });
      return response.data;
    } catch (error) {
      console.error('Error loading budgets:', error);
      return [];
    }
  },

  async addBudget(budget: Budget): Promise<void> {
    try {
      await axios.post(`${API_URL}/budgets`, budget);
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  },

  async updateBudget(budgetId: string, userId: string, updates: Partial<Budget>): Promise<void> {
    try {
      await axios.put(`${API_URL}/budgets/${budgetId}`, updates, { params: { userId } });
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  },

  async deleteBudget(budgetId: string, userId: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/budgets/${budgetId}`, { params: { userId } });
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  }
};
