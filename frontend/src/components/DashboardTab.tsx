import { useState, useEffect } from 'react';
import { expensesAPI, budgetsAPI } from '../services/api';
import type { Expense, Budget } from '../types';
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardTabProps {
  onAddTransaction: () => void;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const DashboardTab = ({ onAddTransaction }: DashboardTabProps) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div>
      {/* Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '24px',
        marginBottom: '32px',
      }}>
        {/* Total Income This Month */}
        <div style={statCardStyle}>
          <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
            Total Income
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6' }}>
            ₱0.00
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
            This Month
          </div>
        </div>

        {/* Total Expenses This Month */}
        <div style={statCardStyle}>
          <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
            Total Expenses
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>
            ₱{monthlyExpensesTotal.toFixed(2)}
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
            This Month
          </div>
        </div>

        {/* Disposable Income - Coming Soon */}
        <div style={statCardStyle}>
          <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
            Disposable Income
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#8b5cf6' }}>
            ₱0.00
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
            Available to Spend
          </div>
        </div>

        {/* Active Budgets */}
        <div style={statCardStyle}>
          <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
            🎯 Active Budgets
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937' }}>
            {budgets.length}
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
            {budgets.filter(b => b.currentSpent && b.currentSpent >= b.amount * 0.9).length} near/exceeded
          </div>
        </div>
      </div>

      {/* Budget Alerts Section */}
      {budgets.length > 0 && (
        <div style={{ ...cardStyle, marginBottom: '32px' }}>
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
                        transition: 'width 0.3s'
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
      }}>
        {/* Spending by Category - Pie Chart */}
        <div style={cardStyle}>
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
        <div style={cardStyle}>
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
        <div style={{ ...cardStyle, marginBottom: '32px' }}>
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
        <div style={{ ...cardStyle, marginBottom: '32px' }}>
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
      <div style={cardStyle}>
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
          gridTemplateColumns: '1fr',
          gap: '16px',
        }}>
          <button
            onClick={onAddTransaction}
            style={{
              padding: '16px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#059669';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#10b981';
            }}
          >
            ➕ Add Transaction
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;

