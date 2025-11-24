import { useEffect, useState } from 'react';
import { budgetsAPI, expensesAPI } from '../services/api';
import type { Budget } from '../types';

const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Other'];

const BudgetsTab = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({ amount: '', period: 'monthly', category: '' });

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await budgetsAPI.getBudgets();
      setBudgets(res.budgets || []);
    } catch (err: any) {
      console.error('Failed to load budgets:', err);
      setError(err?.message || 'Failed to load budgets. Please refresh the page.');
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

    try {
      setSubmitting(true);
      setError(null);
      if (editingId) {
        await budgetsAPI.updateBudget(editingId, { amount: amountNum, period: formData.period as any, category: formData.category || undefined });
        setEditingId(null);
      } else {
        await budgetsAPI.createBudget({ amount: amountNum, period: formData.period as any, category: formData.category || undefined });
      }

      setFormData({ amount: '', period: 'monthly', category: '' });
      await fetchBudgets();
    } catch (err: any) {
      setError(err?.message || 'Failed to save budget. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (b: Budget) => {
    setEditingId(b._id);
    setFormData({ amount: b.amount.toString(), period: b.period, category: b.category || '' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this budget?')) return;
    try {
      setError(null);
      await budgetsAPI.deleteBudget(id);
      await fetchBudgets();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete budget. Please try again.');
    }
  };

  const percent = (b: Budget) => {
    if (!b.currentSpent) return 0;
    return Math.min(100, Math.round((b.currentSpent / b.amount) * 100));
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '24px' }}>
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb' }}>
        <h3 style={{ marginBottom: '16px' }}>{editingId ? 'Edit Budget' : 'Create Budget'}</h3>
        {error && (
          <div style={{ padding: '12px', background: '#fee2e2', color: '#dc2626', borderRadius: '6px', marginBottom: '12px', fontSize: '14px' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label>Amount *</label>
            <input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
          </div>

          <div>
            <label>Period *</label>
            <select value={formData.period} onChange={(e) => setFormData({ ...formData, period: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}>
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div>
            <label>Category (leave empty for overall)</label>
            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}>
              <option value="">Overall</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" disabled={submitting} style={{ padding: '10px 16px', background: submitting ? '#9ca3af' : '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: submitting ? 'not-allowed' : 'pointer' }}>{submitting ? 'Saving...' : (editingId ? 'Update' : 'Create')}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({ amount: '', period: 'monthly', category: '' }); }} style={{ padding: '10px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px' }}>Cancel</button>}
          </div>
        </form>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb' }}>
        <h3 style={{ marginBottom: '12px' }}>Your Budgets</h3>
        {loading ? (
          <div>Loading budgets...</div>
        ) : budgets.length === 0 ? (
          <div>No budgets yet. Create one to get alerts.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {budgets.map(b => (
              <div key={b._id} style={{ padding: '12px', borderRadius: '8px', background: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{b.category || 'Overall'} • {b.period}</div>
                  <div style={{ color: '#6b7280' }}>Amount: ₱{b.amount.toFixed(2)}</div>
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '6px' }}>
                      <div style={{ width: `${percent(b)}%`, height: '100%', background: percent(b) >= 100 ? '#ef4444' : percent(b) >= 90 ? '#f59e0b' : '#10b981', borderRadius: '6px' }} />
                    </div>
                    <div style={{ fontSize: '13px', color: '#374151', marginTop: '6px' }}>
                      Spent: ₱{(b.currentSpent || 0).toFixed(2)} • {percent(b)}%
                      {b.currentSpent && b.currentSpent >= b.amount && <span style={{ color: '#ef4444', marginLeft: '8px' }}>Exceeded</span>}
                      {b.currentSpent && b.currentSpent < b.amount && b.currentSpent >= b.amount * 0.9 && <span style={{ color: '#f59e0b', marginLeft: '8px' }}>Near limit</span>}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
                  <button onClick={() => handleEdit(b)} style={{ padding: '6px 10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px' }}>Edit</button>
                  <button onClick={() => handleDelete(b._id)} style={{ padding: '6px 10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetsTab;