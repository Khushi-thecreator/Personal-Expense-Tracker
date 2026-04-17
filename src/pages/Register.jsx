import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Lock, UserPlus, AlertCircle, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const result = await register(form.name, form.email, form.password)
      if (result.success) {
        navigate('/login')
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Server unreachable. Please check if the backend is running.')
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
          <p>Join thousands managing their wealth</p>
        </header>

        <motion.div 
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2>Create Account</h2>

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
              <label htmlFor="reg-name" className="flex items-center gap-2">
                <User size={16} /> Full Name
              </label>
              <input
                id="reg-name"
                type="text"
                name="name"
                className="form-control"
                placeholder="Jane Doe"
                required
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-email" className="flex items-center gap-2">
                <Mail size={16} /> Email Address
              </label>
              <input
                id="reg-email"
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
              <label htmlFor="reg-password" className="flex items-center gap-2">
                <Lock size={16} /> Password
              </label>
              <input
                id="reg-password"
                type="password"
                name="password"
                className="form-control"
                placeholder="min. 6 characters"
                required
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-confirm" className="flex items-center gap-2">
                <ShieldCheck size={16} /> Confirm Password
              </label>
              <input
                id="reg-confirm"
                type="password"
                name="confirmPassword"
                className="form-control"
                placeholder="re-enter password"
                required
                value={form.confirmPassword}
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
                  Creating Account...
                </div>
              ) : (
                <><UserPlus size={20} /> Register</>
              )}
            </button>
          </form>

          <footer className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </footer>
        </motion.div>
      </div>
    </div>
  )
}
