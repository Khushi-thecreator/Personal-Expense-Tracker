import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
} from 'recharts'
import { 
  TrendingUp, 
  CreditCard, 
  Target, 
  ArrowRight,
  Utensils,
  Car,
  ShoppingBag,
  FileText,
  Box,
  Filter
} from 'lucide-react'
import { useExpenses } from '../context/ExpenseContext'

const COLORS = ['#6366f1', '#f472b6', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const CATEGORY_ICONS = {
  Food: Utensils,
  Travel: Car,
  Shopping: ShoppingBag,
  Bills: FileText,
  Other: Box,
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
}

export default function Dashboard() {
  const { expenses, budgets, summaries: contextSummaries } = useExpenses()
  
  const now = new Date()
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(now.getMonth())

  const { filteredExpenses, filteredSummaries, recentExpenses } = useMemo(() => {
    // Filter expenses for selected month & year
    const filtered = expenses.filter(e => {
      const d = new Date(e.date)
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonthIdx
    })

    // Calculate Summary Stats
    const totalIncome = filtered
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + Number(e.amount), 0)

    const totalExpenses = filtered
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + Number(e.amount), 0)

    const netSavings = totalIncome - totalExpenses
    
    const categoryTotals = {}
    filtered.filter(e => e.type === 'expense').forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount)
    })

    const categoryData = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
    })).sort((a, b) => b.value - a.value)

    const topCategory = categoryData.length > 0 ? categoryData[0].name : 'None'

    // Budget Analysis for the selected month
    const budgetAnalysis = budgets.map(b => {
      const spent = categoryTotals[b.category] || 0
      return {
        ...b,
        spent,
        percent: b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0
      }
    })

    // Recent 5 in this month
    const recent = [...filtered].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

    return {
      filteredExpenses: filtered,
      recentExpenses: recent,
      filteredSummaries: {
        totalIncome,
        totalExpenses,
        netSavings,
        topCategory,
        categoryData,
        budgetAnalysis
      }
    }
  }, [expenses, budgets, selectedYear, selectedMonthIdx])

  const monthLabel = `${MONTHS[selectedMonthIdx]} ${selectedYear}`

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <header className="page-header">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-gradient">Financial Dashboard</h1>
            <p className="text-muted font-medium">Analytics for {monthLabel}</p>
          </div>
          
          {/* Simple Month & Year Selectors */}
          <div className="flex items-center gap-3">
            <select
              value={selectedMonthIdx}
              onChange={(e) => setSelectedMonthIdx(Number(e.target.value))}
              className="form-control"
              style={{ width: 'auto', minWidth: '140px' }}
            >
              {MONTHS.map((m, idx) => (
                <option key={m} value={idx}>{m}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="form-control"
              style={{ width: 'auto', minWidth: '100px' }}
            >
              {Array.from({ length: 10 }, (_, i) => now.getFullYear() - 5 + i).map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="summary-cards grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div variants={itemVariants} className="summary-card bg-success/5 border-success/10">
          <div className="flex justify-between items-start">
            <div>
              <div className="card-label">Monthly Income</div>
              <div className="card-value text-success">
                ₹{filteredSummaries.totalIncome.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-success/10 text-success">
              <TrendingUp size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="summary-card bg-danger/5 border-danger/10">
          <div className="flex justify-between items-start">
            <div>
              <div className="card-label">Monthly Expenses</div>
              <div className="card-value text-danger">
                ₹{filteredSummaries.totalExpenses.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-danger/10 text-danger">
              <CreditCard size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="summary-card bg-accent/5 border-accent/10">
          <div className="flex justify-between items-start">
            <div>
              <div className="card-label">Net Savings</div>
              <div className="card-value text-accent">
                ₹{filteredSummaries.netSavings.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-accent/10 text-accent">
              <Target size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Charts & Budgets */}
        <div className="lg:col-span-2 space-y-8">
          {/* Spending Chart */}
          <motion.div variants={itemVariants} className="chart-section">
            <div className="chart-header">
              <h3>Distribution Summary</h3>
            </div>

            <div className="chart-wrapper">
              {filteredSummaries.categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={filteredSummaries.categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {filteredSummaries.categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(15, 23, 42, 0.9)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Spent']}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state">
                  <Box size={48} className="mx-auto mb-4 opacity-10" />
                  <h3>No data for {monthLabel}</h3>
                  <p>Add expenses in this period to see the breakdown.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Budget Progress Bars */}
          <motion.div variants={itemVariants} className="card-glass p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Budget vs Actual</h3>
              <Link to="/expenses" className="text-xs text-accent hover:underline">Manage Budgets</Link>
            </div>
            <div className="space-y-6">
              {filteredSummaries.budgetAnalysis.length > 0 ? (
                filteredSummaries.budgetAnalysis.map(budget => (
                  <div key={budget._id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{budget.category}</span>
                      <span className="text-muted">
                        ₹{budget.spent.toLocaleString()} / ₹{budget.monthlyLimit.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(budget.percent, 100)}%` }}
                        className={`h-full rounded-full ${
                          budget.percent > 90 ? 'bg-danger' : budget.percent > 70 ? 'bg-warning' : 'bg-success'
                        }`}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted text-sm italic">
                  No budgets set. Set limits in the expenses page to track goals.
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Recent Activity */}
        <motion.div variants={itemVariants} className="expense-table-wrapper">
          <div className="expense-table-header">
            <h3>Recent Activity</h3>
            <Link to="/expenses" className="btn btn-ghost btn-sm">
              <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="expense-table">
              <thead>
                <tr>
                  <th>Detail</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentExpenses.map(exp => {
                  const Icon = CATEGORY_ICONS[exp.category] || Box
                  return (
                    <tr key={exp._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${exp.type === 'income' ? 'bg-success/10' : 'bg-white/5'}`}>
                            <Icon size={18} className={exp.type === 'income' ? 'text-success' : 'text-secondary'} />
                          </div>
                          <div>
                            <div className="font-semibold">{exp.description || 'Untitled'}</div>
                            <div className="text-xs text-muted">
                              {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {exp.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={`expense-amount ${exp.type === 'income' ? 'text-success' : ''}`}>
                        {exp.type === 'income' ? '+' : ''}₹{Number(exp.amount).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {recentExpenses.length === 0 && (
              <div className="p-12 text-center text-muted">
                <Filter size={32} className="mx-auto mb-4 opacity-10" />
                <p>No transactions found.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
