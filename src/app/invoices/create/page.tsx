'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import MainLayout from '@/components/MainLayout';
import {
  Plus,
  Minus,
  Save,
  Eye,
  Calculator,
  Building,
  User,
  Calendar,
  MapPin
} from 'lucide-react';
import { InvoiceFormData, InvoiceItem } from '@/types';
import { formatCurrency, calculateInvoiceTotal } from '@/utils/calculations';
import { format } from 'date-fns';
import InvoicePreview from '@/components/InvoicePreview';

export default function CreateInvoicePage() {
  const router = useRouter();
  const { companies, products, addInvoice, settings, getNextInvoiceNumber } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    defaultValues: {
      companyId: settings.general.defaultCompanyId || companies[0]?.id || '',
      invoiceNumber: '',
      invoiceDate: format(new Date(), 'yyyy-MM-dd'),
      dueDate: format(new Date(Date.now() + settings.invoice.dueDays * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      placeOfSupply: '',
      billToName: '',
      billToStreet: '',
      billToCity: '',
      billToState: '',
      billToPincode: '',
      billToCountry: 'India',
      items: [{ productId: '', quantity: 1 }],
      discountType: 'amount',
      discount: 0,
      notes: settings.invoice.defaultNotes || '',
      terms: settings.invoice.defaultTerms || '',
      additionalCharges: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const { fields: acFields, append: acAppend, remove: acRemove } = useFieldArray({
    control,
    name: 'additionalCharges',
  });

  const watchedValues = watch();
  const selectedCompany = companies.find(c => c.id === watchedValues.companyId);

  // Auto-generate invoice number when component mounts or company changes
  useEffect(() => {
    if (!watchedValues.invoiceNumber) {
      setValue('invoiceNumber', getNextInvoiceNumber());
    }
  }, [setValue, watchedValues.invoiceNumber]);

  // Auto-populate place of supply from selected company
  useEffect(() => {
    if (selectedCompany && !watchedValues.placeOfSupply) {
      setValue('placeOfSupply', selectedCompany.address.state);
    }
  }, [selectedCompany, setValue, watchedValues.placeOfSupply]);

  // Calculate invoice totals
  const invoiceCalculation = useMemo(() => {
    if (!selectedCompany) return null;

    const items: InvoiceItem[] = watchedValues.items
      .filter(item => item.productId)
      .map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return null;

        const rate = item.rate || product.price;
        const amount = item.quantity * rate;
        const taxAmount = (amount * product.taxRate) / 100;

        return {
          productId: product.id,
          productName: product.name,
          description: product.description,
          hsnCode: product.hsnCode,
          quantity: item.quantity,
          unit: product.unit,
          rate,
          taxRate: product.taxRate,
          amount,
          taxAmount,
          totalAmount: amount + taxAmount,
        };
      })
      .filter(Boolean) as InvoiceItem[];

    if (items.length === 0) return null;

    return calculateInvoiceTotal(
      items,
      watchedValues.discount || 0,
      watchedValues.discountType || 'amount',
      selectedCompany.address.state,
      watchedValues.placeOfSupply,
      watchedValues.additionalCharges || []
    );
  }, [watchedValues, selectedCompany, products]);

  const onSubmit = async (data: InvoiceFormData) => {
    if (!selectedCompany || !invoiceCalculation) {
      alert('Please select a company and add at least one item');
      return;
    }

    setIsSubmitting(true);

    try {
      const items: InvoiceItem[] = data.items
        .filter(item => item.productId && products.find(p => p.id === item.productId))
        .map(item => {
          const product = products.find(p => p.id === item.productId)!;
          const rate = item.rate || product.price;
          const amount = item.quantity * rate;
          const taxAmount = (amount * product.taxRate) / 100;

          return {
            productId: product.id,
            productName: product.name,
            description: product.description,
            hsnCode: product.hsnCode,
            quantity: item.quantity,
            unit: product.unit,
            rate,
            taxRate: product.taxRate,
            amount,
            taxAmount,
            totalAmount: amount + taxAmount,
          };
        });

      const invoice = {
        invoiceNumber: data.invoiceNumber,
        companyId: data.companyId,
        billTo: {
          name: data.billToName,
          gst: data.billToGst,
          address: {
            street: data.billToStreet,
            city: data.billToCity,
            state: data.billToState,
            pincode: data.billToPincode,
            country: data.billToCountry,
          },
          mobile: data.billToMobile,
          email: data.billToEmail,
        },
        invoiceDate: new Date(data.invoiceDate),
        dueDate: new Date(data.dueDate),
        placeOfSupply: data.placeOfSupply,
        items,
        subtotal: invoiceCalculation.subtotal,
        totalTax: invoiceCalculation.totalTax,
        discount: invoiceCalculation.discount,
        discountType: data.discountType,
        additionalCharges: (data.additionalCharges || []).filter(c => c && c.name && c.amount != null),
        total: invoiceCalculation.total,
        notes: data.notes,
        terms: data.terms,
        status: 'sent' as const,
        type: 'invoice' as const,
      };

      addInvoice(invoice);
      router.push('/invoices');
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Error creating invoice. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (companies.length === 0) {
    return (
      <MainLayout title="Create Invoice">
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-white">No companies found</h3>
          <p className="mt-1 text-sm text-gray-500">
            You need to add at least one company before creating invoices.
          </p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/companies')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Add Company
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Create Invoice"
      actions={
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-50"
          >
            <Eye className="-ml-1 mr-2 h-5 w-5" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Company Selection */}
            <div className="bg-gray-800 shadow-sm rounded-lg p-6">
              <h3 className="text-lg text-white font-medium  mb-4">Invoice From</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white font-medium  mb-1">
                    Company *
                  </label>
                  <select
                    {...register('companyId', { required: 'Company is required' })}
                    className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                  {errors.companyId && (
                    <p className="mt-1 text-sm text-red-600">{errors.companyId.message}</p>
                  )}
                </div>

                {selectedCompany && (
                  <div className="p-4 bg-gray-700 rounded-md">
                    <div className="flex items-start space-x-3">
                      {selectedCompany.logo ? (
                        <img
                          src={selectedCompany.logo}
                          alt={selectedCompany.name}
                          className="h-12 w-12 object-contain"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                          <Building className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="text-sm">
                        <p className="font-medium text-white"><b>{selectedCompany.name}</b></p>
                        <p className="text-gray-100">GST: {selectedCompany.gst}</p>
                        <p className="text-gray-100">
                          {selectedCompany.address.street}, {selectedCompany.address.city}
                        </p>
                        <p className="text-gray-100">
                          {selectedCompany.address.state} - {selectedCompany.address.pincode}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Invoice Details */}
            <div className="bg-gray-800 shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Invoice Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Invoice Number *
                  </label>
                  <input
                    type="text"
                    {...register('invoiceNumber', { required: 'Invoice number is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="INV-2024-0001"
                  />
                  {errors.invoiceNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.invoiceNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Place of Supply *
                  </label>
                  <input
                    type="text"
                    {...register('placeOfSupply', { required: 'Place of supply is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="State name"
                  />
                  {errors.placeOfSupply && (
                    <p className="mt-1 text-sm text-red-600">{errors.placeOfSupply.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Invoice Date *
                  </label>
                  <input
                    type="date"
                    {...register('invoiceDate', { required: 'Invoice date is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.invoiceDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.invoiceDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    {...register('dueDate', { required: 'Due date is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.dueDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="bg-gray-800 shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Bill To</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    {...register('billToName', { required: 'Client name is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Client company name"
                  />
                  {errors.billToName && (
                    <p className="mt-1 text-sm text-red-600">{errors.billToName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    GST Number
                  </label>
                  <input
                    type="text"
                    {...register('billToGst')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="22AAAAA0000A1Z5"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Mobile
                  </label>
                  <input
                    type="tel"
                    {...register('billToMobile')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="9876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    {...register('billToEmail')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="client@example.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white mb-1">
                    Street Address *
                  </label>
                  <textarea
                    {...register('billToStreet', { required: 'Street address is required' })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter street address"
                  />
                  {errors.billToStreet && (
                    <p className="mt-1 text-sm text-red-600">{errors.billToStreet.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    {...register('billToCity', { required: 'City is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="City"
                  />
                  {errors.billToCity && (
                    <p className="mt-1 text-sm text-red-600">{errors.billToCity.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    {...register('billToState', { required: 'State is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="State"
                  />
                  {errors.billToState && (
                    <p className="mt-1 text-sm text-red-600">{errors.billToState.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    {...register('billToPincode', { required: 'Pincode is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="123456"
                  />
                  {errors.billToPincode && (
                    <p className="mt-1 text-sm text-red-600">{errors.billToPincode.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    {...register('billToCountry', { required: 'Country is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="India"
                  />
                  {errors.billToCountry && (
                    <p className="mt-1 text-sm text-red-600">{errors.billToCountry.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Charges */}
            <div className="bg-gray-800 shadow-sm rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Additional Charges</h3>
                <button
                  type="button"
                  onClick={() => acAppend({ name: '', amount: 0 })}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  <Plus className="-ml-1 mr-1 h-4 w-4" /> Add Charge
                </button>
              </div>
              {acFields.length === 0 && (
                <p className="text-sm text-gray-500">No additional charges. Add if needed.</p>
              )}
              <div className="space-y-3">
                {acFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    <div className="md:col-span-6">
                      <label className="block text-sm font-medium text-white mb-1">Name</label>
                      <input
                        type="text"
                        {...register(`additionalCharges.${index}.name` as const)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Shipping"
                      />
                    </div>
                    <div className="md:col-span-5">
                      <label className="block text-sm font-medium text-white mb-1">Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        {...register(`additionalCharges.${index}.amount` as const, { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="md:col-span-1 flex">
                      <button type="button" onClick={() => acRemove(index)} className="mt-6 inline-flex items-center p-2 rounded-md text-red-700 bg-red-100 hover:bg-red-200">
                        <Minus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Items */}
            <div className="bg-gray-800 shadow-sm rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Items</h3>
                <button
                  type="button"
                  onClick={() => append({ productId: '', quantity: 1 })}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  <Plus className="-ml-1 mr-1 h-4 w-4" />
                  Add Item
                </button>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No products available.</p>
                  <button
                    type="button"
                    onClick={() => router.push('/products')}
                    className="mt-2 text-blue-600 hover:text-blue-500"
                  >
                    Add products first
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => {
                    const selectedProduct = products.find(p => p.id === watchedValues.items[index]?.productId);
                    const quantity = watchedValues.items[index]?.quantity || 1;
                    const rate = watchedValues.items[index]?.rate || selectedProduct?.price || 0;
                    const amount = quantity * rate;

                    return (
                      <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                          <div className="md:col-span-4">
                            <label className="block text-sm font-medium text-white mb-1">
                              Product *
                            </label>
                            <select
                              {...register(`items.${index}.productId` as const, { 
                                required: 'Product is required' 
                              })}
                              className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="" disabled selected>Select product</option>
                              {products.map(product => (
                                <option key={product.id} value={product.id}>
                                  {product.name} - {formatCurrency(product.price)}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-white mb-1">
                              Quantity *
                            </label>
                            <input
                              type="number"
                              min="1"
                              step="0.01"
                              {...register(`items.${index}.quantity` as const, { 
                                required: 'Quantity is required',
                                min: 0.01 
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-white mb-1">
                              Rate
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              {...register(`items.${index}.rate` as const)}
                              placeholder={selectedProduct?.price.toString() || '0'}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-white mb-1">
                              Amount
                            </label>
                            <div className="px-3 py-2 bg-gray-800 border border-gray-200 rounded-md text-sm">
                              {formatCurrency(amount)}
                            </div>
                          </div>

                          <div className="md:col-span-2">
                            {fields.length > 1 && (
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {selectedProduct && (
                          <div className="mt-2 text-sm text-gray-500">
                            {selectedProduct.description && (
                              <p>{selectedProduct.description}</p>
                            )}
                            <div className="flex items-center space-x-4 mt-1">
                              <span>HSN: {selectedProduct.hsnCode || 'N/A'}</span>
                              <span>Tax: {selectedProduct.taxRate}%</span>
                              <span>Unit: {selectedProduct.unit}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Discount */}
            <div className="bg-gray-800 shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Discount</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Discount Type
                  </label>
                  <select
                    {...register('discountType')}
                    className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="amount">Fixed Amount</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('discount')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Discount Amount
                  </label>
                  <div className="px-3 py-2 bg-gray-800 border border-gray-200 rounded-md text-sm">
                    {invoiceCalculation ? formatCurrency(invoiceCalculation.discount) : formatCurrency(0)}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes & Terms */}
            <div className="bg-gray-800 shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Additional Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Notes
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Any additional notes for the client"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Terms & Conditions
                  </label>
                  <textarea
                    {...register('terms')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Payment terms and conditions"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !invoiceCalculation}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Creating...' : 'Create Invoice'}
              </button>
            </div>
          </div>

          {/* Invoice Preview/Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-gray-800 shadow-sm rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Calculator className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-lg font-medium text-white">Invoice Summary</h3>
                </div>

                {invoiceCalculation ? (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">{formatCurrency(invoiceCalculation.subtotal)}</span>
                    </div>

                    {invoiceCalculation.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Discount:</span>
                        <span className="font-medium text-red-600">-{formatCurrency(invoiceCalculation.discount)}</span>
                      </div>
                    )}

                    {invoiceCalculation.cgst > 0 && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">CGST:</span>
                          <span className="font-medium">{formatCurrency(invoiceCalculation.cgst)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">SGST:</span>
                          <span className="font-medium">{formatCurrency(invoiceCalculation.sgst)}</span>
                        </div>
                      </>
                    )}

                    {invoiceCalculation.igst > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">IGST:</span>
                        <span className="font-medium">{formatCurrency(invoiceCalculation.igst)}</span>
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-medium text-white">Total:</span>
                        <span className="text-lg font-bold text-white">{formatCurrency(invoiceCalculation.total)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calculator className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2 text-sm text-gray-500">
                      Add items to see invoice summary
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>

      {showPreview && selectedCompany && invoiceCalculation && (
        <div className="mt-8">
          <div className="bg-gray-800 shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Invoice Preview</h3>
            <InvoicePreview
              invoice={{
                id: 'preview',
                invoiceNumber: watchedValues.invoiceNumber,
                companyId: watchedValues.companyId,
                billTo: {
                  name: watchedValues.billToName,
                  gst: watchedValues.billToGst,
                  address: {
                    street: watchedValues.billToStreet,
                    city: watchedValues.billToCity,
                    state: watchedValues.billToState,
                    pincode: watchedValues.billToPincode,
                    country: watchedValues.billToCountry,
                  },
                  mobile: watchedValues.billToMobile,
                  email: watchedValues.billToEmail,
                },
                invoiceDate: new Date(watchedValues.invoiceDate),
                dueDate: new Date(watchedValues.dueDate),
                placeOfSupply: watchedValues.placeOfSupply,
                items: watchedValues.items
                  .filter(item => item.productId && products.find(p => p.id === item.productId))
                  .map(item => {
                    const product = products.find(p => p.id === item.productId)!;
                    const rate = item.rate || product.price;
                    const amount = item.quantity * rate;
                    const taxAmount = (amount * product.taxRate) / 100;
                    return {
                      productId: product.id,
                      productName: product.name,
                      description: product.description,
                      hsnCode: product.hsnCode,
                      quantity: item.quantity,
                      unit: product.unit,
                      rate,
                      taxRate: product.taxRate,
                      amount,
                      taxAmount,
                      totalAmount: amount + taxAmount,
                    };
                  }),
                subtotal: invoiceCalculation.subtotal,
                totalTax: invoiceCalculation.totalTax,
                discount: invoiceCalculation.discount,
                discountType: watchedValues.discountType,
                additionalCharges: (watchedValues.additionalCharges || []).filter(c => c && c.name && c.amount != null),
                total: invoiceCalculation.total,
                notes: watchedValues.notes,
                terms: watchedValues.terms,
                status: 'draft',
                type: 'invoice',
                amountPaid: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
              }}
              company={selectedCompany}
            />
          </div>
        </div>
      )}
    </MainLayout>
  );
}
