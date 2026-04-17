import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ExpenseProvider } from './context/ExpenseContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

// Lazy load pages
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ExpenseList = lazy(() => import('./pages/ExpenseList'))
const ExpenseForm = lazy(() => import('./pages/ExpenseForm'))
const MonthlySummary = lazy(() => import('./pages/MonthlySummary'))

// Loading Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
)

export default function App() {
  return (
    <AuthProvider>
      <ExpenseProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/expenses" element={<ExpenseList />} />
              <Route path="/expenses/new" element={<ExpenseForm />} />
              <Route path="/expenses/edit/:id" element={<ExpenseForm />} />
              <Route path="/monthly" element={<MonthlySummary />} />
            </Route>

            {/* Redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </ExpenseProvider>
    </AuthProvider>
  )
}

