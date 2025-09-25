'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import MainLayout from '@/components/MainLayout';
import { ProductFormData } from '@/types';
import { formatCurrency } from '@/utils/calculations';

const commonUnits = [
  'pcs', 'kg', 'gm', 'ltr', 'mtr', 'sqft', 'sqmtr', 'box', 'bottle', 'dozen', 'set', 'hour', 'day', 'month'
];

const commonTaxRates = [0, 5, 12, 18, 28];

const commonCategories = [
  'Products', 'Services', 'Raw Materials', 'Finished Goods', 'Software', 'Consulting', 'Other'
];

export default function CreateProductPage() {
  const router = useRouter();
  const { addProduct } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProductFormData>({
    defaultValues: {
      unit: 'pcs',
      taxRate: 18,
      category: 'Products',
    },
  });

  const watchedPrice = watch('price');
  const watchedTaxRate = watch('taxRate');

  const priceNum = Number(watchedPrice) || 0;
  const taxNum = Number(watchedTaxRate) || 0;
  const totalWithTax = priceNum + (priceNum * taxNum) / 100;

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    
    try {
      const productData = {
        name: data.name,
        description: data.description || undefined,
        hsnCode: data.hsnCode || undefined,
        price: data.price,
        taxRate: data.taxRate,
        unit: data.unit,
        category: data.category || undefined,
      };

      addProduct(productData);
      router.push('/products');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error creating product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout title="Add Product">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-gray-800 shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Product Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'Product name is required' })}
                  className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Product description (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Category
                </label>
                <select
                  {...register('category')}
                  className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {commonCategories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pricing & Tax */}
          <div className="bg-gray-800 shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Pricing & Tax</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('price', { 
                    valueAsNumber: true,
                    required: 'Price is required',
                    min: { value: 0, message: 'Price must be positive' }
                  })}
                  className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Tax Rate (%) *
                </label>
                <select
                  {...register('taxRate', { 
                    valueAsNumber: true,
                    required: 'Tax rate is required',
                    min: { value: 0, message: 'Tax rate must be positive' }
                  })}
                  className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {commonTaxRates.map(rate => (
                    <option key={rate} value={rate}>
                      {rate}%
                    </option>
                  ))}
                </select>
                {errors.taxRate && (
                  <p className="mt-1 text-sm text-red-600">{errors.taxRate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Unit *
                </label>
                <select
                  {...register('unit', { required: 'Unit is required' })}
                  className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {commonUnits.map(unit => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                {errors.unit && (
                  <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  HSN Code
                </label>
                <input
                  type="text"
                  {...register('hsnCode')}
                  className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123456"
                />
              </div>
            </div>

            {/* Price Preview */}
            {priceNum > 0 && (
              <div className="mt-6 p-4 bg-gray-700 rounded-md">
                <h4 className="text-sm font-medium text-white mb-2">Price Breakdown</h4>
                <div className="space-y-1 text-sm text-white">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Base Price:</span>
                    <span className="font-medium">{formatCurrency(priceNum)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Tax ({watchedTaxRate}%):</span>
                    <span className="font-medium">{formatCurrency((priceNum * taxNum) / 100)}</span>
                  </div>
                  <div className="border-t border-gray-600 pt-1">
                    <div className="flex justify-between">
                      <span className="text-white font-medium">Total Price:</span>
                      <span className="text-lg font-bold text-white">{formatCurrency(totalWithTax)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pb-8">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}