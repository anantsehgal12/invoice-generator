'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  Company, 
  Product, 
  Invoice, 
  AppContextType,
  AppSettings
} from '@/types';
import { getSettings, saveSettings } from '@/utils/storage';
import { useToast } from '@/contexts/ToastContext';
import { formatCurrency, formatDate, calculateTax } from '@/utils/formatters';

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [settings, setSettings] = useState<AppSettings>(() => getSettings());
  const [isLoaded, setIsLoaded] = useState(false);
  const { addToast } = useToast();

  // Helpers
  const parseCompany = (c: any): Company => ({
    id: c.id,
    name: c.name,
    logo: c.logo || undefined,
    gst: c.gst,
    pan: c.pan || undefined,
    address: { street: c.street, city: c.city, state: c.state, pincode: c.pincode, country: c.country },
    mobile: c.mobile,
    email: c.email || undefined,
    website: c.website || undefined,
    bankDetails: c.bankName || c.accountNumber || c.ifscCode || c.accountHolderName ? {
      bankName: c.bankName || '', accountNumber: c.accountNumber || '', ifscCode: c.ifscCode || '', accountHolderName: c.accountHolderName || ''
    } : undefined,
    createdAt: new Date(c.createdAt),
    updatedAt: new Date(c.updatedAt),
  });

  const parseProduct = (p: any): Product => ({
    id: p.id,
    name: p.name,
    description: p.description || undefined,
    hsnCode: p.hsnCode || undefined,
    price: p.price,
    taxRate: p.taxRate,
    unit: p.unit,
    category: p.category || undefined,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
  });

  const parseInvoice = (inv: any): Invoice => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    companyId: inv.companyId,
    billTo: {
      name: inv.billToName,
      gst: inv.billToGst || undefined,
      address: { street: inv.billToStreet, city: inv.billToCity, state: inv.billToState, pincode: inv.billToPincode, country: inv.billToCountry },
      mobile: inv.billToMobile || undefined,
      email: inv.billToEmail || undefined,
    },
    invoiceDate: new Date(inv.invoiceDate),
    dueDate: new Date(inv.dueDate),
    placeOfSupply: inv.placeOfSupply,
    items: (inv.items || []).map((it: any) => ({
      productId: it.productId || '',
      productName: it.productName,
      description: it.description || undefined,
      hsnCode: it.hsnCode || undefined,
      quantity: it.quantity,
      unit: it.unit,
      rate: it.rate,
      taxRate: it.taxRate,
      taxAmount: it.taxAmount,
      amount: it.amount,
      totalAmount: it.totalAmount,
    })),
    subtotal: inv.subtotal,
    totalTax: inv.totalTax,
    discount: inv.discount || 0,
    discountType: inv.discountType || 'amount',
    additionalCharges: (inv.additionalCharges || []).map((ac: any) => ({ name: ac.name, amount: ac.amount })),
    total: inv.total,
    amountPaid: inv.amountPaid || 0,
    payments: (inv.payments || []).map((p: any) => ({ amount: p.amount, date: new Date(p.date), method: p.method || undefined, note: p.note || undefined })),
    notes: inv.notes || undefined,
    terms: inv.terms || undefined,
    status: inv.status,
    type: inv.type || 'invoice',
    createdAt: new Date(inv.createdAt),
    updatedAt: new Date(inv.updatedAt),
  });

  // Fetch initial data (DB only; API must be available). API auth uses dev fallback if configured.
  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, pRes, iRes, sRes] = await Promise.all([
          fetch('/api/companies', { credentials: 'include' }),
          fetch('/api/products', { credentials: 'include' }),
          fetch('/api/invoices', { credentials: 'include' }),
          fetch('/api/settings', { credentials: 'include' }),
        ]);
        if (!cRes.ok || !pRes.ok || !iRes.ok) {
          throw new Error('Failed to fetch API resources');
        }
        const [cJson, pJson, iJson, sJson] = await Promise.all([
          cRes.json(),
          pRes.json(),
          iRes.json(),
          sRes.ok ? sRes.json() : Promise.resolve(getSettings()),
        ]);
        setCompanies(Array.isArray(cJson) ? cJson.map(parseCompany) : []);
        setProducts(Array.isArray(pJson) ? pJson.map(parseProduct) : []);
        setInvoices(Array.isArray(iJson) ? iJson.map(parseInvoice) : []);
        if (sJson) setSettings(sJson);
      } catch (e) {
        console.error('Failed to load data from API', e);
        setCompanies([]);
        setProducts([]);
        setInvoices([]);
      } finally {
        setIsLoaded(true);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const save = async () => {
      if (!isLoaded) return;
      try {
        await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
      } catch (e) {
        console.error('Failed to save settings', e);
      }
    };
    save();
  }, [settings, isLoaded]);

  // API helpers (throw on non-2xx and bubble API error messages)
  const postJson = async (url: string, body: any) => {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), credentials: 'include' });
    let data: any = null;
    try { data = await res.json(); } catch {}
    if (!res.ok) throw new Error((data && data.error) || `POST ${url} failed (${res.status})`);
    return data;
  };
  const patchJson = async (url: string, body: any) => {
    const res = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), credentials: 'include' });
    let data: any = null;
    try { data = await res.json(); } catch {}
    if (!res.ok) throw new Error((data && data.error) || `PATCH ${url} failed (${res.status})`);
    return data;
  };
  const del = async (url: string) => {
    const res = await fetch(url, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) {
      let data: any = null; try { data = await res.json(); } catch {}
      throw new Error((data && data.error) || `DELETE ${url} failed (${res.status})`);
    }
  };

  // Company management functions
  const addCompany = async (companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const payload = {
        name: companyData.name,
        logo: companyData.logo || null,
        gst: companyData.gst,
        pan: companyData.pan || null,
        street: companyData.address.street,
        city: companyData.address.city,
        state: companyData.address.state,
        pincode: companyData.address.pincode,
        country: companyData.address.country,
        mobile: companyData.mobile,
        email: companyData.email || null,
        website: companyData.website || null,
        bankName: companyData.bankDetails?.bankName || null,
        accountNumber: companyData.bankDetails?.accountNumber || null,
        ifscCode: companyData.bankDetails?.ifscCode || null,
        accountHolderName: companyData.bankDetails?.accountHolderName || null,
      };
      const created = await postJson('/api/companies', payload);
      if (!created || !created.id) throw new Error('Create company failed');
      setCompanies(prev => [...prev, parseCompany(created)]);
      addToast({ type: 'success', message: 'Company added' });
    } catch (e) {
      console.error('Failed to add company', e);
      const msg = e instanceof Error ? e.message : 'Failed to add company';
      addToast({ type: 'error', message: msg });
    }
  };

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    try {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.logo !== undefined) payload.logo = updates.logo;
      if (updates.gst !== undefined) payload.gst = updates.gst;
      if (updates.pan !== undefined) payload.pan = updates.pan;
      if (updates.mobile !== undefined) payload.mobile = updates.mobile;
      if (updates.email !== undefined) payload.email = updates.email;
      if (updates.website !== undefined) payload.website = updates.website;
      if (updates.address) {
        payload.street = updates.address.street;
        payload.city = updates.address.city;
        payload.state = updates.address.state;
        payload.pincode = updates.address.pincode;
        payload.country = updates.address.country;
      }
      if (updates.bankDetails) {
        payload.bankName = updates.bankDetails.bankName;
        payload.accountNumber = updates.bankDetails.accountNumber;
        payload.ifscCode = updates.bankDetails.ifscCode;
        payload.accountHolderName = updates.bankDetails.accountHolderName;
      }
      const updated = await patchJson(`/api/companies/${id}`, payload);
      if (!updated || !updated.id) throw new Error('Update company failed');
      setCompanies(prev => prev.map(c => c.id === id ? parseCompany(updated) : c));
      addToast({ type: 'success', message: 'Company updated' });
    } catch (e) {
      console.error('Failed to update company', e);
      addToast({ type: 'error', message: 'Failed to update company' });
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      await del(`/api/companies/${id}`);
      setCompanies(prev => prev.filter(company => company.id !== id));
      setInvoices(prev => prev.filter(invoice => invoice.companyId !== id));
      addToast({ type: 'success', message: 'Company deleted' });
    } catch (e) {
      console.error('Failed to delete company', e);
      addToast({ type: 'error', message: 'Failed to delete company' });
    }
  };

  // Product management functions
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const payload = {
        ...productData,
        taxRate: productData.taxRate || settings.tax.defaultTaxRate
      };
      const created = await postJson('/api/products', payload);
      if (!created || !created.id) throw new Error('Create product failed');
      setProducts(prev => [...prev, parseProduct(created)]);
      addToast({ type: 'success', message: 'Product added' });
    } catch (e) {
      console.error('Failed to add product', e);
      addToast({ type: 'error', message: 'Failed to add product' });
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const payload = { ...updates } as any;
    const updated = await patchJson(`/api/products/${id}`, payload);
    setProducts(prev => prev.map(p => p.id === id ? parseProduct(updated) : p));
    addToast({ type: 'success', message: 'Product updated' });
  };

  const deleteProduct = async (id: string) => {
    await del(`/api/products/${id}`);
    setProducts(prev => prev.filter(product => product.id !== id));
    addToast({ type: 'success', message: 'Product deleted' });
  };

  // Invoice management functions
  const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    const payload = {
      invoiceNumber: invoiceData.invoiceNumber,
      companyId: invoiceData.companyId,
      billToName: invoiceData.billTo.name,
      billToGst: invoiceData.billTo.gst || null,
      billToStreet: invoiceData.billTo.address.street,
      billToCity: invoiceData.billTo.address.city,
      billToState: invoiceData.billTo.address.state,
      billToPincode: invoiceData.billTo.address.pincode,
      billToCountry: invoiceData.billTo.address.country,
      billToMobile: invoiceData.billTo.mobile || null,
      billToEmail: invoiceData.billTo.email || null,
      invoiceDate: invoiceData.invoiceDate,
      dueDate: invoiceData.dueDate,
      placeOfSupply: invoiceData.placeOfSupply,
      items: invoiceData.items,
      subtotal: invoiceData.subtotal,
      totalTax: invoiceData.totalTax,
      discount: invoiceData.discount || 0,
      discountType: invoiceData.discountType || 'amount',
      total: invoiceData.total,
      additionalCharges: invoiceData.additionalCharges || [],
      notes: invoiceData.notes || null,
      terms: invoiceData.terms || null,
      status: invoiceData.status,
      type: invoiceData.type || 'invoice',
    };
    const created = await postJson('/api/invoices', payload);
    setInvoices(prev => [...prev, parseInvoice(created)]);
    addToast({ type: 'success', message: 'Invoice created' });
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    const payload: any = { ...updates };
    if (updates.billTo) {
      payload.billToName = updates.billTo.name;
      payload.billToGst = updates.billTo.gst || null;
      payload.billToStreet = updates.billTo.address.street;
      payload.billToCity = updates.billTo.address.city;
      payload.billToState = updates.billTo.address.state;
      payload.billToPincode = updates.billTo.address.pincode;
      payload.billToCountry = updates.billTo.address.country;
      payload.billToMobile = updates.billTo.mobile || null;
      payload.billToEmail = updates.billTo.email || null;
    }
    if (updates.additionalCharges) payload.additionalCharges = updates.additionalCharges;
    if (updates.payments) payload.payments = updates.payments;
    const updated = await patchJson(`/api/invoices/${id}`, payload);
    setInvoices(prev => prev.map(inv => inv.id === id ? parseInvoice(updated) : inv));
    addToast({ type: 'success', message: 'Invoice updated' });
  };

  const deleteInvoice = async (id: string) => {
    await del(`/api/invoices/${id}`);
    setInvoices(prev => prev.filter(invoice => invoice.id !== id));
    addToast({ type: 'success', message: 'Invoice deleted' });
  };

  // Settings management functions
  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...updates,
      general: { ...prev.general, ...updates.general },
      invoice: { ...prev.invoice, ...updates.invoice },
      proforma: { ...prev.proforma, ...updates.proforma },
      tax: { ...prev.tax, ...updates.tax },
      backup: { ...prev.backup, ...updates.backup },
    }));
  };

  const resetSettings = () => {
    setSettings(getSettings());
  };

  const computeNextInvoiceNumber = useCallback(() => {
    const year = new Date().getFullYear();
    const yearInvoices = invoices.filter(i => i.invoiceDate.getFullYear() === year);
    const nextNumber = Math.max(yearInvoices.length + 1, settings.invoice.startingNumber);
    const prefix = settings.invoice.numberPrefix;
    const suffix = settings.invoice.numberSuffix;
    let invoiceNumber = `${prefix}-${year}-${nextNumber.toString().padStart(4, '0')}`;
    if (suffix) invoiceNumber += `-${suffix}`;
    return invoiceNumber;
  }, [invoices, settings.invoice]);

  const contextValue: AppContextType = {
    companies,
    products,
    invoices,
    settings,
    addCompany,
    updateCompany,
    deleteCompany,
    addProduct,
    updateProduct,
    deleteProduct,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    updateSettings,
    resetSettings,
    getNextInvoiceNumber: computeNextInvoiceNumber,
    formatCurrency: (amount: number) => formatCurrency(amount, settings.general.currency),
    formatDate: (date: Date) => formatDate(date, settings.general.dateFormat, settings.general.timezone),
    calculateTax: (amount: number, taxRate: number, placeOfSupply?: string, companyState?: string) =>
      calculateTax(amount, taxRate, settings.tax, placeOfSupply, companyState),
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}