import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardTab from '../components/DashboardTab';
import TransactionsTab from '../components/TransactionsTab';
import BudgetsTab from '../components/BudgetsTab';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'budgets' | 'income' | 'savings'>('dashboard');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navButtonStyle = (isActive: boolean) => ({
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '500',
    background: isActive ? '#10b981' : 'transparent',
    color: isActive ? 'white' : '#374151',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    opacity: isActive ? 1 : 0.7,
  });

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf9' }}>
      {/* Top Navigation Bar */}
      <nav style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {/* Logo */}
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#10b981',
          }}>
            BudgetBuddy
          </div>

          {/* Navigation Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
          }}>
            <button
              onClick={() => setActiveTab('dashboard')}
              style={navButtonStyle(activeTab === 'dashboard')}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              style={navButtonStyle(activeTab === 'transactions')}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('budgets')}
              style={navButtonStyle(activeTab === 'budgets')}
            >
              Budgets
            </button>
          </div>

          {/* User Profile & Logout */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '600',
                fontSize: '14px',
              }}>
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span style={{
                fontSize: '14px',
                color: '#374151',
                fontWeight: '500',
              }}>
                {user?.username || 'User'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                background: 'white',
                color: '#ef4444',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ef4444';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#ef4444';
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px 24px',
      }}>
        {activeTab === 'dashboard' && <DashboardTab onAddTransaction={() => setActiveTab('transactions')} onNavigateToBudgets={() => setActiveTab('budgets')} />}
        {activeTab === 'transactions' && <TransactionsTab />}
        {activeTab === 'budgets' && <BudgetsTab />}
        {activeTab === 'income' && <div>Income tab - Coming soon</div>}
        {activeTab === 'savings' && <div>Savings tab - Coming soon</div>}
      </div>
    </div>
  );
}