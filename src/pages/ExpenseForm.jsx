import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Save, 
  AlertCircle,
  IndianRupee,
  Calendar as CalendarIcon,
  Tag,
  MessageSquare,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw
} from 'lucide-react'
import { useExpenses } from '../context/ExpenseContext'

export default function ExpenseForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { addExpense, updateExpense, getExpenseById } = useExpenses()
  const isEdit = !!id

  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Other',
    description: '',
    type: 'expense',
    isRecurring: false,
    recurringInterval: 'monthly'
  })

  const [error, setError] = useState('')

  useEffect(() => {
    if (isEdit) {
      const exp = getExpenseById(id)
      if (exp) {
        setFormData({
          amount: exp.amount,
          date: new Date(exp.date).toISOString().split('T')[0],
          category: exp.category,
          description: exp.description || '',
          type: exp.type || 'expense',
          isRecurring: exp.isRecurring || false,
          recurringInterval: exp.recurringInterval || 'monthly'
        })
      }
    }
  }, [id, isEdit, getExpenseById])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    const payload = {
      ...formData,
      amount: Number(formData.amount)
    }

    const success = isEdit 
      ? await updateExpense(id, payload)
      : await addExpense(payload)

    if (success) {
      navigate('/expenses')
    } else {
      setError('Failed to save transaction. Please try again.')
    }
  }

  return (
    <div className="animate-in max-w-2xl mx-auto">
      <header className="page-header">
        <h1 className="text-gradient">{isEdit ? 'Update Transaction' : 'Record Entry'}</h1>
        <p>{isEdit ? 'Modify your details below' : 'Log a new income or expense item'}</p>
      </header>

      <motion.form 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onSubmit={handleSubmit} 
        className="expense-form-card space-y-6"
      >
        {error && (
          <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger flex items-center gap-3">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Type Toggle */}
        <div className="flex p-1 bg-secondary/30 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'expense' })}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
              formData.type === 'expense' 
                ? 'bg-danger text-white shadow-lg' 
                : 'text-muted hover:text-white'
            }`}
          >
            <ArrowUpRight size={18} /> Expense
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'income' })}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
              formData.type === 'income' 
                ? 'bg-success text-white shadow-lg' 
                : 'text-muted hover:text-white'
            }`}
          >
            <ArrowDownLeft size={18} /> Income
          </button>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label><IndianRupee size={14} className="inline mr-1" /> Amount</label>
            <input
              type="number"
              className="form-control"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label><CalendarIcon size={14} className="inline mr-1" /> Date</label>
            <input
              type="date"
              className="form-control"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label><Tag size={14} className="inline mr-1" /> Category</label>
          <select
            className="form-control"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            {formData.type === 'expense' ? (
              <>
                <option>Food</option>
                <option>Travel</option>
                <option>Shopping</option>
                <option>Bills</option>
                <option>Entertainment</option>
                <option>Health</option>
                <option>Other</option>
              </>
            ) : (
              <>
                <option>Salary</option>
                <option>Freelance</option>
                <option>Investments</option>
                <option>Gifts</option>
                <option>Other</option>
              </>
            )}
          </select>
        </div>

        <div className="form-group">
          <label><MessageSquare size={14} className="inline mr-1" /> Description (Optional)</label>
          <textarea
            className="form-control"
            placeholder="Add a note..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Recurring Option */}
        <div className="p-4 rounded-2xl bg-glass border border-white/5 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              />
              <div className="w-10 h-6 bg-secondary/50 rounded-full peer peer-checked:bg-accent after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm">Recurring Transaction</span>
              <span className="text-[10px] text-muted uppercase">Automatically log every month</span>
            </div>
          </label>

          {formData.isRecurring && (
            <div className="flex items-center gap-3 animate-in pt-2">
              <RefreshCw size={14} className="text-secondary" />
              <select 
                className="form-control" 
                style={{ padding: '0.5rem 1rem' }}
                value={formData.recurringInterval}
                onChange={(e) => setFormData({ ...formData, recurringInterval: e.target.value })}
              >
                <option value="monthly">Every Month</option>
                <option value="weekly">Every Week</option>
                <option value="yearly">Every Year</option>
              </select>
            </div>
          )}
        </div>

        <div className="form-actions pt-4">
          <button type="submit" className="btn btn-primary btn-block">
            <Save size={18} /> {isEdit ? 'Update Record' : 'Save Transaction'}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-block"
            onClick={() => navigate('/expenses')}
          >
            Cancel
          </button>
        </div>
      </motion.form>
    </div>
  )
}
