import { Company, Product, Invoice, AppSettings } from '@/types';

let KEY_PREFIX = 'invoice_generator';
export function setStoragePrefix(userId?: string) {
  KEY_PREFIX = userId ? `invoice_generator_${userId}` : 'invoice_generator';
}

const STORAGE_KEYS = {
  COMPANIES: () => `${KEY_PREFIX}_companies`,
  PRODUCTS: () => `${KEY_PREFIX}_products`,
  INVOICES: () => `${KEY_PREFIX}_invoices`,
  SETTINGS: () => `${KEY_PREFIX}_settings`,
};

// Generic localStorage functions
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key ${key}:`, error);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage key ${key}:`, error);
  }
}

// Specific storage functions
export function getCompanies(): Company[] {
  const companies = getFromStorage<Company[]>(STORAGE_KEYS.COMPANIES(), []);
  return companies.map(company => ({
    ...company,
    createdAt: new Date(company.createdAt),
    updatedAt: new Date(company.updatedAt),
  }));
}

export function saveCompanies(companies: Company[]): void {
  saveToStorage(STORAGE_KEYS.COMPANIES(), companies);
}

export function getProducts(): Product[] {
  const products = getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS(), []);
  return products.map(product => ({
    ...product,
    createdAt: new Date(product.createdAt),
    updatedAt: new Date(product.updatedAt),
  }));
}

export function saveProducts(products: Product[]): void {
  saveToStorage(STORAGE_KEYS.PRODUCTS(), products);
}

export function getInvoices(): Invoice[] {
  const invoices = getFromStorage<Invoice[]>(STORAGE_KEYS.INVOICES(), []);
  return invoices.map(invoice => ({
    ...invoice,
    invoiceDate: new Date(invoice.invoiceDate),
    dueDate: new Date(invoice.dueDate),
    createdAt: new Date(invoice.createdAt),
    updatedAt: new Date(invoice.updatedAt),
  }));
}

export function saveInvoices(invoices: Invoice[]): void {
  saveToStorage(STORAGE_KEYS.INVOICES(), invoices);
}

// Default settings
export function getDefaultSettings(): AppSettings {
  return {
    general: {
      currency: 'INR',
      dateFormat: 'DD/MM/YYYY',
      timezone: 'Asia/Kolkata',
    },
    invoice: {
      numberPrefix: 'INV',
      numberSuffix: '',
      startingNumber: 1,
      dueDays: 30,
      showHsnCode: true,
      showBankDetails: true,
      logoSize: 'medium',
    },
    proforma: {
      numberPrefix: 'PRO',
      numberSuffix: '',
      startingNumber: 1,
      dueDays: 30,
      showHsnCode: true,
      showBankDetails: true,
      logoSize: 'medium',
    },
    tax: {
      defaultTaxRate: 18,
      includeStateCode: true,
      roundingMethod: 'nearest',
      decimalPlaces: 2,
    },
    backup: {
      autoBackup: false,
      backupFrequency: 'weekly',
    },
  };
}

export function getSettings(): AppSettings {
  const settings = getFromStorage<AppSettings>(STORAGE_KEYS.SETTINGS(), getDefaultSettings());
  // Ensure dates are properly parsed
  if (settings.backup.lastBackup) {
    settings.backup.lastBackup = new Date(settings.backup.lastBackup);
  }
  return settings;
}

export function saveSettings(settings: AppSettings): void {
  saveToStorage(STORAGE_KEYS.SETTINGS(), settings);
}

// Generate unique IDs
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Get next invoice number
export function getNextInvoiceNumber(): string {
  const settings = getSettings();
  const invoices = getInvoices();
  const year = new Date().getFullYear();
  const yearInvoices = invoices.filter(invoice => 
    invoice.invoiceDate.getFullYear() === year
  );
  
  const nextNumber = Math.max(yearInvoices.length + 1, settings.invoice.startingNumber);
  const prefix = settings.invoice.numberPrefix;
  const suffix = settings.invoice.numberSuffix;
  
  let invoiceNumber = `${prefix}-${year}-${nextNumber.toString().padStart(4, '0')}`;
  if (suffix) {
    invoiceNumber += `-${suffix}`;
  }
  
  return invoiceNumber;
}

// Image storage utilities
export function saveImageAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}