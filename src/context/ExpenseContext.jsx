import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { useAuth } from './AuthContext'

const ExpenseContext = createContext()
const API_URL = import.meta.env.VITE_API_URL

export function useExpenses() {
  return useContext(ExpenseContext)
}

export function ExpenseProvider({ children }) {
  const { currentUser, token, logout } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch all transactions and budgets when user logs in
  useEffect(() => {
    if (token) {
      fetchData()
    } else {
      setExpenses([])
      setBudgets([])
    }
  }, [token])

  async function fetchData() {
    setLoading(true)
    try {
      const [transRes, budgetRes] = await Promise.all([
        fetch(`${API_URL}/transactions`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/budgets`, { headers: { 'Authorization': `Bearer ${token}` } })
      ])

      if (transRes.status === 401 || budgetRes.status === 401) {
        logout()
        return
      }

      const transData = await transRes.json()
      const budgetData = await budgetRes.json()
      
      setExpenses(transData)
      setBudgets(budgetData)

      // Handle Recurring Logic after fetch
      processRecurring(transData)
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function processRecurring(allTransactions) {
    const currentMonthStr = new Date().toISOString().slice(0, 7) // YYYY-MM
    
    const recurringTemplates = allTransactions.filter(t => t.isRecurring && t.lastProcessedMonth !== currentMonthStr)
    
    for (const template of recurringTemplates) {
      // Create new transaction for current month
      const newEntry = {
        ...template,
        _id: undefined, // Remove ID to create new
        date: new Date().toISOString(),
        lastProcessedMonth: currentMonthStr,
        isRecurring: false // The child entry shouldn't be a template itself
      }
      
      const res = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newEntry),
      })

      if (res.ok) {
        // Update the template's lastProcessedMonth on server
        await fetch(`${API_URL}/transactions/${template._id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ lastProcessedMonth: currentMonthStr }),
        })
      }
    }
    
    // If any were processed, re-fetch to get new list
    if (recurringTemplates.length > 0) {
      const reFetch = await fetch(`${API_URL}/transactions`, { headers: { 'Authorization': `Bearer ${token}` } })
      const updatedData = await reFetch.json()
      setExpenses(updatedData)
    }
  }

  async function addExpense(expenseData) {
    try {
      const response = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(expenseData),
      })
      const newTransaction = await response.json()
      if (response.ok) setExpenses(prev => [newTransaction, ...prev])
      return response.ok
    } catch (error) {
      return false
    }
  }

  async function updateExpense(id, updatedData) {
    try {
      const response = await fetch(`${API_URL}/transactions/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData),
      })
      if (response.ok) {
        const updated = await response.json()
        setExpenses(prev => prev.map(exp => (exp._id === id ? updated : exp)))
      }
      return response.ok
    } catch (error) {
      return false
    }
  }

  async function deleteExpense(id) {
    try {
      const response = await fetch(`${API_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (response.ok) setExpenses(prev => prev.filter(exp => exp._id !== id))
      return response.ok
    } catch (error) {
      return false
    }
  }

  async function setCategoryBudget(category, monthlyLimit) {
    try {
      const response = await fetch(`${API_URL}/budgets`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ category, monthlyLimit }),
      })
      if (response.ok) {
        const newBudget = await response.json()
        setBudgets(prev => {
          const filtered = prev.filter(b => b.category !== category)
          return [...filtered, newBudget]
        })
      }
      return response.ok
    } catch (error) {
      return false
    }
  }

  function getExpenseById(id) {
    return expenses.find(exp => exp._id === id) || null
  }

  // Computed summaries
  const summaries = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const monthExpensesList = expenses.filter(e => {
      const d = new Date(e.date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })

    const totalIncome = monthExpensesList
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + Number(e.amount), 0)

    const totalExpenses = monthExpensesList
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + Number(e.amount), 0)

    const netSavings = totalIncome - totalExpenses

    const categoryTotals = {}
    monthExpensesList.filter(e => e.type === 'expense').forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount)
    })

    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]

    const categoryData = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
    }))

    // Budget Analysis
    const budgetAnalysis = budgets.map(b => {
      const spent = categoryTotals[b.category] || 0
      return {
        ...b,
        spent,
        percent: b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0
      }
    })

    return {
      totalIncome,
      totalExpenses,
      netSavings,
      thisMonth: totalExpenses,
      topCategory: topCategory ? topCategory[0] : '—',
      categoryData,
      budgetAnalysis
    }
  }, [expenses, budgets])

  const value = {
    expenses,
    budgets,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    setCategoryBudget,
    getExpenseById,
    summaries,
    refreshData: fetchData
  }

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
}
