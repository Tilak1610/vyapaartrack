import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import { loadData, saveData } from './services/storage';
import { Expense, ExpenseStatus, User, AppData, PaymentMethod } from './types';
import { MOCK_USERS } from './constants';
import StatsCards from './components/StatsCards';
import ExpenseCard from './components/ExpenseCard';
import ReceiptUploader from './components/ReceiptUploader';
import EditExpenseModal from './components/EditExpenseModal';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import ReviewQueue from './pages/ReviewQueue';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Lock } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Login Component
const LoginScreen: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-primary rounded-xl mx-auto flex items-center justify-center mb-4">
             <Lock className="w-8 h-8 text-white" />
           </div>
           <h1 className="text-2xl font-bold text-gray-900">VyapaarTrack Login</h1>
           <p className="text-gray-500 mt-2">Select your role to continue</p>
        </div>
        
        <div className="space-y-3">
          {MOCK_USERS.map(user => (
            <button
              key={user.id}
              onClick={() => onLogin(user as User)}
              className="w-full flex items-center p-4 border border-gray-200 rounded-xl hover:border-primary hover:bg-teal-50 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-white flex items-center justify-center text-gray-600 font-bold mr-4">
                {user.name.charAt(0)}
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 uppercase">{user.role}</p>
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-center text-gray-400 mt-8">
          Note: This is a demo login. No password required.
        </p>
      </div>
    </div>
  );
};

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ user: User | null, allowedRoles?: string[], children: React.ReactElement }> = ({ user, allowedRoles, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div className="p-8 text-center text-red-600">Access Denied: You do not have permission to view this page.</div>;
  }
  return children;
};

const App: React.FC = () => {
  const [data, setData] = useState<AppData | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Load data on mount
  useEffect(() => {
    const loaded = loadData();
    setData(loaded);
    
    // Check for existing session (simplified)
    const savedUser = localStorage.getItem('vt_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  // Save data on change
  useEffect(() => {
    if (data) {
      saveData(data);
    }
  }, [data]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('vt_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('vt_user');
  };

  const addExpense = (newExpense: Expense) => {
    if (!data) return;
    setData(prev => prev ? { ...prev, expenses: [newExpense, ...prev.expenses] } : null);
    alert("Expense submitted successfully!");
  };

  const updateStatus = (id: string, status: ExpenseStatus) => {
    if (!data) return;
    setData(prev => prev ? {
      ...prev,
      expenses: prev.expenses.map(e => e.id === id ? { ...e, status } : e)
    } : null);
  };

  const handleBulkStatusChange = (ids: string[], status: ExpenseStatus) => {
    if (!data) return;
    const idSet = new Set(ids);
    setData(prev => prev ? {
      ...prev,
      expenses: prev.expenses.map(e => idSet.has(e.id) ? { ...e, status } : e)
    } : null);
  };

  const handleBulkDelete = (ids: string[]) => {
    if (!data) return;
    const idSet = new Set(ids);
    setData(prev => prev ? {
      ...prev,
      expenses: prev.expenses.filter(e => !idSet.has(e.id))
    } : null);
  };

  const handleSingleDelete = (id: string) => {
      if (!data) return;
      if (confirm("Are you sure you want to delete this expense?")) {
        setData(prev => prev ? {
            ...prev,
            expenses: prev.expenses.filter(e => e.id !== id)
        } : null);
        setEditingExpense(null);
      }
  };

  const handleSaveEdit = (updatedExpense: Expense) => {
    if (!data) return;
    setData(prev => prev ? {
      ...prev,
      expenses: prev.expenses.map(e => e.id === updatedExpense.id ? updatedExpense : e)
    } : null);
    setEditingExpense(null);
  };

  const updateBusinessUnits = (units: string[]) => {
     if (!data) return;
     setData(prev => prev ? { ...prev, businessUnits: units } : null);
  };

  const updateCategories = (cats: string[]) => {
     if (!data) return;
     setData(prev => prev ? { ...prev, categories: cats } : null);
  };

  // Demo Feature: Simulate incoming WhatsApp message
  const handleSimulateWhatsApp = () => {
    if (!data) return;
    const mockExpense: Expense = {
      id: uuidv4(),
      date: new Date().toISOString().split('T')[0],
      amount: Math.floor(Math.random() * 5000) + 100,
      merchant: 'Whatsapp Forwarded Store',
      businessUnit: data.businessUnits[0],
      category: 'Materials',
      paymentMethod: PaymentMethod.UPI,
      description: 'Auto-forwarded from +91 98*** ***10',
      status: ExpenseStatus.PENDING_REVIEW,
      submittedBy: 'WhatsApp Bot',
      submittedById: 'bot',
      submittedAt: new Date().toISOString(),
      // Use a placeholder image to represent a WhatsApp screenshot
      receiptUrl: 'https://placehold.co/400x600/e2e8f0/475569?text=WhatsApp+Screenshot', 
    };
    setData(prev => prev ? { ...prev, expenses: [mockExpense, ...prev.expenses] } : null);
    alert("Simulated: New WhatsApp expense added to Review Queue!");
  };

  if (!data) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  // Derived Data
  const expensesByBusiness = data.expenses
    .filter(e => e.status === ExpenseStatus.APPROVED)
    .reduce((acc, curr) => {
      acc[curr.businessUnit] = (acc[curr.businessUnit] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);
  
  const chartData = Object.keys(expensesByBusiness).map(key => ({ name: key, value: expensesByBusiness[key] }));
  const COLORS = ['#0f766e', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#6366f1'];

  return (
    <Router>
      {!currentUser ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <Layout user={currentUser} onLogout={handleLogout}>
          <Routes>
            {/* Dashboard: Admin Only */}
            <Route path="/" element={
              <ProtectedRoute user={currentUser} allowedRoles={['admin']}>
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                  <StatsCards expenses={data.expenses} />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                       <h3 className="font-semibold text-gray-700 mb-4">Recent Activity</h3>
                       <div className="space-y-2">
                         {data.expenses.slice(0, 4).map(e => (
                           <ExpenseCard 
                              key={e.id} 
                              expense={e} 
                              onEdit={setEditingExpense}
                           />
                         ))}
                       </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                      <h3 className="font-semibold text-gray-700 mb-4">Approved Spending by Business</h3>
                      <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
                             <XAxis type="number" hide />
                             <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 10}} />
                             <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                             <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                             </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            } />

            {/* Review Queue: Admin Only */}
            <Route path="/review" element={
              <ProtectedRoute user={currentUser} allowedRoles={['admin']}>
                <ReviewQueue 
                   expenses={data.expenses}
                   onStatusChange={updateStatus}
                   onEdit={setEditingExpense}
                   onBulkStatusChange={handleBulkStatusChange}
                   onBulkDelete={handleBulkDelete}
                />
              </ProtectedRoute>
            } />

            {/* Add Expense: Staff & Admin */}
            <Route path="/add" element={
              <div className="max-w-3xl mx-auto">
                 <ReceiptUploader 
                    onSave={addExpense} 
                    categories={data.categories}
                    businessUnits={data.businessUnits}
                    currentUser={currentUser}
                 />
              </div>
            } />
            
            {/* Settings: Admin Only */}
            <Route path="/settings" element={
              <ProtectedRoute user={currentUser} allowedRoles={['admin']}>
                <Settings 
                  businessUnits={data.businessUnits}
                  categories={data.categories}
                  onUpdateBusinesses={updateBusinessUnits}
                  onUpdateCategories={updateCategories}
                  onSimulateWhatsapp={handleSimulateWhatsApp}
                />
              </ProtectedRoute>
            } />

            {/* Reports: Admin Only */}
            <Route path="/reports" element={
              <ProtectedRoute user={currentUser} allowedRoles={['admin']}>
                <Reports 
                  expenses={data.expenses} 
                  businessUnits={data.businessUnits} 
                  onBulkStatusChange={handleBulkStatusChange}
                  onBulkDelete={handleBulkDelete}
                />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to={currentUser.role === 'admin' ? "/" : "/add"} replace />} />
          </Routes>
          
          <EditExpenseModal 
            isOpen={!!editingExpense}
            expense={editingExpense}
            onClose={() => setEditingExpense(null)}
            onSave={handleSaveEdit}
            onDelete={handleSingleDelete}
            businessUnits={data.businessUnits}
            categories={data.categories}
          />
        </Layout>
      )}
    </Router>
  );
};

export default App;