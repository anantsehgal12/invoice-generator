export interface Company {
  id: string;
  name: string;
  logo?: string;
  gst: string;
  pan?: string;
  address: Address;
  mobile: string;
  email?: string;
  website?: string;
  bankDetails?: BankDetails;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  hsnCode?: string;
  price: number;
  taxRate: number; // GST rate in percentage
  unit: string; // e.g., 'pcs', 'kg', 'ltr'
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  description?: string;
  hsnCode?: string;
  quantity: number;
  unit: string;
  rate: number;
  taxRate: number;
  taxAmount: number;
  amount: number; // quantity * rate
  totalAmount: number; // amount + taxAmount
}

export interface Payment {
  amount: number;
  date: Date;
  method?: string;
  note?: string;
}

export interface AdditionalCharge {
  name: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  companyId: string;
  billTo: BillTo;
  invoiceDate: Date;
  dueDate: Date;
  placeOfSupply: string;
  items: InvoiceItem[];
  subtotal: number;
  totalTax: number;
  discount?: number;
  discountType?: 'percentage' | 'amount';
  additionalCharges?: AdditionalCharge[];
  total: number;
  amountPaid?: number;
  payments?: Payment[];
  notes?: string;
  terms?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  type: 'invoice' | 'proforma';
  createdAt: Date;
  updatedAt: Date;
}

export interface BillTo {
  name: string;
  gst?: string;
  address: Address;
  mobile?: string;
  email?: string;
}

export interface InvoiceCalculation {
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  discount: number;
  additionalCharges: number;
  total: number;
}

// Form types
export interface CompanyFormData {
  name: string;
  logo?: FileList;
  gst: string;
  pan?: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  mobile: string;
  email?: string;
  website?: string;
  // Bank details
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
}

export interface ProductFormData {
  name: string;
  description?: string;
  hsnCode?: string;
  price: number;
  taxRate: number;
  unit: string;
  category?: string;
}

export interface InvoiceFormData {
  companyId: string;
  billToName: string;
  billToGst?: string;
  billToStreet: string;
  billToCity: string;
  billToState: string;
  billToPincode: string;
  billToCountry: string;
  billToMobile?: string;
  billToEmail?: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  placeOfSupply: string;
  items: InvoiceItemFormData[];
  discount?: number;
  discountType?: 'percentage' | 'amount';
  additionalCharges?: { name: string; amount: number }[];
  notes?: string;
  terms?: string;
}

export interface InvoiceItemFormData {
  productId: string;
  quantity: number;
  rate?: number; // Optional override of product price
}

// Context types
export interface AppContextType {
  companies: Company[];
  products: Product[];
  invoices: Invoice[];
  settings: AppSettings;
  addCompany: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCompany: (id: string, company: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
  getNextInvoiceNumber: () => string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date) => string;
  calculateTax: (amount: number, taxRate: number, placeOfSupply?: string, companyState?: string) => {
    cgst: number;
    sgst: number;
    igst: number;
    totalTax: number;
    taxAmount: number;
  };
}

export interface FilterOptions {
  search?: string;
  status?: Invoice['status'];
  dateFrom?: Date;
  dateTo?: Date;
  companyId?: string;
}

// Settings interfaces
export interface AppSettings {
  general: {
    defaultCompanyId?: string;
    currency: string;
    dateFormat: string;
    timezone: string;
  };
  invoice: {
    numberPrefix: string;
    numberSuffix: string;
    startingNumber: number;
    dueDays: number;
    defaultNotes?: string;
    defaultTerms?: string;
    showHsnCode: boolean;
    showBankDetails: boolean;
    logoSize: 'small' | 'medium' | 'large';
  };
  proforma: {
    numberPrefix: string;
    numberSuffix: string;
    startingNumber: number;
    dueDays: number;
    defaultNotes?: string;
    defaultTerms?: string;
    showHsnCode: boolean;
    showBankDetails: boolean;
    logoSize: 'small' | 'medium' | 'large';
  };
  tax: {
    defaultTaxRate: number;
    includeStateCode: boolean;
    roundingMethod: 'none' | 'nearest' | 'up' | 'down';
    decimalPlaces: number;
  };
  backup: {
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    lastBackup?: Date;
  };
}

export interface SettingsFormData {
  // General settings
  defaultCompanyId?: string;
  currency: string;
  dateFormat: string;
  timezone: string;
  // Invoice settings
  numberPrefix: string;
  numberSuffix: string;
  startingNumber: number;
  dueDays: number;
  defaultNotes?: string;
  defaultTerms?: string;
  showHsnCode: boolean;
  showBankDetails: boolean;
  logoSize: 'small' | 'medium' | 'large';
  // Proforma settings
  proformaNumberPrefix: string;
  proformaNumberSuffix: string;
  proformaStartingNumber: number;
  proformaDueDays: number;
  proformaDefaultNotes?: string;
  proformaDefaultTerms?: string;
  proformaShowHsnCode: boolean;
  proformaShowBankDetails: boolean;
  proformaLogoSize: 'small' | 'medium' | 'large';
  // Tax settings
  defaultTaxRate: number;
  includeStateCode: boolean;
  roundingMethod: 'none' | 'nearest' | 'up' | 'down';
  decimalPlaces: number;
  // Backup settings
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
}
