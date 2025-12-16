import React, { useState } from 'react';
import { Trash2, Plus, Factory, Tags, MessageCircle, Info } from 'lucide-react';

interface SettingsProps {
  businessUnits: string[];
  categories: string[];
  onUpdateBusinesses: (updated: string[]) => void;
  onUpdateCategories: (updated: string[]) => void;
  onSimulateWhatsapp: () => void;
}

const ListManager: React.FC<{
  title: string;
  icon: React.ElementType;
  items: string[];
  onUpdate: (items: string[]) => void;
}> = ({ title, icon: Icon, items, onUpdate }) => {
  const [newValue, setNewValue] = useState('');

  const handleAdd = () => {
    if (newValue.trim()) {
      onUpdate([...items, newValue.trim()]);
      setNewValue('');
    }
  };

  const handleDelete = (index: number) => {
    if (confirm(`Are you sure you want to remove "${items[index]}"?`)) {
      onUpdate(items.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-gray-800">{title}</h3>
      </div>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder={`Add new ${title.toLowerCase()}...`}
          className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button 
          onClick={handleAdd}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-teal-800"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg group">
            <span className="text-sm font-medium text-gray-700">{item}</span>
            <button 
              onClick={() => handleDelete(idx)}
              className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const Settings: React.FC<SettingsProps> = (props) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">System Configuration</h1>
      <p className="text-gray-600 text-sm">Manage the business units and expense categories available in dropdowns.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ListManager
          title="Business Units"
          icon={Factory}
          items={props.businessUnits}
          onUpdate={props.onUpdateBusinesses}
        />
        <ListManager
          title="Expense Categories"
          icon={Tags}
          items={props.categories}
          onUpdate={props.onUpdateCategories}
        />
      </div>

      {/* Demo Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
        <div className="flex items-center gap-2 mb-4">
           <MessageCircle className="w-5 h-5 text-blue-700" />
           <h3 className="font-bold text-blue-800">Developer Demo Tools</h3>
        </div>
        <p className="text-sm text-blue-700 mb-4">
           Since the WhatsApp bot integration requires a backend server, you can use this button to simulate an incoming receipt forwarding event.
        </p>
        <button 
          onClick={props.onSimulateWhatsapp}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
           <MessageCircle className="w-4 h-4" />
           Simulate Incoming WhatsApp Receipt
        </button>
      </div>
    </div>
  );
};

export default Settings;