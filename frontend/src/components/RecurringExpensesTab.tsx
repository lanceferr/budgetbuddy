import { useEffect, useState } from 'react';
import { recurringExpensesAPI } from '../services/api';
import type { RecurringExpense } from '../types';

const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Other'];

const RecurringExpensesTab = () => {
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    name: '',
    category: '',
    frequency: 'monthly' as 'minutely' | 'daily' | 'weekly' | 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
    generateImmediately: false,
  });

  useEffect(() => {
    fetchRecurringExpenses();
  }, [showInactive]);

  const fetchRecurringExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await recurringExpensesAPI.getRecurringExpenses(showInactive);
      setRecurringExpenses(res.recurringExpenses || []);
    } catch (err: any) {
      console.error('Failed to load recurring expenses:', err);
      setError(err?.message || 'Failed to load recurring expenses. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = Number(formData.amount);
    if (!formData.amount || isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid positive amount');
      return;
    }

    if (!formData.name || !formData.category) {
      setError('Name and category are required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload: any = {
        amount: amountNum,
        name: formData.name,
        category: formData.category,
        frequency: formData.frequency,
        startDate: formData.startDate,
        notes: formData.notes,
        generateImmediately: formData.generateImmediately,
      };

      if (formData.endDate) {
        payload.endDate = formData.endDate;
      }

      if (editingId) {
        await recurringExpensesAPI.updateRecurringExpense(editingId, payload);
        setEditingId(null);
      } else {
        await recurringExpensesAPI.createRecurringExpense(payload);
      }

      setFormData({
        amount: '',
        name: '',
        category: '',
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        notes: '',
        generateImmediately: false,
      });
      await fetchRecurringExpenses();
    } catch (err: any) {
      setError(err?.message || 'Failed to save recurring expense. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (recurring: RecurringExpense) => {
    setEditingId(recurring._id);
    setFormData({
      amount: recurring.amount.toString(),
      name: recurring.name,
      category: recurring.category,
      frequency: recurring.frequency,
      startDate: new Date(recurring.startDate).toISOString().split('T')[0],
      endDate: recurring.endDate ? new Date(recurring.endDate).toISOString().split('T')[0] : '',
      notes: recurring.notes || '',
      generateImmediately: false,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this recurring expense? This will not delete already generated expenses.')) return;
    try {
      setError(null);
      await recurringExpensesAPI.deleteRecurringExpense(id);
      await fetchRecurringExpenses();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete recurring expense. Please try again.');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      setError(null);
      await recurringExpensesAPI.toggleRecurringExpense(id);
      await fetchRecurringExpenses();
    } catch (err: any) {
      setError(err?.message || 'Failed to toggle recurring expense status.');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      amount: '',
      name: '',
      category: '',
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      notes: '',
      generateImmediately: false,
    });
  };

  const getFrequencyEmoji = (frequency: string) => {
    switch (frequency) {
      case 'minutely': return '⚡';
      case 'daily': return '📆';
      case 'weekly': return '📅';
      case 'monthly': return '🗓️';
      default: return '📋';
    }
  };

  const getNextGenerationDate = (recurring: RecurringExpense) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today
    
    // Determine the base date to calculate from
    let baseDate: Date;
    if (recurring.lastGenerated) {
      baseDate = new Date(recurring.lastGenerated);
    } else {
      baseDate = new Date(recurring.startDate);
    }
    
    // Normalize baseDate to start of day for comparison
    baseDate.setHours(0, 0, 0, 0);
    
    // Calculate the next occurrence
    let nextDate = new Date(baseDate);
    
    // If lastGenerated exists, move to the next occurrence
    if (recurring.lastGenerated) {
      switch (recurring.frequency) {
        case 'minutely':
          nextDate.setMinutes(nextDate.getMinutes() + 1);
          break;
        case 'daily':
          nextDate.setDate(nextDate.getDate() + 1);
          break;
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
      }
    }
    
    // Keep advancing until we get a date that's today or in the future
    while (nextDate < now) {
      switch (recurring.frequency) {
        case 'minutely':
          nextDate.setMinutes(nextDate.getMinutes() + 1);
          break;
        case 'daily':
          nextDate.setDate(nextDate.getDate() + 1);
          break;
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
      }
    }

    return nextDate;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      <div style={{ display: 'grid', gridTemplateColumns: '450px 1fr', gap: '24px' }}>
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
      `}</style>

      {/* Left Side - Form */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #e5e7eb',
        animation: 'slideIn 0.6s ease-out',
        transition: 'transform 0.3s, box-shadow 0.3s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        height: 'fit-content',
        position: 'sticky',
        top: '24px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      }}>
        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
          {editingId ? '✏️ Edit Recurring Expense' : '➕ Create Recurring Expense'}
        </h3>
        
        {error && (
          <div style={{
            padding: '12px',
            background: '#fee2e2',
            color: '#dc2626',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px',
            border: '1px solid #fecaca',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              Expense Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Netflix Subscription"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              Amount (₱) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              placeholder="0.00"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
              }}
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              Frequency *
            </label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
              }}
            >
              <option value="minutely">⚡ Every Minute (Testing)</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                End Date (Optional)
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={formData.startDate}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional details..."
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                resize: 'vertical',
              }}
            />
          </div>

          {!editingId && (
            <div style={{
              padding: '12px',
              background: '#f0fdf4',
              borderRadius: '8px',
              border: '1px solid #bbf7d0',
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.generateImmediately}
                  onChange={(e) => setFormData({ ...formData, generateImmediately: e.target.checked })}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#15803d' }}>⚡ Generate first expense immediately</span>
              </label>
              <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px', marginLeft: '24px' }}>
                Creates an expense right now instead of waiting for the first scheduled date
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: submitting ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                style={{
                  padding: '12px 16px',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Right Side - List */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #e5e7eb',
        animation: 'fadeIn 0.6s ease-out 0.2s both',
        transition: 'transform 0.3s, box-shadow 0.3s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
            🔁 Your Recurring Expenses
          </h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            <span style={{ color: '#6b7280' }}>Show inactive</span>
          </label>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            Loading recurring expenses...
          </div>
        ) : recurringExpenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔁</div>
            <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              No Recurring Expenses Yet
            </h4>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Create your first recurring expense to automate expense tracking!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recurringExpenses.map((recurring) => {
              const nextGen = getNextGenerationDate(recurring);
              const isExpired = recurring.endDate && new Date(recurring.endDate) < new Date();

              return (
                <div
                  key={recurring._id}
                  style={{
                    padding: '20px',
                    borderRadius: '12px',
                    background: recurring.isActive ? '#f9fafb' : '#f3f4f6',
                    border: `2px solid ${recurring.isActive ? '#e5e7eb' : '#d1d5db'}`,
                    opacity: recurring.isActive ? 1 : 0.7,
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                          {recurring.name}
                        </h4>
                        {!recurring.isActive && (
                          <span style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            background: '#fef3c7',
                            color: '#92400e',
                            borderRadius: '4px',
                            fontWeight: '600',
                          }}>
                            PAUSED
                          </span>
                        )}
                        {isExpired && (
                          <span style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            background: '#fee2e2',
                            color: '#991b1b',
                            borderRadius: '4px',
                            fontWeight: '600',
                          }}>
                            ENDED
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981', marginBottom: '8px' }}>
                        ₱{recurring.amount.toFixed(2)}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '13px', color: '#6b7280' }}>
                        <span>📂 {recurring.category}</span>
                        <span>{getFrequencyEmoji(recurring.frequency)} {recurring.frequency.charAt(0).toUpperCase() + recurring.frequency.slice(1)}</span>
                        <span>📅 Next: {nextGen.toLocaleDateString()}</span>
                      </div>
                      {recurring.notes && (
                        <div style={{ marginTop: '8px', fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                          💭 {recurring.notes}
                        </div>
                      )}
                      {recurring.lastGenerated && (
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#9ca3af' }}>
                          Last generated: {new Date(recurring.lastGenerated).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                      <button
                        onClick={() => handleToggleActive(recurring._id)}
                        title={recurring.isActive ? 'Pause' : 'Resume'}
                        style={{
                          padding: '8px 12px',
                          background: recurring.isActive ? '#fef3c7' : '#d1fae5',
                          color: recurring.isActive ? '#92400e' : '#065f46',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                        }}
                      >
                        {recurring.isActive ? '⏸️ Pause' : '▶️ Resume'}
                      </button>
                      <button
                        onClick={() => handleEdit(recurring)}
                        style={{
                          padding: '8px 12px',
                          background: '#dbeafe',
                          color: '#1e40af',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(recurring._id)}
                        style={{
                          padding: '8px 12px',
                          background: '#fee2e2',
                          color: '#991b1b',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default RecurringExpensesTab;