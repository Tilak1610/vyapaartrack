import React from 'react';
import { Expense, ExpenseStatus } from '../types';
import { Calendar, Tag, Building2, CheckCircle2, Clock, XCircle, IndianRupee, Pencil, Image as ImageIcon } from 'lucide-react';

interface ExpenseCardProps {
  expense: Expense;
  onStatusChange?: (id: string, newStatus: ExpenseStatus) => void;
  onEdit?: (expense: Expense) => void;
  onClick?: () => void;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

const statusColors = {
  [ExpenseStatus.APPROVED]: 'text-green-600 bg-green-50 border-green-200',
  [ExpenseStatus.PENDING_REVIEW]: 'text-amber-600 bg-amber-50 border-amber-200',
  [ExpenseStatus.REJECTED]: 'text-red-600 bg-red-50 border-red-200',
};

const statusIcons = {
  [ExpenseStatus.APPROVED]: CheckCircle2,
  [ExpenseStatus.PENDING_REVIEW]: Clock,
  [ExpenseStatus.REJECTED]: XCircle,
};

const ExpenseCard: React.FC<ExpenseCardProps> = ({ 
  expense, 
  onStatusChange, 
  onEdit, 
  onClick,
  isSelectMode = false,
  isSelected = false,
  onToggleSelect
}) => {
  const StatusIcon = statusIcons[expense.status];
  
  const receiptSrc = React.useMemo(() => {
    if (expense.receiptBase64) {
       // Check if it already has the data prefix, if not assume jpeg
       return expense.receiptBase64.startsWith('data:') 
         ? expense.receiptBase64 
         : `data:image/jpeg;base64,${expense.receiptBase64}`;
    }
    return expense.receiptUrl;
  }, [expense.receiptBase64, expense.receiptUrl]);

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-3 transition-all hover:shadow-md cursor-pointer relative overflow-hidden flex gap-3 ${isSelected ? 'ring-2 ring-primary bg-teal-50/30' : ''}`}
      onClick={() => {
        if (isSelectMode && onToggleSelect) {
          onToggleSelect(expense.id);
        } else if (onClick) {
          onClick();
        }
      }}
    >
      {/* Selection Checkbox Area */}
      {isSelectMode && (
        <div className="flex items-center justify-center shrink-0 pl-1">
          <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-gray-300 bg-white'}`}>
             {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 line-clamp-1">{expense.merchant}</h3>
            <p className="text-xs text-gray-500 line-clamp-1">{expense.description}</p>
          </div>
          <div className="flex flex-col items-end">
             <span className="font-bold text-lg text-gray-800 flex items-center">
              <IndianRupee className="w-4 h-4 mr-0.5" />
              {expense.amount.toLocaleString('en-IN')}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 font-medium mt-1 ${statusColors[expense.status]}`}>
              <StatusIcon className="w-3 h-3" />
              {expense.status}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-end mt-3">
          <div className="flex flex-wrap gap-2 text-xs text-gray-600">
            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
              <Calendar className="w-3 h-3" />
              {expense.date}
            </div>
            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
              <Building2 className="w-3 h-3" />
              {expense.businessUnit}
            </div>
            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
              <Tag className="w-3 h-3" />
              {expense.category}
            </div>
          </div>

          {!isSelectMode && onEdit && (
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(expense); }}
              className="ml-2 p-1.5 text-gray-400 hover:text-primary hover:bg-teal-50 rounded-full transition-colors"
              title="Edit Expense"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {receiptSrc && (
          <div className="mt-3 flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-100 group-hover:border-gray-200 transition-colors">
             <div className="h-10 w-10 shrink-0 rounded overflow-hidden bg-gray-200 border border-gray-200 relative">
               <img src={receiptSrc} alt="Receipt" className="h-full w-full object-cover" />
             </div>
             <div className="flex flex-col">
               <span className="text-xs font-medium text-gray-700 flex items-center gap-1">
                 <ImageIcon className="w-3 h-3 text-gray-500" /> Receipt Attached
               </span>
               <span className="text-[10px] text-gray-400">Click to view full image</span>
             </div>
          </div>
        )}

        {/* Action Buttons: Hide in select mode */}
        {!isSelectMode && expense.status === ExpenseStatus.PENDING_REVIEW && onStatusChange && (
          <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => onStatusChange(expense.id, ExpenseStatus.APPROVED)}
              className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-800 transition-colors"
            >
              Approve
            </button>
            <button 
               onClick={() => onStatusChange(expense.id, ExpenseStatus.REJECTED)}
               className="flex-1 bg-white border border-red-200 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseCard;