import React from 'react';
import { Expense, ExpenseStatus } from '../types';
import { IndianRupee, Clock, TrendingUp, AlertCircle } from 'lucide-react';

interface StatsCardsProps {
  expenses: Expense[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ expenses }) => {
  const totalSpent = expenses
    .filter(e => e.status === ExpenseStatus.APPROVED)
    .reduce((sum, e) => sum + e.amount, 0);

  const pendingAmount = expenses
    .filter(e => e.status === ExpenseStatus.PENDING_REVIEW)
    .reduce((sum, e) => sum + e.amount, 0);

  const pendingCount = expenses.filter(e => e.status === ExpenseStatus.PENDING_REVIEW).length;
  
  // Basic heuristic: average daily spend based on approved expenses
  const approvedCount = expenses.filter(e => e.status === ExpenseStatus.APPROVED).length;
  const avgTicketSize = approvedCount > 0 ? totalSpent / approvedCount : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">Total Approved</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">₹ {totalSpent.toLocaleString('en-IN')}</p>
        </div>
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
          <IndianRupee className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">Pending Review</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">₹ {pendingAmount.toLocaleString('en-IN')}</p>
          <p className="text-xs text-amber-600/80 mt-1">{pendingCount} requests waiting</p>
        </div>
        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
          <Clock className="w-5 h-5" />
        </div>
      </div>

       <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">Avg. Ticket Size</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">₹ {Math.round(avgTicketSize).toLocaleString('en-IN')}</p>
        </div>
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary to-teal-800 p-5 rounded-xl shadow-sm text-white flex items-center justify-between relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-teal-100 text-sm font-medium">System Status</p>
          <p className="text-lg font-bold mt-1">WhatsApp Active</p>
          <p className="text-xs text-teal-200 mt-1">Listening for receipts...</p>
        </div>
         <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white relative z-10">
          <AlertCircle className="w-5 h-5" />
        </div>
        {/* Decor */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full"></div>
      </div>

    </div>
  );
};

export default StatsCards;