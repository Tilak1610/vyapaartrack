import React, { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { NAV_ITEMS, APP_NAME } from '../constants';
import { Menu, LogOut, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
  children: ReactNode;
  user: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const navigate = useNavigate();

  // Filter nav items based on role
  const filteredNav = NAV_ITEMS.filter(item => 
    !user || item.roles.includes(user.role)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-primary text-white p-4 flex justify-between items-center sticky top-0 z-20 shadow-md">
        <h1 className="text-xl font-bold tracking-tight">{APP_NAME}</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out flex flex-col
          md:relative md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100 bg-teal-50 md:bg-white hidden md:flex">
             <span className="text-2xl font-bold text-primary">{APP_NAME}</span>
        </div>

        {/* User Profile (Mobile/Desktop) */}
        {user && (
          <div className="px-6 py-4 bg-teal-50/50 border-b border-gray-100">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                 <UserIcon className="w-5 h-5" />
               </div>
               <div className="flex-1 min-w-0">
                 <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                 <p className="text-xs text-gray-500 capitalize">{user.role} Account</p>
               </div>
             </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
              `}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        
        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 space-y-4">
           {user && (
             <button 
               onClick={onLogout}
               className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
             >
               <LogOut className="w-5 h-5 mr-3" />
               Sign Out
             </button>
           )}

           <div className="bg-green-50 p-3 rounded-lg border border-green-100">
              <p className="text-[10px] text-green-800 font-bold mb-1 uppercase tracking-wide">WhatsApp Integration</p>
              <p className="text-xs text-green-700 font-medium leading-snug mb-1">
                Forward images to:
              </p>
              <p className="text-sm font-bold text-green-800 mb-1 font-mono">+91 98765 43210</p>
              <p className="text-[10px] text-green-600 italic">
                (Demo: Add to contacts)
              </p>
           </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
};

export default Layout;