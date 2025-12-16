import React, { useState, useEffect } from 'react';
import { Expense, PaymentMethod } from '../types';
import { PAYMENT_METHODS } from '../constants';
import { Save, X, ExternalLink, Trash2 } from 'lucide-react';

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  onSave: (updatedExpense: Expense) => void;
  onDelete?: (id: string) => void;
  businessUnits: string[];
  categories: string[];
}

const EditExpenseModal: React.FC<EditExpenseModalProps> = ({ 
  isOpen, 
  onClose, 
  expense, 
  onSave,
  onDelete,
  businessUnits, 
  categories 
}) => {
  const [formData, setFormData] = useState<Partial<Expense>>({});

  useEffect(() => {
    if (expense) {
      setFormData({ ...expense });
    }
  }, [expense]);

  if (!isOpen || !expense) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData as Expense);
    }
  };
  
  const handleDelete = () => {
    if (onDelete && expense) {
        onDelete(expense.id);
    }
  };

  const hasReceipt = expense.receiptBase64 || expense.receiptUrl;
  const receiptSrc = expense.receiptBase64 
    ? (expense.receiptBase64.startsWith('data:') ? expense.receiptBase64 : `data:image/jpeg;base64,${expense.receiptBase64}`)
    : expense.receiptUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`bg-white rounded-xl shadow-xl w-full max-h-[90vh] overflow-hidden flex flex-col ${hasReceipt ? 'max-w-5xl' : 'max-w-2xl'}`}>
        
        {/* Header */}
        <div className="bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10 shrink-0">
          <h2 className="text-lg font-bold text-gray-800">Edit Expense</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          
          {/* Left: Receipt Preview (if available) */}
          {hasReceipt && (
            <div className="md:w-1/2 bg-gray-900 flex flex-col items-center justify-center p-4 relative overflow-y-auto min-h-[300px] md:min-h-0">
               <img 
                 src={receiptSrc} 
                 alt="Receipt" 
                 className="max-w-full max-h-full object-contain rounded shadow-lg" 
               />
               <a 
                 href={receiptSrc} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 backdrop-blur-md"
                 title="Open Full Image"
               >
                 <ExternalLink className="w-4 h-4" />
               </a>
            </div>
          )}

          {/* Right: Form */}
          <div className={`p-6 overflow-y-auto ${hasReceipt ? 'md:w-1/2' : 'w-full'}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Total Amount (₹)</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount || ''}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary/20 shadow-sm p-2.5 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date || ''}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary/20 shadow-sm p-2.5"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Merchant / Payee</label>
                <input
                  type="text"
                  name="merchant"
                  value={formData.merchant || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary/20 shadow-sm p-2.5"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Business Unit</label>
                  <select
                    name="businessUnit"
                    value={formData.businessUnit || ''}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary/20 shadow-sm p-2.5 bg-white"
                  >
                    {businessUnits.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category || ''}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary/20 shadow-sm p-2.5 bg-white"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Payment Method</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary/20 shadow-sm p-2.5 bg-white"
                >
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">UTR / Reference No.</label>
                <input
                    type="text"
                    name="referenceNumber"
                    value={formData.referenceNumber || ''}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary/20 shadow-sm p-2.5"
                    placeholder="e.g. 3298XXXX1234"
                />
             </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary/20 shadow-sm p-2.5"
                />
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex gap-3 mt-4">
                 {onDelete && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="px-4 py-2 border border-red-200 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 flex items-center justify-center gap-2"
                        title="Delete this expense"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                 )}
                 <div className="flex-1 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 bg-primary text-white py-2 rounded-lg font-bold shadow-lg shadow-primary/30 hover:bg-teal-800 flex items-center justify-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Save Changes
                    </button>
                 </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditExpenseModal;