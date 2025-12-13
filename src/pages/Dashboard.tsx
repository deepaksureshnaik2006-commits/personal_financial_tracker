import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Download, 
  Trash2,
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Receipt,
  Gamepad2,
  DollarSign,
  Briefcase,
  PiggyBank,
  Gift,
  MoreHorizontal,
  Search,
  Target,
  AlertTriangle,
  Calendar,
  Settings,
  UserX
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { Transaction, TransactionType, ExpenseCategory, IncomeCategory, Budget } from '@/types';
import { financeStorage } from '@/services/financeStorage';
import { authService } from '@/services/authService';
import { format, startOfWeek, startOfMonth, endOfWeek, endOfMonth, isWithinInterval } from 'date-fns';

const EXPENSE_CATEGORIES: ExpenseCategory[] = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'];
const INCOME_CATEGORIES: IncomeCategory[] = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Food: UtensilsCrossed,
  Transport: Car,
  Shopping: ShoppingBag,
  Bills: Receipt,
  Entertainment: Gamepad2,
  Salary: DollarSign,
  Freelance: Briefcase,
  Investment: PiggyBank,
  Gift: Gift,
  Other: MoreHorizontal
};

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))'
];

export default function Dashboard() {
  const navigate = useNavigate();
  const session = authService.getSession();
  const userId = session?.userId || '';

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [budgetCategory, setBudgetCategory] = useState<ExpenseCategory>('Food');
  const [budgetLimit, setBudgetLimit] = useState<string>('');
  const [budgetPeriod, setBudgetPeriod] = useState<'weekly' | 'monthly'>('monthly');

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = () => {
    const userTransactions = financeStorage.getTransactions(userId);
    const userBudgets = financeStorage.getBudgets(userId);
    setTransactions(userTransactions);
    setBudgets(userBudgets);
  };

  const summary = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses
    };
  }, [transactions]);

  const expensesByCategory = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryTotals: Record<string, number> = {};
    
    expenses.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    
    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value
    }));
  }, [transactions]);

  const incomeVsExpenses = useMemo(() => {
    return [
      { name: 'Income', value: summary.totalIncome },
      { name: 'Expenses', value: summary.totalExpenses }
    ];
  }, [summary]);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === filterCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.note?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (dateFrom) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(dateFrom));
    }

    if (dateTo) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(dateTo));
    }

    return filtered;
  }, [transactions, filterCategory, searchQuery, dateFrom, dateTo]);

  const budgetAlerts = useMemo(() => {
    const alerts: Array<{ category: ExpenseCategory; spent: number; limit: number; percentage: number }> = [];
    const now = new Date();

    budgets.forEach(budget => {
      const periodStart = budget.period === 'weekly' ? startOfWeek(now) : startOfMonth(now);
      const periodEnd = budget.period === 'weekly' ? endOfWeek(now) : endOfMonth(now);

      const spent = transactions
        .filter(t => 
          t.type === 'expense' &&
          t.category === budget.category &&
          isWithinInterval(new Date(t.date), { start: periodStart, end: periodEnd })
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const percentage = (spent / budget.limitAmount) * 100;

      if (percentage >= 80) {
        alerts.push({
          category: budget.category,
          spent,
          limit: budget.limitAmount,
          percentage
        });
      }
    });

    return alerts;
  }, [budgets, transactions]);

  const handleAddTransaction = () => {
    if (!category || !amount || Number.parseFloat(amount) <= 0) {
      toast.error('Please fill in all required fields with valid values');
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      userId,
      type: transactionType,
      category: category as ExpenseCategory | IncomeCategory,
      amount: Number.parseFloat(amount),
      date,
      note,
      createdAt: new Date().toISOString()
    };

    financeStorage.addTransaction(newTransaction);
    setTransactions([...transactions, newTransaction]);
    
    setCategory('');
    setAmount('');
    setNote('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    
    toast.success('Transaction added successfully');
  };

  const handleDeleteTransaction = (id: string) => {
    financeStorage.deleteTransaction(id, userId);
    setTransactions(transactions.filter(t => t.id !== id));
    toast.success('Transaction deleted');
  };

  const handleExportCSV = () => {
    const csvContent = financeStorage.exportToCSV(userId);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-tracker-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const handleClearAll = () => {
    financeStorage.clearUserData(userId);
    setTransactions([]);
    setBudgets([]);
    toast.success('All data cleared');
  };

  const handleAddBudget = () => {
    if (!budgetLimit || Number.parseFloat(budgetLimit) <= 0) {
      toast.error('Please enter a valid budget limit');
      return;
    }

    const existingBudget = budgets.find(b => b.category === budgetCategory && b.period === budgetPeriod);
    if (existingBudget) {
      toast.error(`A ${budgetPeriod} budget for ${budgetCategory} already exists`);
      return;
    }

    const newBudget: Budget = {
      id: Date.now().toString(),
      userId,
      category: budgetCategory,
      limitAmount: Number.parseFloat(budgetLimit),
      period: budgetPeriod,
      createdAt: new Date().toISOString()
    };

    financeStorage.addBudget(newBudget);
    setBudgets([...budgets, newBudget]);
    setBudgetDialogOpen(false);
    setBudgetLimit('');
    toast.success('Budget added successfully');
  };

  const handleDeleteBudget = (budgetId: string) => {
    financeStorage.deleteBudget(budgetId, userId);
    setBudgets(budgets.filter(b => b.id !== budgetId));
    toast.success('Budget deleted');
  };

  const handleDeleteAccount = () => {
    financeStorage.clearUserData(userId);
    const result = authService.deleteOwnAccount();
    if (result.success) {
      toast.success(result.message);
      window.history.replaceState(null, '', '/login');
      navigate('/login', { replace: true });
    } else {
      toast.error(result.message);
    }
  };

  const getCategoryIcon = (category: string) => {
    const Icon = CATEGORY_ICONS[category] || MoreHorizontal;
    return <Icon className="w-4 h-4" />;
  };

  const getBudgetProgress = (budget: Budget) => {
    const now = new Date();
    const periodStart = budget.period === 'weekly' ? startOfWeek(now) : startOfMonth(now);
    const periodEnd = budget.period === 'weekly' ? endOfWeek(now) : endOfMonth(now);

    const spent = transactions
      .filter(t => 
        t.type === 'expense' &&
        t.category === budget.category &&
        isWithinInterval(new Date(t.date), { start: periodStart, end: periodEnd })
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const percentage = Math.min((spent / budget.limitAmount) * 100, 100);
    return { spent, percentage };
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 xl:p-8 space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <h1 className="text-3xl xl:text-4xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Track your income and expenses</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportCSV} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your transactions and budgets.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAll}>Delete All</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {budgetAlerts.length > 0 && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-4 h-4" />
                Budget Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {budgetAlerts.map((alert, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium">{alert.category}</span>: ₹{alert.spent.toFixed(2)} / ₹{alert.limit.toFixed(2)} ({alert.percentage.toFixed(0)}%)
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                ₹{summary.balance.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-success">
                <TrendingUp className="w-4 h-4" />
                Total Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">
                ₹{summary.totalIncome.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-destructive">
                <TrendingDown className="w-4 h-4" />
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">
                ₹{summary.totalExpenses.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add Transaction</CardTitle>
                  <CardDescription>Record a new income or expense</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Transaction Type</Label>
                    <Select value={transactionType} onValueChange={(value) => {
                      setTransactionType(value as TransactionType);
                      setCategory('');
                    }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {(transactionType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(cat => (
                          <SelectItem key={cat} value={cat}>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(cat)}
                              {cat}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Amount (₹)</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Note (Optional)</Label>
                    <Textarea
                      placeholder="Add a note..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleAddTransaction} className="w-full gap-2">
                    <Plus className="w-4 h-4" />
                    Add Transaction
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>View and manage your transactions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">From</Label>
                        <Input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">To</Label>
                        <Input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                        />
                      </div>
                    </div>

                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {[...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredTransactions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No transactions found
                      </div>
                    ) : (
                      filteredTransactions
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map(transaction => (
                          <div
                            key={transaction.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                                {getCategoryIcon(transaction.category)}
                              </div>
                              <div>
                                <div className="font-medium">{transaction.category}</div>
                                <div className="text-sm text-muted-foreground">
                                  {format(new Date(transaction.date), 'MMM dd, yyyy')}
                                </div>
                                {transaction.note && (
                                  <div className="text-xs text-muted-foreground mt-1">{transaction.note}</div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className={`font-bold ${transaction.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                                {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteTransaction(transaction.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="budgets" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Budget Management</CardTitle>
                    <CardDescription>Set spending limits for categories</CardDescription>
                  </div>
                  <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Budget
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Budget</DialogTitle>
                        <DialogDescription>Set a spending limit for a category</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select value={budgetCategory} onValueChange={(value) => setBudgetCategory(value as ExpenseCategory)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {EXPENSE_CATEGORIES.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Limit Amount (₹)</Label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={budgetLimit}
                            onChange={(e) => setBudgetLimit(e.target.value)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Period</Label>
                          <Select value={budgetPeriod} onValueChange={(value) => setBudgetPeriod(value as 'weekly' | 'monthly')}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleAddBudget} className="w-full">
                          Create Budget
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgets.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No budgets set. Create one to track your spending!
                    </div>
                  ) : (
                    budgets.map(budget => {
                      const { spent, percentage } = getBudgetProgress(budget);
                      return (
                        <div key={budget.id} className="p-4 rounded-lg border bg-card space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-primary/10 text-primary">
                                {getCategoryIcon(budget.category)}
                              </div>
                              <div>
                                <div className="font-medium">{budget.category}</div>
                                <div className="text-sm text-muted-foreground capitalize">{budget.period}</div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteBudget(budget.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>₹{spent.toFixed(2)} / ₹{budget.limitAmount.toFixed(2)}</span>
                              <span className={percentage >= 100 ? 'text-destructive font-medium' : ''}>{percentage.toFixed(0)}%</span>
                            </div>
                            <Progress value={percentage} className={percentage >= 80 ? 'bg-destructive/20' : ''} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Expense Breakdown</CardTitle>
                  <CardDescription>Distribution by category</CardDescription>
                </CardHeader>
                <CardContent>
                  {expensesByCategory.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No expense data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={expensesByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {expensesByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value: number) => `₹${value.toFixed(2)}`}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Income vs Expenses</CardTitle>
                  <CardDescription>Comparison overview</CardDescription>
                </CardHeader>
                <CardContent>
                  {incomeVsExpenses.every(item => item.value === 0) ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No financial data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={incomeVsExpenses}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                        <YAxis stroke="hsl(var(--foreground))" />
                        <RechartsTooltip 
                          formatter={(value: number) => `₹${value.toFixed(2)}`}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Account Settings
                </CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border bg-card">
                    <h3 className="font-medium mb-2">Account Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Username:</span>
                        <span className="font-medium">{session?.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Role:</span>
                        <Badge variant={session?.role === 'admin' ? 'default' : 'secondary'}>
                          {session?.role}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Transactions:</span>
                        <span className="font-medium">{transactions.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Active Budgets:</span>
                        <span className="font-medium">{budgets.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/5">
                    <h3 className="font-medium mb-2 text-destructive flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Danger Zone
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Once you delete your account, there is no going back. This will permanently delete your account and all associated data.
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="gap-2">
                          <UserX className="w-4 h-4" />
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account and remove all your data including:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>All transactions ({transactions.length} total)</li>
                              <li>All budgets ({budgets.length} total)</li>
                              <li>Account information</li>
                            </ul>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Yes, Delete My Account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
