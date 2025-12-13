import type { Transaction, Budget } from '@/types';

const TRANSACTIONS_KEY = 'finance_tracker_transactions';
const BUDGETS_KEY = 'finance_tracker_budgets';

export const financeStorage = {
  getTransactions(userId?: string): Transaction[] {
    try {
      const data = localStorage.getItem(TRANSACTIONS_KEY);
      const allTransactions: Transaction[] = data ? JSON.parse(data) : [];
      return userId ? allTransactions.filter(t => t.userId === userId) : allTransactions;
    } catch (error) {
      console.error('Error loading transactions:', error);
      return [];
    }
  },

  saveTransactions(transactions: Transaction[]): void {
    try {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  },

  addTransaction(transaction: Transaction): void {
    const allTransactions = this.getTransactions();
    allTransactions.push(transaction);
    this.saveTransactions(allTransactions);
  },

  deleteTransaction(id: string, userId: string): void {
    const allTransactions = this.getTransactions();
    const filtered = allTransactions.filter(t => !(t.id === id && t.userId === userId));
    this.saveTransactions(filtered);
  },

  clearUserData(userId: string): void {
    const allTransactions = this.getTransactions();
    const filtered = allTransactions.filter(t => t.userId !== userId);
    this.saveTransactions(filtered);

    const allBudgets = this.getBudgets();
    const filteredBudgets = allBudgets.filter(b => b.userId !== userId);
    this.saveBudgets(filteredBudgets);
  },

  exportToCSV(userId: string): string {
    const transactions = this.getTransactions(userId);
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

  getBudgets(userId?: string): Budget[] {
    try {
      const data = localStorage.getItem(BUDGETS_KEY);
      const allBudgets: Budget[] = data ? JSON.parse(data) : [];
      return userId ? allBudgets.filter(b => b.userId === userId) : allBudgets;
    } catch (error) {
      console.error('Error loading budgets:', error);
      return [];
    }
  },

  saveBudgets(budgets: Budget[]): void {
    try {
      localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
    } catch (error) {
      console.error('Error saving budgets:', error);
    }
  },

  addBudget(budget: Budget): void {
    const allBudgets = this.getBudgets();
    allBudgets.push(budget);
    this.saveBudgets(allBudgets);
  },

  updateBudget(budgetId: string, userId: string, updates: Partial<Budget>): void {
    const allBudgets = this.getBudgets();
    const index = allBudgets.findIndex(b => b.id === budgetId && b.userId === userId);
    if (index !== -1) {
      allBudgets[index] = { ...allBudgets[index], ...updates };
      this.saveBudgets(allBudgets);
    }
  },

  deleteBudget(budgetId: string, userId: string): void {
    const allBudgets = this.getBudgets();
    const filtered = allBudgets.filter(b => !(b.id === budgetId && b.userId === userId));
    this.saveBudgets(filtered);
  }
};

