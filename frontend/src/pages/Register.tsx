// Register page component

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  // Color Palette
  const colors = {
    primary: '#10b981',
    secondary: '#3b82f6',
    dark: '#1f2937',
    background: '#fafaf9',
    lightGray: '#6b7280'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // password validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      await register({ username, email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: colors.background,
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Back to Home Link */}
      <div style={{ padding: '20px 40px' }}>
        <Link 
          to="/" 
          style={{ 
            color: colors.secondary, 
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          ← Go back to home
        </Link>
      </div>

      {/* Main Registration Form */}
      <div style={{ 
        maxWidth: '450px', 
        margin: '0 auto', 
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '42px', 
          fontWeight: 'bold', 
          color: colors.dark,
          marginBottom: '12px'
        }}>
          Create Account
        </h1>
        
        <p style={{ 
          fontSize: '18px', 
          color: colors.lightGray,
          marginBottom: '40px'
        }}>
          Start your financial journey today
        </p>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          {/* Username */}
          <div style={{ marginBottom: '20px' }}>
            <label 
              htmlFor="username" 
              style={{ 
                display: 'block',
                marginBottom: '8px',
                color: colors.dark,
                fontWeight: '500'
              }}
            >
              Username:
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ 
                width: '100%', 
                padding: '12px 16px',
                fontSize: '16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = colors.primary}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label 
              htmlFor="email"
              style={{ 
                display: 'block',
                marginBottom: '8px',
                color: colors.dark,
                fontWeight: '500'
              }}
            >
              Email:
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ 
                width: '100%', 
                padding: '12px 16px',
                fontSize: '16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = colors.primary}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '24px' }}>
            <label 
              htmlFor="password"
              style={{ 
                display: 'block',
                marginBottom: '8px',
                color: colors.dark,
                fontWeight: '500'
              }}
            >
              Password:
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ 
                width: '100%', 
                padding: '12px 16px',
                fontSize: '16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = colors.primary}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
            />
            <p style={{ 
              fontSize: '13px', 
              color: colors.lightGray,
              marginTop: '8px',
              lineHeight: '1.5'
            }}>
              Must be 8+ characters with uppercase, lowercase, number & special character
            </p>
          </div>

          {error && (
            <div style={{ 
              color: '#ef4444', 
              marginBottom: '20px',
              padding: '12px',
              backgroundColor: '#fee2e2',
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Social Login Options */}
        <div style={{ margin: '30px 0' }}>
          <p style={{ color: colors.lightGray, marginBottom: '16px' }}>
            Or sign up with:
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '500',
                color: colors.dark,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Google
            </button>
            <button
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '500',
                color: colors.dark,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Facebook
            </button>
          </div>
        </div>

        {/* Login Link */}
        <p style={{ 
          color: colors.lightGray,
          marginBottom: '40px'
        }}>
          Already have an account?{' '}
          <Link 
            to="/login" 
            style={{ 
              color: colors.secondary,
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            Login
          </Link>
        </p>

        {/* Guest Mode Section */}
        <div style={{
          backgroundColor: '#fffbeb',
          border: '2px solid #fcd34d',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '16px'
        }}>
          <p style={{ 
            color: '#92400e',
            fontSize: '14px',
            marginBottom: '12px',
            lineHeight: '1.5'
          }}>
            ⚠️ <strong>Guest Mode:</strong> Your data will not be saved after this session and won't sync across devices
          </p>
          <button
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'white',
              border: '2px solid #fbbf24',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              color: '#92400e',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
