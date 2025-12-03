import { useState, useEffect } from 'react';
import { expensesAPI, budgetsAPI, incomeAPI, savingsGoalsAPI, recurringExpensesAPI } from '../services/api';
import type { Expense, Budget, Income, SavingsGoal, RecurringExpense } from '../types';
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface DashboardTabProps {
  onAddTransaction: () => void;
  onNavigateToBudgets: () => void;
  onNavigateToIncome: () => void;
  onNavigateToSavings: () => void;
  onNavigateToRecurring: () => void;
  onNavigateToTransactions: () => void;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const DashboardTab = ({ onAddTransaction, onNavigateToBudgets, onNavigateToIncome, onNavigateToSavings, onNavigateToRecurring, onNavigateToTransactions }: DashboardTabProps) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showBudgetHistory, setShowBudgetHistory] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [expensesRes, budgetsRes, statsRes, incomesRes, savingsRes, recurringRes] = await Promise.all([
        expensesAPI.getExpenses(),
        budgetsAPI.getBudgets(),
        expensesAPI.getDashboardStats(),
        incomeAPI.getIncomes(),
        savingsGoalsAPI.getSavingsGoals(),
        recurringExpensesAPI.getRecurringExpenses(),
      ]);
      setExpenses(expensesRes.expenses);
      setBudgets(budgetsRes.budgets || []);
      setDashboardStats(statsRes.stats);
      setIncomes(incomesRes.incomes || []);
      setSavingsGoals(savingsRes.savingsGoals || []);
      setRecurringExpenses(recurringRes.recurringExpenses || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const monthlyExpenses = expenses.filter(exp => 
    new Date(exp.date) >= thisMonth
  );
  const monthlyExpensesTotal = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const monthlyIncomes = incomes.filter(inc => 
    new Date(inc.date) >= thisMonth
  );
  const monthlyIncomesTotal = monthlyIncomes.reduce((sum, inc) => sum + inc.amount, 0);

  const disposableIncome = monthlyIncomesTotal - monthlyExpensesTotal;

  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalSavingsTarget = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const savingsProgress = totalSavingsTarget > 0 ? Math.round((totalSaved / totalSavingsTarget) * 100) : 0;

  // Prepare chart data
  const categoryChartData = dashboardStats?.categoryData?.map((item: any) => ({
    name: item.category,
    value: item.total
  })) || [];

  const weeklyTrendData = dashboardStats?.weeklyTrend?.map((item: any) => ({
    name: item.week,
    amount: item.total
  })) || [];

  const budgetVsActualData = dashboardStats?.budgetComparisons?.map((item: any) => ({
    name: item.category,
    Budget: item.budget,
    Spent: item.spent
  })) || [];

  const cardStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
  };

  const statCardStyle = {
    ...cardStyle,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  };

  // Export to CSV function
  const handleExportCSV = () => {
    const csvContent = [
      ['Date', 'Name', 'Category', 'Amount', 'Notes'],
      ...expenses.map(e => [
        new Date(e.date).toLocaleDateString(),
        e.name,
        e.category,
        e.amount.toString(),
        e.notes || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budgetbuddy-expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
      
      {/* Overview Cards - Top Row (2 Wide Cards) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '24px',
        marginBottom: '24px',
        animation: 'fadeIn 0.5s ease-out',
      }}>
        {/* Total Income This Month - Wide Card */}
        <div style={{
          ...statCardStyle,
          background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
          borderLeft: '4px solid #0284c7',
          transition: 'transform 0.3s, box-shadow 0.3s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(2, 132, 199, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        }}>
          <div style={{ fontSize: '14px', color: '#075985', fontWeight: '600' }}>
            💵 Total Income
          </div>
          <div style={{ fontSize: '40px', fontWeight: '800', color: '#0284c7' }}>
            ₱{monthlyIncomesTotal.toFixed(2)}
          </div>
          <div style={{ fontSize: '12px', color: '#0891b2' }}>
            This Month • {monthlyIncomes.length} {monthlyIncomes.length === 1 ? 'transaction' : 'transactions'}
          </div>
        </div>

        {/* Total Expenses This Month - Wide Card */}
        <div style={{
          ...statCardStyle,
          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
          borderLeft: '4px solid #10b981',
          transition: 'transform 0.3s, box-shadow 0.3s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(16, 185, 129, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        }}>
          <div style={{ fontSize: '14px', color: '#065f46', fontWeight: '600' }}>
            💸 Total Expenses
          </div>
          <div style={{ fontSize: '40px', fontWeight: '800', color: '#10b981' }}>
            ₱{monthlyExpensesTotal.toFixed(2)}
          </div>
          <div style={{ fontSize: '12px', color: '#34d399' }}>
            This Month • {monthlyExpenses.length} {monthlyExpenses.length === 1 ? 'transaction' : 'transactions'}
          </div>
        </div>
      </div>

      {/* Overview Cards - Bottom Row (4 Cards) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '24px',
        marginBottom: '32px',
        animation: 'fadeIn 0.5s ease-out 0.1s both',
      }}>
        {/* Disposable Income */}
        <div style={{
          ...statCardStyle,
          background: 'linear-gradient(135deg, #fef3c7, #fde047)',
          borderLeft: '4px solid #eab308',
          transition: 'transform 0.3s, box-shadow 0.3s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(234, 179, 8, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        }}>
          <div style={{ fontSize: '14px', color: '#854d0e', fontWeight: '600' }}>
            💰 Disposable
          </div>
          <div style={{ fontSize: '36px', fontWeight: '800', color: disposableIncome >= 0 ? '#ca8a04' : '#ef4444' }}>
            ₱{Math.abs(disposableIncome).toFixed(2)}
          </div>
          <div style={{ fontSize: '12px', color: '#a16207' }}>
            {disposableIncome >= 0 ? 'Available' : 'Overspent'}
          </div>
        </div>

        {/* Active Budgets */}
        <div style={{
          ...statCardStyle,
          background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
          borderLeft: '4px solid #6366f1',
          transition: 'transform 0.3s, box-shadow 0.3s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(99, 102, 241, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        }}>
          <div style={{ fontSize: '14px', color: '#3730a3', fontWeight: '600' }}>
            🎯 Active Budgets
          </div>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#6366f1' }}>
            {budgets.length}
          </div>
          <div style={{ fontSize: '12px', color: '#818cf8' }}>
            {budgets.filter(b => b.currentSpent && b.currentSpent >= b.amount * 0.9).length} near/exceeded
          </div>
        </div>

        {/* Savings Goals */}
        <div style={{
          ...statCardStyle,
          background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)',
          borderLeft: '4px solid #8b5cf6',
          transition: 'transform 0.3s, box-shadow 0.3s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(139, 92, 246, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        }}>
          <div style={{ fontSize: '14px', color: '#6b21a8', fontWeight: '600' }}>
            🎯 Savings Goals
          </div>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#8b5cf6' }}>
            {savingsGoals.length}
          </div>
          <div style={{ fontSize: '12px', color: '#a78bfa' }}>
            {savingsProgress}% progress
          </div>
        </div>

        {/* Recurring Expenses */}
        <div style={{
          ...statCardStyle,
          background: 'linear-gradient(135deg, #ffedd5, #fed7aa)',
          borderLeft: '4px solid #f97316',
          transition: 'transform 0.3s, box-shadow 0.3s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(249, 115, 22, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        }}>
          <div style={{ fontSize: '14px', color: '#9a3412', fontWeight: '600' }}>
            🔁 Recurring
          </div>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#f97316' }}>
            {recurringExpenses.length}
          </div>
          <div style={{ fontSize: '12px', color: '#fb923c' }}>
            {recurringExpenses.filter(r => r.isActive).length} active
          </div>
        </div>
      </div>

      {/* Budget Alerts Section */}
      {budgets.length > 0 && (
        <div style={{ ...cardStyle, marginBottom: '32px', animation: 'slideIn 0.5s ease-out', transition: 'transform 0.3s, box-shadow 0.3s' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
          }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '16px',
          }}>
            💰 Budget Overview
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {budgets.map(b => {
              const percent = b.currentSpent ? Math.min(100, Math.round((b.currentSpent / b.amount) * 100)) : 0;
              const isExceeded = b.currentSpent && b.currentSpent >= b.amount;
              const isNearLimit = b.currentSpent && b.currentSpent < b.amount && b.currentSpent >= b.amount * 0.9;
              
              return (
                <div key={b._id} style={{ 
                  padding: '16px', 
                  borderRadius: '8px', 
                  background: isExceeded ? '#fee2e2' : isNearLimit ? '#fef3c7' : '#f0fdf4',
                  border: `2px solid ${isExceeded ? '#ef4444' : isNearLimit ? '#f59e0b' : '#10b981'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontWeight: '600', fontSize: '15px' }}>
                      {b.category || 'Overall Budget'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                      {b.period}
                    </div>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${percent}%`, 
                        height: '100%', 
                        background: isExceeded ? '#ef4444' : isNearLimit ? '#f59e0b' : '#10b981',
                        transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                        animation: 'slideIn 0.8s ease-out'
                      }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#374151' }}>
                      ₱{(b.currentSpent || 0).toFixed(2)} / ₱{b.amount.toFixed(2)}
                    </span>
                    <span style={{ 
                      fontWeight: '600',
                      color: isExceeded ? '#ef4444' : isNearLimit ? '#f59e0b' : '#10b981'
                    }}>
                      {percent}%
                    </span>
                  </div>
                  {isExceeded && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#ef4444', fontWeight: '500' }}>
                      ⚠️ Budget exceeded!
                    </div>
                  )}
                  {isNearLimit && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#f59e0b', fontWeight: '500' }}>
                      ⚠️ Approaching limit
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        marginBottom: '32px',
        animation: 'fadeIn 0.6s ease-out 0.2s both',
      }}>
        {/* Spending by Category - Pie Chart */}
        <div style={{ ...cardStyle, transition: 'transform 0.3s, box-shadow 0.3s' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
          }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '16px',
          }}>
            📊 Spending by Category
          </h3>
          {categoryChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ₱${entry.value.toFixed(0)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryChartData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `₱${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
              No expense data for this month
            </div>
          )}
        </div>

        {/* Weekly Spending Trend - Line Chart */}
        <div style={{ ...cardStyle, transition: 'transform 0.3s, box-shadow 0.3s' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
          }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '16px',
          }}>
            📈 Weekly Spending Trend
          </h3>
          {weeklyTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: any) => `₱${value.toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
              No spending trend data available
            </div>
          )}
        </div>
      </div>

      {/* Budget vs Actual - Bar Chart */}
      {budgetVsActualData.length > 0 && (
        <div style={{ ...cardStyle, marginBottom: '32px', animation: 'fadeIn 0.6s ease-out 0.3s both', transition: 'transform 0.3s, box-shadow 0.3s' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
          }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '16px',
          }}>
            📊 Budget vs Actual Spending
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetVsActualData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => `₱${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="Budget" fill="#3b82f6" />
              <Bar dataKey="Spent" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Income vs Expenses - Area Chart */}
      {(monthlyIncomesTotal > 0 || monthlyExpensesTotal > 0) && (
        <div style={{ ...cardStyle, marginBottom: '32px', animation: 'fadeIn 0.6s ease-out 0.32s both', transition: 'transform 0.3s, box-shadow 0.3s' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
          }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '16px',
          }}>
            💰 Income vs Expenses Comparison
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: 'This Month', Income: monthlyIncomesTotal, Expenses: monthlyExpensesTotal }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => `₱${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="Income" fill="#0284c7" />
              <Bar dataKey="Expenses" fill="#eab308" />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: '16px', padding: '12px', background: disposableIncome >= 0 ? '#f0fdf4' : '#fee2e2', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: disposableIncome >= 0 ? '#065f46' : '#991b1b', fontWeight: '600' }}>
              {disposableIncome >= 0 ? '✅ Surplus' : '⚠️ Deficit'}: ₱{Math.abs(disposableIncome).toFixed(2)}
            </div>
            <div style={{ fontSize: '12px', color: disposableIncome >= 0 ? '#047857' : '#b91c1c', marginTop: '4px' }}>
              {disposableIncome >= 0 
                ? 'You are spending less than your income this month!' 
                : 'Your expenses exceed your income this month.'}
            </div>
          </div>
        </div>
      )}

      {/* Savings Goals Progress */}
      {savingsGoals.length > 0 && (
        <div style={{ ...cardStyle, marginBottom: '32px', animation: 'fadeIn 0.6s ease-out 0.34s both', transition: 'transform 0.3s, box-shadow 0.3s' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
          }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '16px',
          }}>
            🎯 Savings Goals Progress
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {savingsGoals.slice(0, 5).map((goal: SavingsGoal) => {
              const progress = goal.targetAmount > 0 
                ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) 
                : 0;
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
              
              return (
                <div key={goal._id} style={{
                  padding: '16px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '15px' }}>
                      {goal.goalName}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#8b5cf6' }}>
                      {progress.toFixed(0)}%
                    </div>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: '#e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginBottom: '8px',
                  }}>
                    <div style={{
                      width: `${progress}%`,
                      height: '100%',
                      background: progress >= 100 
                        ? 'linear-gradient(90deg, #10b981, #059669)' 
                        : progress >= 75 
                        ? 'linear-gradient(90deg, #8b5cf6, #7c3aed)' 
                        : 'linear-gradient(90deg, #3b82f6, #2563eb)',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
                    <span>₱{goal.currentAmount.toFixed(2)} saved</span>
                    <span>₱{remaining.toFixed(2)} remaining</span>
                  </div>
                </div>
              );
            })}
          </div>
          {savingsGoals.length > 5 && (
            <div style={{ marginTop: '12px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
              +{savingsGoals.length - 5} more savings {savingsGoals.length - 5 === 1 ? 'goal' : 'goals'}
            </div>
          )}
        </div>
      )}

      {/* Top Expenses */}
      {dashboardStats?.topExpenses && dashboardStats.topExpenses.length > 0 && (
        <div style={{ ...cardStyle, marginBottom: '32px', animation: 'fadeIn 0.6s ease-out 0.35s both', transition: 'transform 0.3s, box-shadow 0.3s' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
          }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '16px',
          }}>
            💸 Top Expenses This Month
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {dashboardStats.topExpenses.map((exp: Expense, index: number) => (
              <div key={exp._id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '8px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: COLORS[index % COLORS.length],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '14px',
                  }}>
                    {index + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1f2937' }}>{exp.name}</div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                      {exp.category} • {new Date(exp.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#10b981' }}>
                  ₱{exp.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ ...cardStyle, animation: 'fadeIn 0.6s ease-out 0.4s both', transition: 'transform 0.3s, box-shadow 0.3s' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        }}>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          color: '#1f2937',
          marginBottom: '16px',
        }}>
          ⚡ Quick Actions
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
        }}>
          {/* Row 1 */}
          <button
            onClick={onAddTransaction}
            style={{
              padding: '16px 12px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.3)';
            }}
          >
            ➕ Add Expense
          </button>
          
          <button
            onClick={onNavigateToIncome}
            style={{
              padding: '16px 12px',
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(2, 132, 199, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(2, 132, 199, 0.3)';
            }}
          >
            💵 Add Income
          </button>

          <button
            onClick={onNavigateToBudgets}
            style={{
              padding: '16px 12px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(245, 158, 11, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(245, 158, 11, 0.3)';
            }}
          >
            🎯 Create Budget
          </button>

          {/* Row 2 */}
          <button
            onClick={onNavigateToSavings}
            style={{
              padding: '16px 12px',
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 4px rgba(139, 92, 246, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(139, 92, 246, 0.3)';
            }}
          >
            💎 Savings Goal
          </button>

          <button
            onClick={onNavigateToRecurring}
            style={{
              padding: '16px 12px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.3)';
            }}
          >
            🔁 Recurring
          </button>

          <button
            onClick={onNavigateToTransactions}
            style={{
              padding: '16px 12px',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 4px rgba(99, 102, 241, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(99, 102, 241, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(99, 102, 241, 0.3)';
            }}
          >
            📜 Transactions
          </button>

          {/* Row 3 */}
          <button
            onClick={() => {
              const reportWindow = window.open('', '_blank');
              if (reportWindow) {
                const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
                const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
                const monthlyTotal = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
                const categoryBreakdown = categoryChartData.map(cat => 
                  `<tr><td style="padding:8px;border:1px solid #ddd;">${cat.name}</td><td style="padding:8px;border:1px solid #ddd;">₱${cat.value.toFixed(2)}</td></tr>`
                ).join('');
                const budgetRows = budgets.map(b => {
                  const percent = b.currentSpent ? Math.round((b.currentSpent / b.amount) * 100) : 0;
                  return `<tr><td style="padding:8px;border:1px solid #ddd;">${b.category || 'Overall'}</td><td style="padding:8px;border:1px solid #ddd;">${b.period}</td><td style="padding:8px;border:1px solid #ddd;">₱${b.amount.toFixed(2)}</td><td style="padding:8px;border:1px solid #ddd;">₱${(b.currentSpent || 0).toFixed(2)}</td><td style="padding:8px;border:1px solid #ddd;">${percent}%</td></tr>`;
                }).join('');
                const incomeRows = incomes.slice(0, 10).map(inc =>
                  `<tr><td style="padding:8px;border:1px solid #ddd;">${new Date(inc.date).toLocaleDateString()}</td><td style="padding:8px;border:1px solid #ddd;">${inc.source}</td><td style="padding:8px;border:1px solid #ddd;">₱${inc.amount.toFixed(2)}</td><td style="padding:8px;border:1px solid #ddd;">${inc.notes || '-'}</td></tr>`
                ).join('');
                const savingsRows = savingsGoals.map(goal => {
                  const progress = goal.targetAmount > 0 ? ((goal.currentAmount / goal.targetAmount) * 100).toFixed(1) : 0;
                  return `<tr><td style="padding:8px;border:1px solid #ddd;">${goal.goalName}</td><td style="padding:8px;border:1px solid #ddd;">₱${goal.targetAmount.toFixed(2)}</td><td style="padding:8px;border:1px solid #ddd;">₱${goal.currentAmount.toFixed(2)}</td><td style="padding:8px;border:1px solid #ddd;">${progress}%</td><td style="padding:8px;border:1px solid #ddd;">${goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : '-'}</td></tr>`;
                }).join('');
                
                reportWindow.document.write(`
                  <html>
                    <head>
                      <title>Budget Buddy - Financial Report</title>
                      <style>
                        body { font-family: Arial, sans-serif; padding: 40px; background: #f9fafb; }
                        .header { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
                        .section { background: white; padding: 24px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                        h1 { margin: 0; font-size: 32px; }
                        h2 { color: #1f2937; font-size: 20px; margin-top: 0; }
                        table { width: 100%; border-collapse: collapse; }
                        th { background: #f3f4f6; padding: 12px; text-align: left; border: 1px solid #ddd; font-weight: 600; }
                        .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 30px; }
                        .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                        .stat-label { font-size: 14px; color: #6b7280; margin-bottom: 8px; }
                        .stat-value { font-size: 28px; font-weight: bold; color: #1f2937; }
                        .print-btn { background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; margin-top: 20px; }
                        .print-btn:hover { background: #059669; }
                        @media print { .print-btn { display: none; } }
                        .highlight { background: ${disposableIncome >= 0 ? '#dcfce7' : '#fee2e2'}; padding: 16px; border-radius: 8px; border-left: 4px solid ${disposableIncome >= 0 ? '#10b981' : '#ef4444'}; }
                      </style>
                    </head>
                    <body>
                      <div class="header">
                        <h1>📊 Financial Report</h1>
                        <p style="margin: 8px 0 0 0; opacity: 0.9;">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                      
                      <div class="stat-grid">
                        <div class="stat-card">
                          <div class="stat-label">💵 Total Income (This Month)</div>
                          <div class="stat-value" style="color: #0284c7;">₱${monthlyIncomesTotal.toFixed(2)}</div>
                        </div>
                        <div class="stat-card">
                          <div class="stat-label">💸 Total Expenses (This Month)</div>
                          <div class="stat-value" style="color: #eab308;">₱${monthlyTotal.toFixed(2)}</div>
                        </div>
                        <div class="stat-card">
                          <div class="stat-label">💰 Disposable Income</div>
                          <div class="stat-value" style="color: ${disposableIncome >= 0 ? '#10b981' : '#ef4444'};">₱${Math.abs(disposableIncome).toFixed(2)}</div>
                          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">${disposableIncome >= 0 ? 'Surplus' : 'Deficit'}</div>
                        </div>
                      </div>

                      <div class="highlight">
                        <strong>${disposableIncome >= 0 ? '✅ Financial Health: Good' : '⚠️ Financial Health: Attention Needed'}</strong>
                        <p style="margin: 8px 0 0 0;">${disposableIncome >= 0 ? 'You are spending less than your income this month.' : 'Your expenses exceed your income this month. Consider reviewing your budget.'}</p>
                      </div>

                      <div class="stat-grid" style="margin-top: 30px;">
                        <div class="stat-card">
                          <div class="stat-label">🎯 Active Budgets</div>
                          <div class="stat-value">${budgets.length}</div>
                        </div>
                        <div class="stat-card">
                          <div class="stat-label">💎 Savings Goals</div>
                          <div class="stat-value">${savingsGoals.length}</div>
                          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">${savingsProgress}% total progress</div>
                        </div>
                        <div class="stat-card">
                          <div class="stat-label">🔁 Recurring Expenses</div>
                          <div class="stat-value">${recurringExpenses.filter(r => r.isActive).length}</div>
                          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">of ${recurringExpenses.length} total</div>
                        </div>
                      </div>

                      ${incomes.length > 0 ? `
                      <div class="section">
                        <h2>💵 Recent Income</h2>
                        <table>
                          <thead>
                            <tr><th>Date</th><th>Source</th><th>Amount</th><th>Notes</th></tr>
                          </thead>
                          <tbody>
                            ${incomeRows || '<tr><td colspan="4" style="padding:12px;text-align:center;color:#6b7280;">No income data</td></tr>'}
                          </tbody>
                        </table>
                        <div style="margin-top: 12px; text-align: right; font-weight: 600;">Total Income (All Time): ₱${totalIncome.toFixed(2)}</div>
                      </div>
                      ` : ''}

                      <div class="section">
                        <h2>📊 Spending by Category</h2>
                        <table>
                          <thead>
                            <tr><th>Category</th><th>Total Amount</th></tr>
                          </thead>
                          <tbody>
                            ${categoryBreakdown || '<tr><td colspan="2" style="padding:12px;text-align:center;color:#6b7280;">No data available</td></tr>'}
                          </tbody>
                        </table>
                      </div>

                      ${budgets.length > 0 ? `
                      <div class="section">
                        <h2>💰 Budget Performance</h2>
                        <table>
                          <thead>
                            <tr><th>Category</th><th>Period</th><th>Budget</th><th>Spent</th><th>Usage</th></tr>
                          </thead>
                          <tbody>
                            ${budgetRows}
                          </tbody>
                        </table>
                      </div>
                      ` : ''}

                      ${savingsGoals.length > 0 ? `
                      <div class="section">
                        <h2>🎯 Savings Goals Progress</h2>
                        <table>
                          <thead>
                            <tr><th>Goal Name</th><th>Target</th><th>Current</th><th>Progress</th><th>Target Date</th></tr>
                          </thead>
                          <tbody>
                            ${savingsRows}
                          </tbody>
                        </table>
                        <div style="margin-top: 12px; text-align: right; font-weight: 600;">Total Saved: ₱${totalSaved.toFixed(2)} / ₱${totalSavingsTarget.toFixed(2)}</div>
                      </div>
                      ` : ''}

                      <div class="section">
                        <h2>📝 Recent Transactions</h2>
                        <table>
                          <thead>
                            <tr><th>Date</th><th>Name</th><th>Category</th><th>Amount</th></tr>
                          </thead>
                          <tbody>
                            ${expenses.slice(0, 10).map(exp => 
                              `<tr><td style="padding:8px;border:1px solid #ddd;">${new Date(exp.date).toLocaleDateString()}</td><td style="padding:8px;border:1px solid #ddd;">${exp.name}</td><td style="padding:8px;border:1px solid #ddd;">${exp.category}</td><td style="padding:8px;border:1px solid #ddd;">₱${exp.amount.toFixed(2)}</td></tr>`
                            ).join('') || '<tr><td colspan="4" style="padding:12px;text-align:center;color:#6b7280;">No transactions yet</td></tr>'}
                          </tbody>
                        </table>
                      </div>

                      <button class="print-btn" onclick="window.print()">🖨️ Print Report</button>
                    </body>
                  </html>
                `);
                reportWindow.document.close();
              }
            }}
            style={{
              padding: '16px 12px',
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 4px rgba(139, 92, 246, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(139, 92, 246, 0.3)';
            }}
          >
            📊 View Reports
          </button>
          
          <button
            onClick={handleExportCSV}
            style={{
              padding: '16px 12px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(245, 158, 11, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(245, 158, 11, 0.3)';
            }}
          >
            💾 Export CSV
          </button>
          
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            style={{
              padding: '16px 12px',
              background: 'linear-gradient(135deg, #ec4899, #db2777)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 4px rgba(236, 72, 153, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(236, 72, 153, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(236, 72, 153, 0.3)';
            }}
          >
            📅 {showCalendar ? 'Hide' : 'Show'} Calendar
          </button>
          
          <button
            onClick={() => setShowBudgetHistory(!showBudgetHistory)}
            style={{
              padding: '16px 12px',
              background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 4px rgba(20, 184, 166, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(20, 184, 166, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(20, 184, 166, 0.3)';
            }}
          >
            📈 Budget History
          </button>
        </div>
      </div>

      {/* Calendar Heatmap Modal */}
      {showCalendar && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-in',
        }}
        onClick={() => setShowCalendar(false)}>
          <div style={{
            ...cardStyle,
            maxWidth: '900px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            animation: 'slideIn 0.3s ease-out',
          }}
          onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                📅 Spending Calendar Heatmap
              </h3>
              <button
                onClick={() => setShowCalendar(false)}
                style={{
                  padding: '8px 16px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
              >
                ✕ Close
              </button>
            </div>
            <CalendarHeatmap expenses={expenses} />
          </div>
        </div>
      )}

      {/* Budget History Modal */}
      {showBudgetHistory && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-in',
        }}
        onClick={() => setShowBudgetHistory(false)}>
          <div style={{
            ...cardStyle,
            maxWidth: '900px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            animation: 'slideIn 0.3s ease-out',
          }}
          onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                📈 Budget Performance History
              </h3>
              <button
                onClick={() => setShowBudgetHistory(false)}
                style={{
                  padding: '8px 16px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
              >
                ✕ Close
              </button>
            </div>
            <BudgetHistoryView budgets={budgets} expenses={expenses} />
          </div>
        </div>
      )}
    </div>
  );
};

// Calendar Heatmap Component
const CalendarHeatmap = ({ expenses }: { expenses: Expense[] }) => {
  const getDailySpending = () => {
    const dailyMap: { [key: string]: number } = {};
    expenses.forEach(exp => {
      const dateKey = new Date(exp.date).toISOString().split('T')[0];
      dailyMap[dateKey] = (dailyMap[dateKey] || 0) + exp.amount;
    });
    return dailyMap;
  };

  const getColorForAmount = (amount: number) => {
    if (amount === 0) return '#f3f4f6';
    if (amount < 500) return '#d1fae5';
    if (amount < 1000) return '#6ee7b7';
    if (amount < 2000) return '#34d399';
    if (amount < 3000) return '#10b981';
    if (amount < 5000) return '#059669';
    return '#047857';
  };

  const dailySpending = getDailySpending();
  const today = new Date();
  const days = [];
  
  // Generate last 84 days (12 weeks)
  for (let i = 83; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    const amount = dailySpending[dateKey] || 0;
    
    days.push({
      date: dateKey,
      amount,
      color: getColorForAmount(amount),
      day: date.getDate(),
      month: date.toLocaleString('default', { month: 'short' })
    });
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '4px', marginBottom: '16px' }}>
        {days.map((day, idx) => (
          <div
            key={idx}
            title={`${day.date}: ₱${day.amount.toFixed(2)}`}
            style={{
              width: '100%',
              aspectRatio: '1',
              backgroundColor: day.color,
              borderRadius: '3px',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              border: '1px solid #e5e7eb',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.2)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
              e.currentTarget.style.zIndex = '10';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.zIndex = '1';
            }}
          />
        ))}
      </div>
      
      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#6b7280' }}>
        <span>Less</span>
        {[0, 500, 1000, 2000, 3000, 5000].map(amt => (
          <div
            key={amt}
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: getColorForAmount(amt),
              borderRadius: '3px',
              border: '1px solid #e5e7eb',
            }}
            title={`₱${amt}+`}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
};

// Budget History Component
const BudgetHistoryView = ({ budgets, expenses }: { budgets: Budget[], expenses: Expense[] }) => {
  // Calculate monthly performance for each budget
  const getMonthlyPerformance = () => {
    const months = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      
      const monthExpenses = expenses.filter(e => {
        const expDate = new Date(e.date);
        return expDate >= monthStart && expDate <= monthEnd;
      });
      
      const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
      
      months.push({
        label: monthDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
        spent: totalSpent,
        date: monthDate
      });
    }
    
    return months;
  };

  const monthlyData = getMonthlyPerformance();
  const avgMonthly = monthlyData.reduce((sum, m) => sum + m.spent, 0) / monthlyData.length;
  const bestMonth = monthlyData.reduce((min, m) => m.spent < min.spent ? m : min);
  const worstMonth = monthlyData.reduce((max, m) => m.spent > max.spent ? m : max);

  return (
    <div>
      {/* Performance Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ padding: '16px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '8px', color: 'white' }}>
          <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '4px' }}>Best Month</div>
          <div style={{ fontSize: '24px', fontWeight: '700' }}>₱{bestMonth.spent.toFixed(0)}</div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>{bestMonth.label}</div>
        </div>
        
        <div style={{ padding: '16px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: '8px', color: 'white' }}>
          <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '4px' }}>Average Monthly</div>
          <div style={{ fontSize: '24px', fontWeight: '700' }}>₱{avgMonthly.toFixed(0)}</div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>Last 6 months</div>
        </div>
        
        <div style={{ padding: '16px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', borderRadius: '8px', color: 'white' }}>
          <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '4px' }}>Highest Month</div>
          <div style={{ fontSize: '24px', fontWeight: '700' }}>₱{worstMonth.spent.toFixed(0)}</div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>{worstMonth.label}</div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div style={{ marginTop: '24px' }}>
        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
          Monthly Spending Trend
        </h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip formatter={(value: any) => `₱${value.toFixed(2)}`} />
            <Line type="monotone" dataKey="spent" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Budget-Specific History */}
      {budgets.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
            Budget Performance
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {budgets.map(budget => {
              const successRate = budget.currentSpent && budget.amount 
                ? Math.min(100, (1 - (budget.currentSpent / budget.amount)) * 100) 
                : 100;
              
              return (
                <div key={budget._id} style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1f2937' }}>
                        {budget.category || 'Overall'} - {budget.period}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>
                        Budget: ₱{budget.amount.toFixed(2)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: successRate > 0 ? '#10b981' : '#ef4444' }}>
                        {successRate.toFixed(0)}%
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {successRate > 0 ? 'On Track' : 'Over Budget'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardTab;