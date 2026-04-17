import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Plus,
  Utensils,
  Car,
  ShoppingBag,
  FileText,
  Box,
  Download,
  Target,
  IndianRupee,
  Briefcase,
  Zap,
  Heart,
  Gamepad
} from 'lucide-react'
import { useExpenses } from '../context/ExpenseContext'

const CATEGORY_ICONS = {
  Food: Utensils,
  Travel: Car,
  Shopping: ShoppingBag,
  Bills: FileText,
  Salary: IndianRupee,
  Freelance: Briefcase,
  Investments: Zap,
  Health: Heart,
  Entertainment: Gamepad,
  Other: Box,
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
}

export default function ExpenseList() {
  const { expenses, budgets, deleteExpense, setCategoryBudget } = useExpenses()
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterType, setFilterType] = useState('All')
  
  // Budget Modal State
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [budgetForm, setBudgetForm] = useState({ category: 'Food', limit: '' })

  const filtered = expenses.filter(exp => {
    const matchesSearch =
      exp.description?.toLowerCase().includes(search.toLowerCase()) ||
      exp.category.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = filterCategory === 'All' || exp.category === filterCategory
    const matchesType = filterType === 'All' || exp.type === filterType
    return matchesSearch && matchesCategory && matchesType
  })

  function handleDelete(id) {
    if (window.confirm('Are you sure you want to delete this record?')) {
      deleteExpense(id)
    }
  }

  const exportToCSV = () => {
    const headers = 'Date,Description,Category,Type,Amount\n'
    const rows = filtered.map(e => 
      `${new Date(e.date).toLocaleDateString()},"${e.description || ''}",${e.category},${e.type},${e.amount}`
    ).join('\n')
    
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ExpenseFlow_Statement_${new Date().toLocaleDateString()}.csv`
    a.click()
  }

  const handleSetBudget = async (e) => {
    e.preventDefault()
    if (!budgetForm.limit || Number(budgetForm.limit) < 0) return
    const success = await setCategoryBudget(budgetForm.category, Number(budgetForm.limit))
    if (success) {
      setShowBudgetModal(false)
      setBudgetForm({ category: 'Food', limit: '' })
    }
  }

  return (
    <div className="animate-in space-y-8">
      <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-gradient">Transaction History</h1>
          <p className="text-muted">Tracking {expenses.length} records in total</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={() => setShowBudgetModal(true)} className="btn btn-ghost flex-1 md:flex-none gap-2">
            <Target size={18} /> Set Budgets
          </button>
          <button onClick={exportToCSV} className="btn btn-ghost flex-1 md:flex-none gap-2">
            <Download size={18} /> Export CSV
          </button>
          <Link to="/expenses/new" className="btn btn-primary flex-1 md:flex-none gap-2">
            <Plus size={18} /> Add New
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="expense-table-wrapper">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border-b border-white/5">
          <div className="search-box">
            <Search size={18} className="text-muted" />
            <input
              type="text"
              placeholder="Search descriptions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-control"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {Object.keys(CATEGORY_ICONS).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            className="form-control"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="income">Income Only</option>
            <option value="expense">Expenses Only</option>
          </select>
        </div>

        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="expense-table">
              <thead>
                <tr>
                  <th>Detail</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <motion.tbody variants={listVariants} initial="hidden" animate="visible">
                <AnimatePresence mode="popLayout">
                  {filtered.map(exp => {
                    const Icon = CATEGORY_ICONS[exp.category] || Box
                    return (
                      <motion.tr key={exp._id} variants={itemVariants} layout exit={{ opacity: 0, scale: 0.95 }}>
                        <td>
                          <div className="font-bold">{exp.description || 'Untitled'}</div>
                          {exp.isRecurring && <div className="text-[9px] text-accent-light uppercase font-bold tracking-tighter">Recurring {exp.recurringInterval}</div>}
                        </td>
                        <td>
                          <span className={`category-badge category-${exp.category.toLowerCase()}`}>
                            <Icon size={12} /> {exp.category}
                          </span>
                        </td>
                        <td className="text-sm text-muted">
                          {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className={`font-black ${exp.type === 'income' ? 'text-success' : 'text-white'}`}>
                          {exp.type === 'income' ? '+' : ''}₹{Number(exp.amount).toLocaleString('en-IN')}
                        </td>
                        <td>
                          <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                            <Link to={`/expenses/edit/${exp._id}`} className="action-btn" title="Edit">
                              <Edit3 size={16} />
                            </Link>
                            <button className="action-btn delete" onClick={() => handleDelete(exp._id)} title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </motion.tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center text-muted">
            <Box size={48} className="mx-auto mb-4 opacity-10" />
            <p className="font-medium">No transactions found for the selected filters.</p>
          </div>
        )}
      </div>

      {/* Simple Budget Modal */}
      <AnimatePresence>
        {showBudgetModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowBudgetModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-secondary border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-black text-gradient mb-2">Manage Budgets</h2>
              <p className="text-sm text-muted mb-6">Set a monthly spending limit for a category</p>
              
              <form onSubmit={handleSetBudget} className="space-y-4">
                <div className="form-group">
                  <label className="text-xs font-bold uppercase text-muted">Category</label>
                  <select 
                    className="form-control"
                    value={budgetForm.category}
                    onChange={e => setBudgetForm({...budgetForm, category: e.target.value})}
                  >
                    <option>Food</option>
                    <option>Travel</option>
                    <option>Shopping</option>
                    <option>Bills</option>
                    <option>Entertainment</option>
                    <option>Health</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="text-xs font-bold uppercase text-muted">Monthly Limit (₹)</label>
                  <input 
                    type="number" className="form-control" placeholder="5000"
                    value={budgetForm.limit}
                    onChange={e => setBudgetForm({...budgetForm, limit: e.target.value})}
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="submit" className="btn btn-primary flex-1 py-3">Update Budget</button>
                  <button type="button" onClick={() => setShowBudgetModal(false)} className="btn btn-ghost flex-1">Cancel</button>
                </div>
              </form>

              <div className="mt-8 pt-6 border-t border-white/5 space-y-3 max-h-40 overflow-y-auto no-scrollbar">
                {budgets.map(b => (
                  <div key={b._id} className="flex justify-between items-center text-sm">
                    <span className="font-bold">{b.category}</span>
                    <span className="text-accent">₹{b.monthlyLimit.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
