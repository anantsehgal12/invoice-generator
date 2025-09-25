import { InvoiceItem, InvoiceCalculation, AdditionalCharge } from '@/types';

// GST calculation based on place of supply
export function calculateGSTType(companyState: string, placeOfSupply: string) {
  if (!companyState || !placeOfSupply) return 'IGST';
  const isSameState = companyState.toLowerCase().trim() === placeOfSupply.toLowerCase().trim();
  return isSameState ? 'CGST_SGST' : 'IGST';
}

// Calculate tax amounts for a single item
export function calculateItemTax(amount: number, taxRate: number, gstType: 'CGST_SGST' | 'IGST') {
  const totalTax = (amount * taxRate) / 100;
  
  if (gstType === 'CGST_SGST') {
    return {
      cgst: totalTax / 2,
      sgst: totalTax / 2,
      igst: 0,
      total: totalTax
    };
  } else {
    return {
      cgst: 0,
      sgst: 0,
      igst: totalTax,
      total: totalTax
    };
  }
}

// Calculate invoice totals
export function calculateInvoiceTotal(
  items: InvoiceItem[],
  discount: number = 0,
  discountType: 'percentage' | 'amount' = 'amount',
  companyState: string,
  placeOfSupply: string,
  additionalCharges: AdditionalCharge[] = []
): InvoiceCalculation {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate discount
  const discountAmount = discountType === 'percentage' 
    ? (subtotal * discount) / 100 
    : discount;
  
  const discountedSubtotal = subtotal - discountAmount;
  
  // Calculate GST type
  const gstType = calculateGSTType(companyState, placeOfSupply);
  
  // Calculate taxes
  let totalCGST = 0;
  let totalSGST = 0;
  let totalIGST = 0;
  
  items.forEach(item => {
    const itemAmount = item.amount - ((item.amount / subtotal) * discountAmount);
    const taxAmounts = calculateItemTax(itemAmount, item.taxRate, gstType);
    
    totalCGST += taxAmounts.cgst;
    totalSGST += taxAmounts.sgst;
    totalIGST += taxAmounts.igst;
  });
  
  const totalTax = totalCGST + totalSGST + totalIGST;
  const extra = additionalCharges.reduce((s, ch) => s + (ch.amount || 0), 0);
  const total = discountedSubtotal + totalTax + extra;
  
  return {
    subtotal,
    cgst: totalCGST,
    sgst: totalSGST,
    igst: totalIGST,
    totalTax,
    discount: discountAmount,
    additionalCharges: extra,
    total
  };
}

// Format currency
export function formatCurrency(amount: number | null | undefined, currency: string = '₹'): string {
  const n = typeof amount === 'number' && isFinite(amount) ? amount : 0;
  return `${currency}${n.toFixed(2)}`;
}

// Format number with commas
export function formatNumber(num: number): string {
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Convert number to words (for amount in words)
export function numberToWords(amount: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
  function convertHundreds(num: number): string {
    let result = '';
    
    if (num > 99) {
      result += ones[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    
    if (num > 19) {
      result += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    } else if (num > 9) {
      result += teens[num - 10] + ' ';
      return result;
    }
    
    if (num > 0) {
      result += ones[num] + ' ';
    }
    
    return result;
  }
  
  if (amount === 0) return 'Zero';
  
  let integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);
  
  let result = '';
  
  if (integerPart >= 10000000) { // Crores
    result += convertHundreds(Math.floor(integerPart / 10000000)) + 'Crore ';
    integerPart %= 10000000;
  }
  
  if (integerPart >= 100000) { // Lakhs
    result += convertHundreds(Math.floor(integerPart / 100000)) + 'Lakh ';
    integerPart %= 100000;
  }
  
  if (integerPart >= 1000) { // Thousands
    result += convertHundreds(Math.floor(integerPart / 1000)) + 'Thousand ';
    integerPart %= 1000;
  }
  
  if (integerPart > 0) {
    result += convertHundreds(integerPart);
  }
  
  result += 'Rupees';
  
  if (decimalPart > 0) {
    result += ' and ' + convertHundreds(decimalPart) + 'Paise';
  }
  
  result += ' Only';
  
  return result.trim();
}

// Validate GST number
export function validateGST(gst: string): boolean {
  if (!gst) return false;
  const value = gst.toUpperCase().trim();
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(value);
}

// Validate PAN number
export function validatePAN(pan: string): boolean {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
}

// Calculate due date
export function calculateDueDate(invoiceDate: Date, paymentTerms: number): Date {
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(dueDate.getDate() + paymentTerms);
  return dueDate;
}

// Get invoice status based on dates
export function getInvoiceStatus(dueDate: Date, isPaid: boolean): 'paid' | 'overdue' | 'pending' {
  if (isPaid) return 'paid';
  const today = new Date();
  return today > dueDate ? 'overdue' : 'pending';
}