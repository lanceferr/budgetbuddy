import { useEffect, useState } from 'react';
import { savingsGoalsAPI } from '../services/api';
import type { SavingsGoal } from '../types';

const SavingsTab = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [contributingTo, setContributingTo] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');

  const [formData, setFormData] = useState({
    goalName: '',
    targetAmount: '',
    targetDate: '',
    notes: '',
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await savingsGoalsAPI.getSavingsGoals();
      setGoals(res.savingsGoals || []);
    } catch (err: any) {
      console.error('Failed to load savings goals:', err);
      setError(err?.message || 'Failed to load savings goals. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetAmountNum = Number(formData.targetAmount);
    if (!formData.targetAmount || isNaN(targetAmountNum) || targetAmountNum <= 0) {
      setError('Please enter a valid positive target amount');
      return;
    }

    if (!formData.goalName || !formData.targetDate) {
      setError('Goal name and target date are required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (editingId) {
        await savingsGoalsAPI.updateSavingsGoal(editingId, {
          goalName: formData.goalName,
          targetAmount: targetAmountNum,
          targetDate: formData.targetDate,
          notes: formData.notes,
        });
        setEditingId(null);
      } else {
        await savingsGoalsAPI.createSavingsGoal({
          goalName: formData.goalName,
          targetAmount: targetAmountNum,
          targetDate: formData.targetDate,
          notes: formData.notes,
        });
      }

      setFormData({
        goalName: '',
        targetAmount: '',
        targetDate: '',
        notes: '',
      });
      await fetchGoals();
    } catch (err: any) {
      setError(err?.message || 'Failed to save savings goal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (goal: SavingsGoal) => {
    setEditingId(goal._id);
    setFormData({
      goalName: goal.goalName,
      targetAmount: goal.targetAmount.toString(),
      targetDate: new Date(goal.targetDate).toISOString().split('T')[0],
      notes: goal.notes || '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this savings goal?')) return;
    try {
      setError(null);
      await savingsGoalsAPI.deleteSavingsGoal(id);
      await fetchGoals();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete savings goal. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      goalName: '',
      targetAmount: '',
      targetDate: '',
      notes: '',
    });
  };

  const handleContribute = async (goalId: string) => {
    const amount = Number(contributionAmount);
    if (!contributionAmount || isNaN(amount) || amount <= 0) {
      setError('Please enter a valid contribution amount');
      return;
    }

    try {
      setError(null);
      await savingsGoalsAPI.addContribution(goalId, amount);
      setContributingTo(null);
      setContributionAmount('');
      await fetchGoals();
    } catch (err: any) {
      setError(err?.message || 'Failed to add contribution. Please try again.');
    }
  };

  const getProgress = (goal: SavingsGoal) => {
    return Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  };

  const getDaysRemaining = (targetDate: Date | string) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Calculate stats for mini cards
  const getTotalSaved = () => goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const getTotalTarget = () => goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const getCompletedGoals = () => goals.filter(g => getProgress(g) >= 100).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Mini Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          borderRadius: '12px',
          padding: '20px',
          color: 'white',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
        }}>
          <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px' }}>Total Saved</div>
          <div style={{ fontSize: '28px', fontWeight: '700' }}>₱{getTotalSaved().toFixed(2)}</div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
            {getProgress({ currentAmount: getTotalSaved(), targetAmount: getTotalTarget() } as SavingsGoal)}% of total goals
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          borderRadius: '12px',
          padding: '20px',
          color: 'white',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
        }}>
          <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px' }}>Total Target</div>
          <div style={{ fontSize: '28px', fontWeight: '700' }}>₱{getTotalTarget().toFixed(2)}</div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
            ₱{(getTotalTarget() - getTotalSaved()).toFixed(2)} remaining
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          borderRadius: '12px',
          padding: '20px',
          color: 'white',
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
        }}>
          <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px' }}>Active Goals</div>
          <div style={{ fontSize: '28px', fontWeight: '700' }}>{goals.length}</div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
            {getCompletedGoals()} completed
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          borderRadius: '12px',
          padding: '20px',
          color: 'white',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
        }}>
          <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px' }}>Savings Rate</div>
          <div style={{ fontSize: '28px', fontWeight: '700' }}>
            {getTotalTarget() > 0 ? Math.round((getTotalSaved() / getTotalTarget()) * 100) : 0}%
          </div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>Overall progress</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '24px' }}>
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
      <div
        style={{
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
        }}
      >
        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
          {editingId ? '✏️ Edit Savings Goal' : '🎯 Create Savings Goal'}
        </h3>

        {error && (
          <div
            style={{
              padding: '12px',
              background: '#fee2e2',
              color: '#dc2626',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px',
              border: '1px solid #fecaca',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              Goal Name *
            </label>
            <input
              type="text"
              value={formData.goalName}
              onChange={(e) => setFormData({ ...formData, goalName: e.target.value })}
              required
              placeholder="e.g., Emergency Fund, Vacation, New Car"
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
              Target Amount (₱) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
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
              Target Date *
            </label>
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              required
              min={new Date().toISOString().split('T')[0]}
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
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Why are you saving for this?"
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

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
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
              {submitting ? 'Saving...' : editingId ? 'Update' : 'Create Goal'}
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
      <div
        style={{
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
        }}
      >
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>
          🎯 Your Savings Goals
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Loading savings goals...</div>
        ) : goals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
            <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              No Savings Goals Yet
            </h4>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Create your first savings goal to start tracking!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {goals.map((goal) => {
              const progress = getProgress(goal);
              const daysRemaining = getDaysRemaining(goal.targetDate);
              const isComplete = progress >= 100;
              const isOverdue = daysRemaining < 0;

              return (
                <div
                  key={goal._id}
                  style={{
                    padding: '20px',
                    borderRadius: '12px',
                    background: isComplete ? '#f0fdf4' : '#f9fafb',
                    border: `2px solid ${isComplete ? '#86efac' : '#e5e7eb'}`,
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>{goal.goalName}</h4>
                        {isComplete && (
                          <span
                            style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              background: '#d1fae5',
                              color: '#065f46',
                              borderRadius: '4px',
                              fontWeight: '600',
                            }}
                          >
                            ✓ COMPLETED
                          </span>
                        )}
                        {isOverdue && !isComplete && (
                          <span
                            style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              background: '#fee2e2',
                              color: '#991b1b',
                              borderRadius: '4px',
                              fontWeight: '600',
                            }}
                          >
                            OVERDUE
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                        📅 Target: {new Date(goal.targetDate).toLocaleDateString()} {!isOverdue && `(${daysRemaining} days)`}
                      </div>

                      {/* Progress Bar with Milestone Markers */}
                      <div style={{ marginBottom: '12px' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '14px',
                            marginBottom: '6px',
                          }}
                        >
                          <span style={{ fontWeight: '600', color: '#1f2937' }}>
                            ₱{goal.currentAmount.toFixed(2)} / ₱{goal.targetAmount.toFixed(2)}
                          </span>
                          <span style={{ fontWeight: '700', color: isComplete ? '#10b981' : '#3b82f6' }}>
                            {progress}%
                          </span>
                        </div>
                        <div style={{ position: 'relative' }}>
                          <div style={{ height: '12px', background: '#e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${progress}%`,
                                height: '100%',
                                background: isComplete
                                  ? 'linear-gradient(90deg, #10b981, #059669)'
                                  : 'linear-gradient(90deg, #3b82f6, #2563eb)',
                                transition: 'width 0.5s ease',
                              }}
                            />
                          </div>
                          {/* Milestone Markers */}
                          {[25, 50, 75].map((milestone) => (
                            <div
                              key={milestone}
                              style={{
                                position: 'absolute',
                                left: `${milestone}%`,
                                top: '0',
                                transform: 'translateX(-50%)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                              }}
                            >
                              <div
                                style={{
                                  width: '3px',
                                  height: '12px',
                                  background: progress >= milestone ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.2)',
                                }}
                              />
                              <div
                                style={{
                                  fontSize: '10px',
                                  color: progress >= milestone ? '#10b981' : '#9ca3af',
                                  fontWeight: progress >= milestone ? '700' : '500',
                                  marginTop: '2px',
                                }}
                              >
                                {progress >= milestone ? '✓' : milestone + '%'}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                          Remaining: ₱{Math.max(0, goal.targetAmount - goal.currentAmount).toFixed(2)}
                        </div>
                      </div>

                      {goal.notes && (
                        <div style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic', marginBottom: '12px' }}>
                          💭 {goal.notes}
                        </div>
                      )}

                      {/* Contribution Section */}
                      {contributingTo === goal._id ? (
                        <div
                          style={{
                            display: 'flex',
                            gap: '8px',
                            padding: '12px',
                            background: '#f0fdf4',
                            borderRadius: '8px',
                            border: '1px solid #86efac',
                          }}
                        >
                          <input
                            type="number"
                            step="0.01"
                            value={contributionAmount}
                            onChange={(e) => setContributionAmount(e.target.value)}
                            placeholder="Amount"
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              borderRadius: '6px',
                              border: '1px solid #d1d5db',
                              fontSize: '14px',
                            }}
                          />
                          <button
                            onClick={() => handleContribute(goal._id)}
                            style={{
                              padding: '8px 16px',
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '600',
                            }}
                          >
                            Add
                          </button>
                          <button
                            onClick={() => {
                              setContributingTo(null);
                              setContributionAmount('');
                            }}
                            style={{
                              padding: '8px 12px',
                              background: '#6b7280',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '600',
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => setContributingTo(goal._id)}
                            style={{
                              padding: '8px 16px',
                              background: '#d1fae5',
                              color: '#065f46',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '600',
                            }}
                          >
                            💰 Add Money
                          </button>
                          <button
                            onClick={() => handleEdit(goal)}
                            style={{
                              padding: '8px 12px',
                              background: '#dbeafe',
                              color: '#1e40af',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '600',
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(goal._id)}
                            style={{
                              padding: '8px 12px',
                              background: '#fee2e2',
                              color: '#991b1b',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '600',
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
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

export default SavingsTab;
