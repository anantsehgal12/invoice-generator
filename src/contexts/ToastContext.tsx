'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react'

export type Toast = { id: string; type: 'success' | 'error' | 'info'; message: string }

type ToastContextValue = {
  addToast: (t: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, ...t }])
    setTimeout(() => removeToast(id), 4000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 9999 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            marginBottom: 8,
            padding: '10px 14px',
            minWidth: 260,
            borderRadius: 8,
            color: t.type === 'error' ? '#991b1b' : t.type === 'success' ? '#065f46' : '#1f2937',
            background: t.type === 'error' ? '#fee2e2' : t.type === 'success' ? '#d1fae5' : '#e5e7eb',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
