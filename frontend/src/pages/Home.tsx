// Home/Landing page - first page users see

import { Link } from 'react-router-dom';

export default function Home() {
  // Shared container style for centering content with max-width
  const containerStyle = {
    maxWidth: '1800px',
    margin: '0 auto',
    padding: '0 40px'
  };

  // Color Palette - Option 1: Modern Financial
  const colors = {
    primary: '#10b981',      // Emerald green - wealth, growth
    secondary: '#3b82f6',    // Bright blue - trust, stability  
    accent: '#8b5cf6',       // Purple - premium, smart
    dark: '#1f2937',         // Warmer dark gray
    background: '#fafaf9',   // Light cream
    lightBg: '#f0fdf4'       // Very light green tint
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      fontFamily: 'system-ui, -apple-system, sans-serif', 
      backgroundColor: colors.background
    }}>
      {/* Header / Navigation */}
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        width: '100%'
      }}>
        <div style={{
          ...containerStyle,
          padding: '20px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo - Upper Left */}
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.dark }}>
            Budget Buddy
          </div>

          {/* Buttons - Upper Right */}
          <div style={{ display: 'flex', gap: '15px' }}>
          <Link 
            to="/login"
            style={{
              padding: '10px 24px',
              backgroundColor: 'transparent',
              color: colors.secondary,
              textDecoration: 'none',
              borderRadius: '6px',
              border: `2px solid ${colors.secondary}`,
              fontWeight: '500',
              transition: 'all 0.3s'
            }}
          >
            Login
          </Link>
          <Link 
            to="/register"
            style={{
              padding: '10px 24px',
              backgroundColor: colors.primary,
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              border: `2px solid ${colors.primary}`,
              fontWeight: '500',
              transition: 'all 0.3s'
            }}
          >
            Get Started
          </Link>
        </div>
        </div>
      </header>

      {/* Hero Section - Middle of Page */}
      <section style={{
        backgroundColor: '#ffffff',
        width: '100%'
      }}>
        <div style={{
          ...containerStyle,
          padding: '100px 40px',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '56px',
            fontWeight: 'bold',
            color: colors.dark,
            marginBottom: '24px',
            lineHeight: '1.2',
            width: '50%',
            margin: '0 auto'
          }}>
            Your Smart Finance Companion for Student Life
          </h1>

          {/* Space */}
          <div style={{ height: '50px' }}></div>

          <p style={{
            fontSize: '20px',
            color: '#6b7280',
            lineHeight: '1.6',
            marginBottom: '50px',
            width: '60%',
            margin: '0 auto'
          }}>
            Managing money as a student doesn't have to be complicated. Budget Buddy makes it simple, 
            visual and even fun to track expenses, set budgets, and build healthy financial habits.
          </p>

        {/* Space In between Title and Paragraph */}
          <div style={{ height: '50px' }}></div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <Link 
            to="/register"
            style={{
              padding: '14px 32px',
              backgroundColor: colors.primary,
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: '600',
              boxShadow: `0 4px 6px ${colors.primary}40`,
              transition: 'all 0.3s'
            }}
          >
            Start Free Today
          </Link>
          <Link 
            to="/login"
            style={{
              padding: '14px 32px',
              backgroundColor: 'transparent',
              color: colors.secondary,
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: '600',
              border: `2px solid ${colors.secondary}`,
              transition: 'all 0.3s'
            }}
          >
            Login
          </Link>
        </div>
        </div>
      </section>

      {/* Features Section - Everything You Need */}
      <section style={{
        backgroundColor: colors.lightBg,
        width: '100%'
      }}>
        <div style={{
          ...containerStyle,
          padding: '100px 40px'
        }}>
          <h2 style={{
            fontSize: '42px',
            fontWeight: 'bold',
            color: colors.dark,
            textAlign: 'center',
            marginBottom: '60px'
          }}>
            Everything You Need to Know
          </h2>

          {/* 3x2 Grid of Features */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '50px'
          }}>
            {/* Feature 1: Expense Tracking */}
            <div style={{
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s'
            }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: colors.dark,
                marginBottom: '16px'
              }}>
                💰 Expense Tracking
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6', fontSize: '16px' }}>
                Log your daily expenses in seconds. Categorize spending across food, transport, entertainment, and more.
              </p>
            </div>

            {/* Feature 2: Smart Budgeting */}
            <div style={{
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s'
            }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: colors.dark,
                marginBottom: '16px'
              }}>
                🎯 Smart Budgeting
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6', fontSize: '16px' }}>
                Set weekly or monthly budgets by category. Get alerts when you're approaching your limits.
              </p>
            </div>

            {/* Feature 3: Visual Insights */}
            <div style={{
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s'
            }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: colors.dark,
                marginBottom: '16px'
              }}>
                📊 Visual Insights
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6', fontSize: '16px' }}>
                Beautiful charts and graphs show where your money goes. Make informed decisions with clear data.
              </p>
            </div>

            {/* Feature 4: Income Tracking */}
            <div style={{
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s'
            }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: colors.dark,
                marginBottom: '16px'
              }}>
                💵 Income Tracking
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6', fontSize: '16px' }}>
                Track allowance, part-time job earnings, and other income sources to get full financial clarity.
              </p>
            </div>

            {/* Feature 5: Secure & Private */}
            <div style={{
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s'
            }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: colors.dark,
                marginBottom: '16px'
              }}>
                🔒 Secure & Private
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6', fontSize: '16px' }}>
                Your financial data is encrypted and secure. Use across devices or keep it local - your choice.
              </p>
            </div>

            {/* Feature 6: Smart Alerts */}
            <div style={{
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s'
            }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: colors.dark,
                marginBottom: '16px'
              }}>
                🔔 Smart Alerts
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6', fontSize: '16px' }}>
                Get notified when you're close to budget limits or when it's time to log your expenses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '30px',
        backgroundColor: colors.dark,
        color: 'white',
        width: '100%'
      }}>
        <p>© 2025 Budget Buddy. All rights reserved.</p>
      </footer>
    </div>
  );
}
