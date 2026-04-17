import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts'
import { 
  Calendar, 
  TrendingUp, 
  Activity, 
  Zap,
  Utensils,
  Car,
  ShoppingBag,
  FileText,
  Box,
  Download,
  Clock,
  Briefcase,
  IndianRupee,
  Heart,
  Gamepad
} from 'lucide-react'
import { useExpenses } from '../context/ExpenseContext'
import { useAuth } from '../context/AuthContext'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const COLORS = {
  Food: '#f472b6',
  Travel: '#3b82f6',
  Shopping: '#10b981',
  Bills: '#f59e0b',
  Salary: '#10b981',
  Freelance: '#6366f1',
  Entertainment: '#8b5cf6',
  Other: '#94a3b8',
}

const CATEGORY_ICONS = {
  Food: Utensils,
  Travel: Car,
  Shopping: ShoppingBag,
  Bills: FileText,
  Salary: IndianRupee,
  Freelance: Briefcase,
  Entertainment: Gamepad,
  Health: Heart,
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
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function MonthlySummary() {
  const { expenses, budgets, summaries } = useExpenses()
  const { currentUser } = useAuth()

  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  )

  const monthData = useMemo(() => {
    const [year, monthIdx] = selectedMonth.split('-').map(Number)
    const month = monthIdx - 1

    const filtered = expenses.filter(e => {
      const d = new Date(e.date)
      return d.getFullYear() === year && d.getMonth() === month
    })

    const income = filtered.filter(e => e.type === 'income').reduce((sum, e) => sum + Number(e.amount), 0)
    const spent = filtered.filter(e => e.type === 'expense').reduce((sum, e) => sum + Number(e.amount), 0)
    const savings = income - spent

    const categoryTotals = {}
    filtered.filter(e => e.type === 'expense').forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount)
    })

    const categoryData = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
    })).sort((a, b) => b.value - a.value)

    const budgetStatus = budgets.map(b => {
      const actual = categoryTotals[b.category] || 0
      return {
        category: b.category,
        limit: b.monthlyLimit,
        actual,
        percent: b.monthlyLimit > 0 ? (actual / b.monthlyLimit) * 100 : 0
      }
    })

    return {
      expenses: filtered.sort((a,b) => new Date(b.date) - new Date(a.date)),
      income,
      spent,
      savings,
      categoryData,
      budgetStatus,
      count: filtered.length,
    }
  }, [expenses, budgets, selectedMonth])

  const monthLabel = new Date(selectedMonth + '-01').toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })

  const generateProfessionalPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const timestamp = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date())

    // 1. Header Section
    doc.setFillColor(15, 23, 42) // Deep Navy
    doc.rect(0, 0, pageWidth, 45, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('ExpenseFlow Monthly Report', 15, 20)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Financial Period: ${monthLabel}`, 15, 30)
    doc.text(`Statement Generated: ${timestamp}`, pageWidth - 15, 30, { align: 'right' })

    // 2. Client Info
    doc.setTextColor(50, 50, 50)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Account Details', 15, 60)
    doc.setFont('helvetica', 'normal')
    doc.text(`User: ${currentUser?.name || 'Authorized User'}`, 15, 68)
    doc.text(`Email: ${currentUser?.email || 'N/A'}`, 15, 74)

    // 3. Executive Financial Summary
    autoTable(doc, {
      startY: 85,
      head: [['Financial Overview', 'Current Month Totals']],
      body: [
        ['Total Monthly Income', `INR ${monthData.income.toLocaleString('en-IN')}`],
        ['Total Monthly Expenditure', `INR ${monthData.spent.toLocaleString('en-IN')}`],
        ['Net Savings/Surplus', `INR ${monthData.savings.toLocaleString('en-IN')}`],
        ['Savings Rate', `${monthData.income > 0 ? ((monthData.savings / monthData.income) * 100).toFixed(1) : '0'}%`],
        ['Summary Status', monthData.savings >= 0 ? 'Surplus' : 'Deficit']
      ],
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { cellPadding: 5 }
    })

    // 4. Budget Compliance
    if (monthData.budgetStatus.length > 0) {
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Budget Compliance Report', 15, doc.lastAutoTable.finalY + 15)

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Category', 'Budget Limit', 'Actual Spending', 'Utilization']],
        body: monthData.budgetStatus.map(b => [
          b.category,
          `INR ${b.limit.toLocaleString()}`,
          `INR ${b.actual.toLocaleString()}`,
          `${b.percent.toFixed(1)}%`
        ]),
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255] }
      })
    }

    // 5. Categorical Breakdown
    doc.addPage()
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Detailed Spending Analysis', 15, 20)
    
    autoTable(doc, {
      startY: 30,
      head: [['Category', 'Amount (INR)', '% Calculation']],
      body: monthData.categoryData.map(cat => [
        cat.name,
        cat.value.toLocaleString(),
        `${monthData.spent > 0 ? ((cat.value / monthData.spent) * 100).toFixed(1) : '0'}%`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] }
    })

    // 6. Complete History
    doc.setFontSize(14)
    doc.text('Full Transaction History', 15, doc.lastAutoTable.finalY + 15)
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 22,
      head: [['Date', 'Type', 'Category', 'Description', 'Amount']],
      body: monthData.expenses.map(e => [
        new Date(e.date).toLocaleDateString('en-IN'),
        e.type.toUpperCase(),
        e.category,
        e.description || '—',
        `INR ${Number(e.amount).toLocaleString()}`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [51, 65, 85] },
      styles: { fontSize: 8 }
    })

    doc.save(`Financial_Statement_${selectedMonth}.pdf`)
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <header className="page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-gradient">Monthly Statement</h1>
          <p className="text-muted">A deep dive into your savings and spending for {monthLabel}</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <input
            type="month"
            className="form-control"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
          />
          <button 
            className="btn btn-primary shadow-glow flex gap-2" 
            onClick={generateProfessionalPDF}
            disabled={monthData.expenses.length === 0}
          >
            <Download size={18} /> Download PDF
          </button>
        </div>
      </header>

      {/* Financial Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="summary-card bg-success/5 border-success/10">
          <div className="flex justify-between items-start">
            <div>
              <div className="card-label">Monthly Income</div>
              <div className="card-value text-success">₹{monthData.income.toLocaleString()}</div>
            </div>
            <TrendingUp className="text-success opacity-20" size={32} />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="summary-card bg-danger/5 border-danger/10">
          <div className="flex justify-between items-start">
            <div>
              <div className="card-label">Monthly Expenses</div>
              <div className="card-value text-danger">₹{monthData.spent.toLocaleString()}</div>
            </div>
            <Activity className="text-danger opacity-20" size={32} />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="summary-card bg-accent/5 border-accent/10">
          <div className="flex justify-between items-start">
            <div>
              <div className="card-label">Net Savings</div>
              <div className="card-value text-accent">₹{monthData.savings.toLocaleString()}</div>
            </div>
            <Zap className="text-accent opacity-20" size={32} />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Comparison Chart */}
        <motion.div variants={itemVariants} className="chart-section p-6 rounded-3xl bg-secondary/30 backdrop-blur-xl border border-white/5">
          <h3 className="text-lg font-bold mb-6">Cash Flow Proportion</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Income', amount: monthData.income, fill: '#10b981' },
                { name: 'Spent', amount: monthData.spent, fill: '#ef4444' }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px rgba(0,0,0,0.3)' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Budget Status */}
        <motion.div variants={itemVariants} className="chart-section p-6 rounded-3xl bg-secondary/30 border border-white/5">
          <h3 className="text-lg font-bold mb-6">Monthly Goals Tracking</h3>
          <div className="space-y-6 max-h-[250px] overflow-y-auto no-scrollbar pr-2">
            {monthData.budgetStatus.length > 0 ? (
              monthData.budgetStatus.map(b => (
                <div key={b.category} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                    <span>{b.category}</span>
                    <span className="text-muted">₹{b.actual} / ₹{b.limit}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${Math.min(b.percent, 100)}%` }}
                      className={`h-full rounded-full ${
                        b.percent > 90 ? 'bg-danger' : b.percent > 70 ? 'bg-warning' : 'bg-success'
                      }`}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted italic text-sm">No budget targets set for this month.</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Transaction History Table */}
      <motion.div variants={itemVariants} className="expense-table-wrapper">
        <div className="p-6 border-b border-white/5">
          <h3 className="font-bold flex items-center gap-2">
            <Clock size={16} className="text-accent" /> Transaction Log
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="expense-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Source/Recipient</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {monthData.expenses.map(exp => (
                <tr key={exp._id}>
                  <td className="text-xs text-muted">
                    {new Date(exp.date).toLocaleDateString('en-IN')}
                  </td>
                  <td>
                    <div className="font-semibold">{exp.description || '—'}</div>
                    <div className="text-[10px] uppercase text-muted font-bold">{exp.type}</div>
                  </td>
                  <td>
                    <span className={`category-badge category-${exp.category.toLowerCase()}`}>
                      {exp.category}
                    </span>
                  </td>
                  <td className={`font-black tracking-tight text-right ${exp.type === 'income' ? 'text-success' : ''}`}>
                    {exp.type === 'income' ? '+' : ''}₹{Number(exp.amount).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {monthData.expenses.length === 0 && (
            <div className="p-16 text-center text-muted">
              <Box size={32} className="mx-auto mb-4 opacity-10" />
              <p>No activity recorded in {monthLabel}</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
