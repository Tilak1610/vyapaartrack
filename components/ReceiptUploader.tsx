import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, Save, HelpCircle } from 'lucide-react';
import { fileToGenerativePart, analyzeReceiptImage, ReceiptAnalysisResult } from '../services/geminiService';
import { Expense, ExpenseStatus, PaymentMethod } from '../types';
import { PAYMENT_METHODS } from '../constants';
import { v4 as uuidv4 } from 'uuid';

interface ReceiptUploaderProps {
  onSave: (expense: Expense) => void;
  categories: string[];
  businessUnits: string[];
  currentUser: { name: string; id: string };
}

const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({ onSave, categories, businessUnits, currentUser }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Expense>>({
    date: new Date().toISOString().split('T')[0],
    businessUnit: businessUnits[0],
    category: categories[0],
    paymentMethod: PaymentMethod.UPI,
    status: ExpenseStatus.PENDING_REVIEW,
    amount: 0,
    merchant: '',
    description: '',
    referenceNumber: '',
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalysisError(null);
    setIsAnalyzing(true);
    
    try {
      // Create local preview
      const base64Data = await fileToGenerativePart(file);
      const fullBase64 = `data:${file.type};base64,${base64Data}`;
      setImagePreview(fullBase64);

      // Call Gemini API with CURRENT categories and businesses
      const result: ReceiptAnalysisResult = await analyzeReceiptImage(base64Data, categories, businessUnits);
      
      // Update form with AI results
      setFormData(prev => ({
        ...prev,
        amount: result.amount || prev.amount,
        date: result.date || prev.date,
        merchant: result.merchant || prev.merchant,
        description: result.description || prev.description,
        category: result.category || prev.category,
        businessUnit: result.businessUnit || prev.businessUnit,
        referenceNumber: result.referenceNumber || prev.referenceNumber,
      }));

    } catch (err) {
      setAnalysisError("Could not auto-scan receipt. Please enter details manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newExpense: Expense = {
      id: uuidv4(),
      submittedBy: currentUser.name,
      submittedById: currentUser.id,
      submittedAt: new Date().toISOString(),
      receiptBase64: imagePreview || undefined,
      ...formData as Expense
    };
    onSave(newExpense);
    // Reset
    setImagePreview(null);
    setFormData({
        date: new Date().toISOString().split('T')[0],
        businessUnit: businessUnits[0],
        category: categories[0],
        paymentMethod: PaymentMethod.UPI,
        status: ExpenseStatus.PENDING_REVIEW,
        amount: 0,
        merchant: '',
        description: '',
        referenceNumber: '',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-xl font-bold text-gray-800">Add New Expense</h2>
         <button onClick={() => setShowHelp(!showHelp)} className="text-gray-400 hover:text-primary transition-colors">
            <HelpCircle className="w-5 h-5" />
         </button>
      </div>

      {showHelp && (
        <div className="mb-6 bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-100">
          <p className="font-bold mb-1">How to upload from WhatsApp?</p>
          <ol className="list-decimal pl-5 space-y-1">
             <li>Open the receipt image in WhatsApp.</li>
             <li>Tap the menu (3 dots) and select <strong>Save</strong>.</li>
             <li>Come back here and tap the upload box below.</li>
             <li>Select the saved image from your gallery.</li>
          </ol>
        </div>
      )}

      {/* Image Upload Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Receipt / Screenshot</label>
        
        {!imagePreview ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors group"
          >
            <Camera className="w-10 h-10 text-gray-400 mb-3 group-hover:text-primary transition-colors" />
            <p className="text-sm text-gray-500 font-medium">Click to snap or upload receipt</p>
            <p className="text-xs text-gray-400 mt-1">Supports WhatsApp screenshots</p>
          </div>
        ) : (
          <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
            <img src={imagePreview} alt="Receipt Preview" className="max-h-64 mx-auto object-contain" />
            <button 
              type="button"
              onClick={() => {
                  setImagePreview(null);
                  setFormData(prev => ({ ...prev, amount: 0, merchant: '', description: '', referenceNumber: '' }));
              }}
              className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm text-red-600 hover:bg-red-50"
            >
              <Upload className="w-4 h-4 rotate-45" /> 
            </button>
            {isAnalyzing && (
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center flex-col text-white">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <span className="text-sm font-medium">Reading Receipt...</span>
               </div>
            )}
          </div>
        )}
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />
        {analysisError && <p className="text-xs text-red-500 mt-2">{analysisError}</p>}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Total Amount (₹)</label>
                <input
                    type="number"
                    name="amount"
                    value={formData.amount || ''}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary/20 shadow-sm p-2.5 text-lg font-bold"
                    placeholder="0.00"
                    required
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Date</label>
                <input
                    type="date"
                    name="date"
                    value={formData.date}
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
                value={formData.merchant}
                onChange={handleInputChange}
                className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary/20 shadow-sm p-2.5"
                placeholder="e.g. Hardware Store, Petrol Pump"
                required
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Business Unit</label>
                <select
                    name="businessUnit"
                    value={formData.businessUnit}
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
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary/20 shadow-sm p-2.5 bg-white"
                >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
        </div>

        <div>
             <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Payment Method</label>
             <div className="flex gap-2 overflow-x-auto pb-2">
                {PAYMENT_METHODS.map(method => (
                    <button
                        key={method}
                        type="button"
                        onClick={() => setFormData(prev => ({...prev, paymentMethod: method}))}
                        className={`
                            px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap border transition-colors
                            ${formData.paymentMethod === method 
                                ? 'bg-primary text-white border-primary' 
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
                        `}
                    >
                        {method}
                    </button>
                ))}
             </div>
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
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Description (Optional)</label>
            <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={2}
                className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary/20 shadow-sm p-2.5"
                placeholder="Details about items purchased..."
            />
        </div>

        <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-primary/30 hover:bg-teal-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
        >
            <Save className="w-5 h-5" />
            Submit Expense
        </button>
      </form>
    </div>
  );
};

export default ReceiptUploader;