'use client';

import { ReactNode } from 'react';
import Navigation from './Navigation';

interface MainLayoutProps {
  children: ReactNode;
  title?: ReactNode;
  actions?: ReactNode;
}

export default function MainLayout({ children, title, actions }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-[#0a2540] text-white">
      <Navigation />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Mobile top padding */}
        <div className="lg:hidden h-20"></div>
        
        {/* Page header */}
        {(title || actions) && (
          <div className="bg-[#0b2b57] border-b border-slate-700 px-6 py-4">
            <div className="flex items-center justify-between">
              {title && (
                <div className="text-2xl font-semibold text-white">{title}</div>
              )}
              {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
          </div>
        )}
        
        {/* Page content */}
        <main className="flex-1 overflow-auto p-6 text-slate-100 bg-[#0a2540]">
          {children}
        </main>
      </div>
    </div>
  );
}
