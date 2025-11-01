import { useState, useEffect } from 'react';
import { expensesAPI } from '../services/api';
import type { Expense } from '../types';

interface DashboardTabProps {
  onAddTransaction: () => void;
}

const DashboardTab = ({ onAddTransaction }: DashboardTabProps) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await expensesAPI.getExpenses();
      setExpenses(response.expenses);
    } catch (err) {
      console.error('Failed to load expenses:', err);
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

        {/* Saving Progress - Coming Soon */}
        <div style={statCardStyle}>
          <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
            🎯 Saving Progress
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937' }}>
            0%
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: '#e5e7eb',
            borderRadius: '4px',
            marginTop: '4px',
          }}>
            <div style={{
              width: '0%',
              height: '100%',
              background: '#10b981',
              borderRadius: '4px',
            }} />
          </div>
        </div>
      </div>

      {/* Middle Section - Spending by Category & Weekly Trend */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        marginBottom: '32px',
      }}>
        {/* Spending by Category */}
        <div style={cardStyle}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '16px',
          }}>
            Spending by Category
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            color: '#9ca3af',
            fontSize: '14px',
          }}>
            Pie Chart
          </div>
        </div>

        {/* Weekly Spending Trend - Coming Soon */}
        <div style={cardStyle}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '16px',
          }}>
            Weekly Spending Trend
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            color: '#9ca3af',
            fontSize: '14px',
          }}>
            Line graph
          </div>
        </div>
      </div>

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
          {/* Add Transaction - Working */}
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

