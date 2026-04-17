import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.email || !form.password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const result = await login(form.email, form.password)
      if (result.success) {
        navigate('/dashboard')
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Connection failed. Please check if the server is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <header className="auth-logo">
          <motion.h1 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            ExpenseFlow
          </motion.h1>
          <p>Precision personal finance tracking</p>
        </header>

        <motion.div 
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2>Welcome Back</h2>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 p-3 rounded-lg mb-6 bg-danger-bg border border-danger/30 text-danger text-sm"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label htmlFor="login-email" className="flex items-center gap-2">
                <Mail size={16} /> Email Address
              </label>
              <input
                id="login-email"
                type="email"
                name="email"
                className="form-control"
                placeholder="you@example.com"
                required
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password" className="flex items-center gap-2">
                <Lock size={16} /> Password
              </label>
              <input
                id="login-password"
                type="password"
                name="password"
                className="form-control"
                placeholder="••••••••"
                required
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block btn-lg mt-6"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing In...
                </div>
              ) : (
                <><LogIn size={20} /> Sign In</>
              )}
            </button>
          </form>

          <footer className="auth-footer">
            New here? <Link to="/register">Create an account</Link>
          </footer>
        </motion.div>
      </div>
    </div>
  )
}
