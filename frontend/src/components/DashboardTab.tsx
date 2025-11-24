import { useState, useEffect } from 'react';
import { expensesAPI, budgetsAPI } from '../services/api';
import type { Expense, Budget } from '../types';
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardTabProps {
  onAddTransaction: () => void;
  onNavigateToBudgets: () => void;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const DashboardTab = ({ onAddTransaction, onNavigateToBudgets }: DashboardTabProps) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
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
      const [expensesRes, budgetsRes, statsRes] = await Promise.all([
        expensesAPI.getExpenses(),
        budgetsAPI.getBudgets(),
        expensesAPI.getDashboardStats(),
      ]);
      setExpenses(expensesRes.expenses);
      setBudgets(budgetsRes.budgets || []);
      setDashboardStats(statsRes.stats);
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

  // Get daily spending for calendar heatmap
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
      
      {/* Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '24px',
        marginBottom: '32px',
        animation: 'fadeIn 0.5s ease-out',
      }}>
        {/* Total Income This Month */}
        <div style={{
          ...statCardStyle,
          background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
          borderLeft: '4px solid #3b82f6',
          transition: 'transform 0.3s, box-shadow 0.3s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(59, 130, 246, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        }}>
          <div style={{ fontSize: '14px', color: '#1e40af', fontWeight: '600' }}>
            💵 Total Income
          </div>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#3b82f6' }}>
            ₱0.00
          </div>
          <div style={{ fontSize: '12px', color: '#60a5fa' }}>
            This Month
          </div>
        </div>

        {/* Total Expenses This Month */}
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
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#10b981' }}>
            ₱{monthlyExpensesTotal.toFixed(2)}
          </div>
          <div style={{ fontSize: '12px', color: '#34d399' }}>
            This Month
          </div>
        </div>

        {/* Disposable Income */}
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
            💰 Disposable
          </div>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#8b5cf6' }}>
            ₱0.00
          </div>
          <div style={{ fontSize: '12px', color: '#a78bfa' }}>
            Available to Spend
          </div>
        </div>

        {/* Active Budgets */}
        <div style={{
          ...statCardStyle,
          background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
          borderLeft: '4px solid #f59e0b',
          transition: 'transform 0.3s, box-shadow 0.3s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(245, 158, 11, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        }}>
          <div style={{ fontSize: '14px', color: '#92400e', fontWeight: '600' }}>
            🎯 Active Budgets
          </div>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#f59e0b' }}>
            {budgets.length}
          </div>
          <div style={{ fontSize: '12px', color: '#d97706' }}>
            {budgets.filter(b => b.currentSpent && b.currentSpent >= b.amount * 0.9).length} near/exceeded
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
                  {categoryChartData.map((entry: any, index: number) => (
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
            onClick={onNavigateToBudgets}
            style={{
              padding: '16px 12px',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
            }}
          >
            💰 Create Budget
          </button>
          
          <button
            onClick={() => alert('Reports feature coming soon!')}
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

