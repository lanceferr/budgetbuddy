import { useState, useEffect } from 'react';
import { expensesAPI } from '../services/api';
import type { Expense } from '../types';

const TransactionsTab = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
    sort: '',
  });

  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    name: '',
    category: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const filterParams: any = {};
      if (filters.category) filterParams.category = filters.category;
      if (filters.startDate) filterParams.startDate = filters.startDate;
      if (filters.endDate) filterParams.endDate = filters.endDate;
      if (filters.sort) filterParams.sort = filters.sort;
      
      const response = await expensesAPI.getExpenses(filterParams);
      setExpenses(response.expenses);
      setTotal(response.total);
    } catch (err) {
      console.error('Failed to load expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.name || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editingId) {
        // Update existing expense
        await expensesAPI.updateExpense(editingId, {
          amount: parseFloat(formData.amount),
          name: formData.name,
          category: formData.category,
          notes: formData.notes,
          date: formData.date,
        });
        setEditingId(null);
      } else {
        // Add new expense
        await expensesAPI.createExpense({
          amount: parseFloat(formData.amount),
          name: formData.name,
          category: formData.category,
          notes: formData.notes,
          date: formData.date,
        });
      }
      
      // Reset form
      setFormData({
        amount: '',
        name: '',
        category: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
      });
      
      fetchExpenses();
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to save expense';
      alert(`Failed to save expense: ${errorMessage}`);
      console.error('Error saving expense:', err);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingId(expense._id);
    setFormData({
      amount: expense.amount.toString(),
      name: expense.name,
      category: expense.category,
      notes: expense.notes || '',
      date: new Date(expense.date).toISOString().split('T')[0],
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      await expensesAPI.deleteExpense(id);
      fetchExpenses();
    } catch (err) {
      alert('Failed to delete expense');
      console.error(err);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      amount: '',
      name: '',
      category: '',
      notes: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const buttonStyle = {
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '600',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Other'];

  const handleClearFilters = () => {
    setFilters({
      category: '',
      startDate: '',
      endDate: '',
      sort: '',
    });
  };

  return (
    <div>
      {/* Filter Panel */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        marginBottom: '24px',
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
          🔍 Filter Transactions
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
              Sort By
            </label>
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            >
              <option value="">Date (Newest)</option>
              <option value='{"date":1}'>Date (Oldest)</option>
              <option value='{"amount":-1}'>Amount (High to Low)</option>
              <option value='{"amount":1}'>Amount (Low to High)</option>
            </select>
          </div>
        </div>
        
        {(filters.category || filters.startDate || filters.endDate || filters.sort) && (
          <button
            onClick={handleClearFilters}
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              fontSize: '13px',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '400px 1fr',
        gap: '24px',
      }}>
      {/* Left Side - Add/Edit Expense Form */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        height: 'fit-content',
        position: 'sticky',
        top: '100px',
      }}>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          color: '#1f2937',
          marginBottom: '20px',
        }}>
          {editingId ? '✏️ Edit Expense' : '➕ Add New Expense'}
        </h3>
        
        <form onSubmit={handleAddExpense} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
            }}>
              Amount *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              style={inputStyle}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
            }}>
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={inputStyle}
              placeholder="e.g., Grocery Shopping"
              required
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
            }}>
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={inputStyle}
              required
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
            }}>
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
            }}>
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              style={{
                ...inputStyle,
                minHeight: '80px',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
              placeholder="Optional notes..."
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="submit"
              style={buttonStyle}
            >
              {editingId ? 'Update Expense' : 'Add Expense'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                style={{
                  ...buttonStyle,
                  background: '#6b7280',
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Right Side - Expense List */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#1f2937',
          }}>
            All Expenses
          </h3>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#10b981',
          }}>
            Total: ₱{total.toFixed(2)}
          </div>
        </div>

        {/* Expense List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            Loading expenses...
          </div>
        ) : expenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            No expenses found. Add your first expense!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {expenses.map((expense) => (
              <div key={expense._id} style={{
                padding: '16px',
                background: '#f9fafb',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#1f2937',
                    fontSize: '15px',
                    marginBottom: '4px',
                  }}>
                    {expense.name}
                  </div>
                  <div style={{ 
                    fontSize: '13px', 
                    color: '#6b7280',
                  }}>
                    {expense.category} • {new Date(expense.date).toLocaleDateString()}
                    {expense.notes && ` • ${expense.notes}`}
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}>
                  <div style={{ 
                    fontWeight: '700', 
                    color: '#10b981',
                    fontSize: '18px',
                    minWidth: '100px',
                    textAlign: 'right',
                  }}>
                    ₱{expense.amount.toFixed(2)}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEdit(expense)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '13px',
                        fontWeight: '500',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(expense._id)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '13px',
                        fontWeight: '500',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default TransactionsTab;
