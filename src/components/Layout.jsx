import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Receipt, 
  PlusCircle, 
  Calendar, 
  LogOut, 
  Menu, 
  X,
  CreditCard
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isFormPage = location.pathname.includes('/expenses/new') || location.pathname.includes('/expenses/edit')

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const initials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/expenses', label: 'Expenses', icon: Receipt, end: true },
    { to: '/expenses/new', label: 'Add Expense', icon: PlusCircle },
    { to: '/monthly', label: 'Monthly Summary', icon: Calendar },
  ]

  return (
    <div className="app-layout">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button className="hamburger" onClick={() => setSidebarOpen(true)}>
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2 overflow-hidden">
          <CreditCard className="text-secondary flex-shrink-0" size={24} />
          <h1 className="truncate">ExpenseFlow</h1>
        </div>
      </header>

      {/* Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="sidebar-overlay open"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="icon-container bg-accent-glow rounded-lg">
            <CreditCard className="text-accent-light" size={24} />
          </div>
          <div className="overflow-hidden">
            <h1>ExpenseFlow</h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Personal Finance</span>
          </div>
          <button className="lg:hidden" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', marginLeft: 'auto' }} onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} className="icon" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{currentUser?.name}</div>
              <div className="user-email">{currentUser?.email}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-block btn-sm" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="main-content">
        <div className="page-wrapper">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Universal Floating Action Button */}
      <AnimatePresence>
        {!isFormPage && (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 180 }}
            whileHover={{ 
              scale: 1.1, 
              rotate: 90, 
              boxShadow: '0 0 30px rgba(99, 102, 241, 0.6)'
            }}
            whileTap={{ scale: 0.9 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20
            }}
            style={{ 
              position: 'fixed', 
              bottom: '2.5rem', 
              right: '2.5rem', 
              zIndex: 300 
            }}
          >
            <Link 
              to="/expenses/new" 
              className="fab-btn" 
              title="Add New Expense"
              style={{ margin: 0 }} // Reset any margin
            >
              <PlusCircle size={32} strokeWidth={2.5} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
