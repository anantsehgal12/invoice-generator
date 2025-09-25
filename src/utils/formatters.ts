import { format } from 'date-fns';
import { AppSettings } from '@/types';

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  });

  return formatter.format(amount);
}

export function formatDate(date: Date, dateFormat: string = 'DD/MM/YYYY', timezone: string = 'Asia/Kolkata'): string {
  try {
    // Convert date format from DD/MM/YYYY style to date-fns format
    const dateFnsFormat = dateFormat
      .replace(/DD/g, 'dd')
      .replace(/MM/g, 'MM')
      .replace(/YYYY/g, 'yyyy');

    return format(date, dateFnsFormat);
  } catch (error) {
    // Fallback to default formatting
    return format(date, 'dd/MM/yyyy');
  }
}

export function calculateTax(
  amount: number,
  taxRate: number,
  settings: AppSettings['tax'],
  placeOfSupply?: string,
  companyState?: string
): {
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  taxAmount: number;
} {
  const taxAmount = (amount * taxRate) / 100;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (settings.includeStateCode && placeOfSupply && companyState) {
    // If inter-state, apply IGST
    if (placeOfSupply !== companyState) {
      igst = taxAmount;
    } else {
      // Intra-state, split into CGST and SGST
      cgst = taxAmount / 2;
      sgst = taxAmount / 2;
    }
  } else {
    // Default to IGST if state code not included or not provided
    igst = taxAmount;
  }

  // Apply rounding
  const roundValue = (value: number): number => {
    switch (settings.roundingMethod) {
      case 'none':
        return value;
      case 'nearest':
        return Math.round(value * Math.pow(10, settings.decimalPlaces)) / Math.pow(10, settings.decimalPlaces);
      case 'up':
        return Math.ceil(value * Math.pow(10, settings.decimalPlaces)) / Math.pow(10, settings.decimalPlaces);
      case 'down':
        return Math.floor(value * Math.pow(10, settings.decimalPlaces)) / Math.pow(10, settings.decimalPlaces);
      default:
        return Math.round(value * Math.pow(10, settings.decimalPlaces)) / Math.pow(10, settings.decimalPlaces);
    }
  };

  cgst = roundValue(cgst);
  sgst = roundValue(sgst);
  igst = roundValue(igst);
  const totalTax = cgst + sgst + igst;

  return {
    cgst,
    sgst,
    igst,
    totalTax,
    taxAmount: roundValue(taxAmount),
  };
}

export function formatNumber(value: number, decimalPlaces: number = 2): string {
  return value.toFixed(decimalPlaces);
}
