'use client';

import { useAppContext } from '@/contexts/AppContext';
import { useEffect, useState } from 'react';

const sampleCompany = {
  name: 'Acme Technologies Pvt Ltd',
  gst: '22AAAAA0000A1Z5',
  pan: 'AAAPL1234C',
  address: {
    street: '123 Business Park, Tech Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    country: 'India',
  },
  mobile: '9876543210',
  email: 'contact@acme-tech.com',
  website: 'https://www.acme-tech.com',
  bankDetails: {
    bankName: 'State Bank of India',
    accountNumber: '1234567890123456',
    ifscCode: 'SBIN0001234',
    accountHolderName: 'Acme Technologies Pvt Ltd',
  },
};

const sampleProducts = [
  {
    name: 'Website Development',
    description: 'Custom website development with responsive design',
    hsnCode: '998314',
    price: 50000,
    taxRate: 18,
    unit: 'pcs',
    category: 'Services',
  },
  {
    name: 'Mobile App Development',
    description: 'Native iOS and Android app development',
    hsnCode: '998314',
    price: 80000,
    taxRate: 18,
    unit: 'pcs',
    category: 'Services',
  },
  {
    name: 'SEO Optimization',
    description: 'Search Engine Optimization for 6 months',
    hsnCode: '998314',
    price: 15000,
    taxRate: 18,
    unit: 'month',
    category: 'Services',
  },
  {
    name: 'Domain & Hosting',
    description: 'Annual domain registration and web hosting',
    hsnCode: '998314',
    price: 5000,
    taxRate: 18,
    unit: 'year',
    category: 'Services',
  },
  {
    name: 'Logo Design',
    description: 'Professional logo design with multiple concepts',
    hsnCode: '998314',
    price: 8000,
    taxRate: 18,
    unit: 'pcs',
    category: 'Services',
  },
];

export default function SampleDataLoader() {
  const { companies, products, addCompany, addProduct } = useAppContext();
  const [hasLoadedSample, setHasLoadedSample] = useState(false);

  useEffect(() => {
    const loadSampleData = () => {
      // Only load if no data exists and we haven't already loaded sample data
      if (companies.length === 0 && products.length === 0 && !hasLoadedSample) {
        // Add sample company
        addCompany(sampleCompany);
        
        // Add sample products
        sampleProducts.forEach(product => {
          addProduct(product);
        });
        
        setHasLoadedSample(true);
        console.log('Sample data loaded successfully!');
      }
    };

    // Load sample data after a short delay to ensure context is ready
    const timer = setTimeout(loadSampleData, 1000);
    
    return () => clearTimeout(timer);
  }, [companies.length, products.length, addCompany, addProduct, hasLoadedSample]);

  // This component doesn't render anything visible
  return null;
}