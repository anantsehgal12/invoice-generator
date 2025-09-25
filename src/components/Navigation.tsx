'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  Home, 
  Building2, 
  Package, 
  FileText, 
  PlusCircle, 
  Settings,
  Menu,
  X,
  Receipt
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Companies', href: '/companies', icon: Building2 },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Create Invoice', href: '/invoices/create', icon: PlusCircle },
  { name: 'Create Proforma', href: '/invoices/create/proforma', icon: PlusCircle },
];

export default function Navigation() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 z-50 w-full bg-[#0b2b57] border-b border-slate-700 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">Invoice Generator</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm font-medium text-red-300 hover:text-red-200"
            >
              Logout
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700/50"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-60 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-[#0b2b57] border-r border-slate-700 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full text-white">
          {/* Logo */}
          <div className="flex items-center gap-2 p-6 border-b border-slate-700">
            <Receipt className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">Invoice Generator</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${
                      isActive
                        ? 'bg-blue-900/40 text-white border-r-2 border-blue-400'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }
                  `}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700 space-y-3">
            <Link
              href="/settings"
              className="group flex items-center px-3 py-2 text-sm font-medium text-slate-300 rounded-md hover:bg-slate-800 hover:text-white"
            >
              <Settings className="mr-3 h-5 w-5 text-slate-400 group-hover:text-white" />
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="group flex items-center px-3 py-2 text-sm font-medium text-red-300 rounded-md hover:bg-red-900/30 hover:text-red-200 w-full text-left"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
