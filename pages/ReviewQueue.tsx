import React, { useState } from 'react';
import { Expense, ExpenseStatus } from '../types';
import ExpenseCard from '../components/ExpenseCard';
import { CheckSquare, Square, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface ReviewQueueProps {
  expenses: Expense[];
  onStatusChange: (id: string, status: ExpenseStatus) => void;
  onEdit: (expense: Expense) => void;
  onBulkStatusChange: (ids: string[], status: ExpenseStatus) => void;
  onBulkDelete: (ids: string[]) => void;
}

const ReviewQueue: React.FC<ReviewQueueProps> = ({ expenses, onStatusChange, onEdit, onBulkStatusChange, onBulkDelete }) => {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const pendingExpenses = expenses.filter(e => e.status === ExpenseStatus.PENDING_REVIEW);

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
    if (selectedIds.size === pendingExpenses.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingExpenses.map(e => e.id)));
    }
  };

  const executeBulkAction = (action: 'approve' | 'reject' | 'delete') => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    if (action === 'delete') {
      if (confirm(`Are you sure you want to delete ${ids.length} expenses? This cannot be undone.`)) {
        onBulkDelete(ids);
        setSelectedIds(new Set());
        setIsSelectMode(false);
      }
    } else {
      const status = action === 'approve' ? ExpenseStatus.APPROVED : ExpenseStatus.REJECTED;
      onBulkStatusChange(ids, status);
      setSelectedIds(new Set());
      setIsSelectMode(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24"> 
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">Review Queue</h1>
           <span className="text-sm text-gray-500">{pendingExpenses.length} pending items</span>
        </div>
        <div className="flex gap-2">
           {pendingExpenses.length > 0 && (
             <button 
               onClick={() => {
                 setIsSelectMode(!isSelectMode);
                 setSelectedIds(new Set());
               }}
               className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isSelectMode ? 'bg-gray-200 text-gray-800' : 'bg-white text-primary border border-primary'}`}
             >
               {isSelectMode ? 'Cancel Selection' : 'Select Items'}
             </button>
           )}
        </div>
      </div>

      {isSelectMode && (
        <div className="bg-blue-50 p-3 rounded-lg flex items-center justify-between mb-4 border border-blue-100">
          <button onClick={handleSelectAll} className="flex items-center gap-2 text-sm font-medium text-blue-800">
            {selectedIds.size === pendingExpenses.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            Select All
          </button>
          <span className="text-sm text-blue-800 font-bold">{selectedIds.size} selected</span>
        </div>
      )}

      <div className="space-y-4">
        {pendingExpenses.map(e => (
          <ExpenseCard 
            key={e.id} 
            expense={e} 
            onStatusChange={onStatusChange} 
            onEdit={onEdit}
            isSelectMode={isSelectMode}
            isSelected={selectedIds.has(e.id)}
            onToggleSelect={toggleSelection}
          />
        ))}
        {pendingExpenses.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">No pending expenses. All caught up!</p>
          </div>
        )}
      </div>

      {/* Floating Action Bar */}
      {isSelectMode && selectedIds.size > 0 && (
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
export default ReviewQueue;
