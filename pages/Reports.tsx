import React, { useState, useMemo } from 'react';
import { Expense, ExpenseStatus } from '../types';
import { Download, Filter, Search, CheckSquare, Square, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface ReportsProps {
  expenses: Expense[];
  businessUnits: string[];
  onBulkStatusChange: (ids: string[], status: ExpenseStatus) => void;
  onBulkDelete: (ids: string[]) => void;
}

const Reports: React.FC<ReportsProps> = ({ expenses, businessUnits, onBulkStatusChange, onBulkDelete }) => {
  const [selectedBusiness, setSelectedBusiness] = useState<string>('All');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Extract unique months for filter
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    expenses.forEach(e => months.add(e.date.substring(0, 7))); // YYYY-MM
    return Array.from(months).sort().reverse();
  }, [expenses]);

  // Filter Data
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchBusiness = selectedBusiness === 'All' || expense.businessUnit === selectedBusiness;
      const matchMonth = selectedMonth === 'All' || expense.date.startsWith(selectedMonth);
      return matchBusiness && matchMonth;
    });
  }, [expenses, selectedBusiness, selectedMonth]);

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Clear selection when filters change to avoid actions on hidden items
  React.useEffect(() => {
    setSelectedIds(new Set());
  }, [selectedBusiness, selectedMonth]);

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredExpenses.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredExpenses.map(e => e.id)));
    }
  };

  const executeBulkAction = (action: 'approve' | 'reject' | 'delete') => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    if (action === 'delete') {
      if (confirm(`Are you sure you want to delete ${ids.length} expenses? This cannot be undone.`)) {
        onBulkDelete(ids);
        setSelectedIds(new Set());
      }
    } else {
      const status = action === 'approve' ? ExpenseStatus.APPROVED : ExpenseStatus.REJECTED;
      onBulkStatusChange(ids, status);
      setSelectedIds(new Set());
    }
  };

  // CSV Export
  const downloadCSV = () => {
    const headers = ["ID", "Date", "Merchant", "Business Unit", "Category", "Amount", "Status", "Payment Method", "Description", "Submitted By"];
    const rows = filteredExpenses.map(e => [
      e.id,
      e.date,
      `"${e.merchant.replace(/"/g, '""')}"`, // Escape quotes
      `"${e.businessUnit}"`,
      e.category,
      e.amount,
      e.status,
      e.paymentMethod,
      `"${e.description.replace(/"/g, '""')}"`,
      e.submittedBy
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">Expense Reports</h1>
           <p className="text-gray-500 text-sm">View and export financial summaries</p>
        </div>
        <button 
          onClick={downloadCSV}
          className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 shadow-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
         <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Business Unit</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select 
                value={selectedBusiness}
                onChange={(e) => setSelectedBusiness(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border-gray-300 focus:border-primary focus:ring-primary/20 bg-gray-50"
              >
                <option value="All">All Businesses</option>
                {businessUnits.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
         </div>
         <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Month</label>
             <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border-gray-300 focus:border-primary focus:ring-primary/20 bg-gray-50"
              >
                <option value="All">All Time</option>
                {availableMonths.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
         </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-xl p-6 text-white shadow-lg flex justify-between items-center">
         <div>
           <p className="text-teal-200 text-sm font-medium">Total for Period</p>
           <p className="text-3xl font-bold mt-1">₹ {totalAmount.toLocaleString('en-IN')}</p>
         </div>
         <div className="text-right">
           <p className="text-teal-200 text-sm font-medium">Entries</p>
           <p className="text-xl font-bold mt-1">{filteredExpenses.length}</p>
         </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 w-10">
                   <button 
                    onClick={handleSelectAll} 
                    className="text-gray-500 hover:text-primary transition-colors"
                   >
                     {selectedIds.size > 0 && selectedIds.size === filteredExpenses.length ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5" />}
                   </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => (
                  <tr 
                    key={expense.id} 
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedIds.has(expense.id) ? 'bg-teal-50/50' : ''}`}
                    onClick={() => toggleSelection(expense.id)}
                  >
                    <td className="px-4 py-4 w-10">
                       <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedIds.has(expense.id) ? 'bg-primary border-primary' : 'border-gray-300 bg-white'}`}>
                          {selectedIds.has(expense.id) && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                       </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.merchant}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.businessUnit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{expense.category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">₹{expense.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${expense.status === ExpenseStatus.APPROVED ? 'bg-green-100 text-green-800' : 
                          expense.status === ExpenseStatus.PENDING_REVIEW ? 'bg-amber-100 text-amber-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {expense.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No expenses found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

       {/* Floating Action Bar */}
       {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200 p-2 flex gap-2 z-50">
          <button 
            onClick={() => executeBulkAction('approve')}
            className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium flex flex-col items-center justify-center text-xs gap-1 hover:bg-green-700 active:scale-95 transition-all"
          >
            <CheckCircle className="w-5 h-5" />
            Approve ({selectedIds.size})
          </button>
           <button 
            onClick={() => executeBulkAction('reject')}
            className="flex-1 bg-amber-600 text-white py-3 rounded-xl font-medium flex flex-col items-center justify-center text-xs gap-1 hover:bg-amber-700 active:scale-95 transition-all"
          >
            <XCircle className="w-5 h-5" />
            Reject ({selectedIds.size})
          </button>
          <button 
            onClick={() => executeBulkAction('delete')}
            className="w-16 bg-red-100 text-red-600 rounded-xl font-medium flex flex-col items-center justify-center text-xs gap-1 hover:bg-red-200 active:scale-95 transition-all"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

// Helper Icon
const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);

export default Reports;