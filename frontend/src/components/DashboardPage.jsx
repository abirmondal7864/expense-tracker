import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '500', margin: 0 }}>Expense Tracker</h1>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #007bff'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '0.5rem' }}>
            Welcome, {user?.name}!
          </h2>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
            You're successfully logged in. Start tracking your expenses.
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '1.5rem' }}>User profile</h2>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{
              padding: '1rem',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              borderLeft: '3px solid #007bff'
            }}>
              <p style={{
                fontSize: '12px',
                color: '#666',
                margin: '0 0 0.25rem 0',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Full name
              </p>
              <p style={{ fontSize: '16px', color: '#000', margin: 0, fontWeight: '500' }}>
                {user?.name}
              </p>
            </div>

            <div style={{
              padding: '1rem',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              borderLeft: '3px solid #007bff'
            }}>
              <p style={{
                fontSize: '12px',
                color: '#666',
                margin: '0 0 0.25rem 0',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Email
              </p>
              <p style={{ fontSize: '16px', color: '#000', margin: 0, fontWeight: '500', wordBreak: 'break-all' }}>
                {user?.email}
              </p>
            </div>

            <div style={{
              padding: '1rem',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              borderLeft: '3px solid #007bff'
            }}>
              <p style={{
                fontSize: '12px',
                color: '#666',
                margin: '0 0 0.25rem 0',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Member since
              </p>
              <p style={{ fontSize: '16px', color: '#000', margin: 0, fontWeight: '500' }}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}
              </p>
            </div>
          </div>

          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: '#e7f3ff',
            color: '#004085',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            Coming soon: Add expenses, set budgets, and view analytics.
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;