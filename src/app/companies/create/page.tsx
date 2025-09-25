'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import MainLayout from '@/components/MainLayout';
import { CompanyFormData } from '@/types';
import { validateGST, validatePAN } from '@/utils/calculations';
import { saveImageAsBase64 } from '@/utils/storage';
import { Upload, X, Building2 } from 'lucide-react';

export default function CreateCompanyPage() {
  const router = useRouter();
  const { addCompany } = useAppContext();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CompanyFormData>({
    defaultValues: {
      country: 'India',
    },
  });

  const watchedGST = watch('gst');
  const watchedPAN = watch('pan');

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert('Logo file size should be less than 2MB');
        return;
      }
      
      try {
        const base64 = await saveImageAsBase64(file);
        setLogoPreview(base64);
      } catch (error) {
        console.error('Error processing logo:', error);
        alert('Error processing logo file');
      }
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    const fileInput = document.getElementById('logo') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const onSubmit = async (data: CompanyFormData) => {
    setIsSubmitting(true);
    
    try {
      const companyData = {
        name: data.name,
        gst: (data.gst || '').toUpperCase().trim(),
        pan: (data.pan || undefined) ? (data.pan as string).toUpperCase().trim() : undefined,
        logo: logoPreview || undefined,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          country: data.country,
        },
        mobile: data.mobile,
        email: data.email || undefined,
        website: data.website || undefined,
        bankDetails: (data.bankName || data.accountNumber || data.ifscCode) ? {
          bankName: data.bankName || '',
          accountNumber: data.accountNumber || '',
          ifscCode: data.ifscCode || '',
          accountHolderName: data.accountHolderName || '',
        } : undefined,
      };

      addCompany(companyData);
      router.push('/companies');
    } catch (error) {
      console.error('Error creating company:', error);
      alert('Error creating company. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout title="Add Company">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Logo Upload */}
          <div className="bg-gray-800 shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Company Logo</h3>
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {logoPreview ? (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-20 h-20 object-contain border border-gray-300 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <label
                  htmlFor="logo"
                  className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Upload className="-ml-1 mr-2 h-4 w-4" />
                  Upload Logo
                </label>
                <input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <p className="mt-1 text-xs text-gray-300">PNG, JPG up to 2MB</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-gray-800 shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'Company name is required' })}
                  className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter company name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  GST Number *
                </label>
                <input
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  maxLength={15}
                  {...register('gst', {
                    required: 'GST number is required',
                    validate: (value) => validateGST(value) || 'Invalid GST format',
                    onChange: (e) => {
                      const raw = (e.target as HTMLInputElement).value || '';
                      const normalized = raw.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 15);
                      setValue('gst', normalized, { shouldValidate: true, shouldDirty: true });
                    }
                  })}
                  className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="22AAAAA0000A1Z5"
                  title="Format: 15 characters e.g., 22AAAAA0000A1Z5"
                  style={{ textTransform: 'uppercase' }}
                />
                {errors.gst && (
                  <p className="mt-1 text-sm text-red-600">{errors.gst.message}</p>
                )}
                {watchedGST && !validateGST(watchedGST) && (
                  <p className="mt-1 text-xs text-amber-600">Invalid GST format</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  PAN Number
                </label>
                <input
                  type="text"
                  {...register('pan', {
                    validate: (value) => !value || validatePAN(value) || 'Invalid PAN format'
                  })}
                  className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="AAAPL1234C"
                  style={{ textTransform: 'uppercase' }}
                />
                {errors.pan && (
                  <p className="mt-1 text-sm text-red-600">{errors.pan.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  {...register('mobile', {
                    required: 'Mobile number is required',
                    pattern: {
                      value: /^[6-9]\d{9}$/,
                      message: 'Invalid mobile number'
                    }
                  })}
                  className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="9876543210"
                />
                {errors.mobile && (
                  <p className="mt-1 text-sm text-red-600">{errors.mobile.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Email
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="company@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Website
                </label>
                <input
                  type="url"
                  {...register('website')}
                  className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://www.example.com"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-gray-800 shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Address</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Street Address *
                </label>
                <textarea
                  {...register('street', { required: 'Street address is required' })}
                  rows={2}
                  className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter street address"
                />
                {errors.street && (
                  <p className="mt-1 text-sm text-red-600">{errors.street.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    {...register('city', { required: 'City is required' })}
                    className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="City"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    {...register('state', { required: 'State is required' })}
                    className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="State"
                  />
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    {...register('pincode', {
                      required: 'Pincode is required',
                      pattern: {
                        value: /^[1-9][0-9]{5}$/,
                        message: 'Invalid pincode'
                      }
                    })}
                    className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="123456"
                  />
                  {errors.pincode && (
                    <p className="mt-1 text-sm text-red-600">{errors.pincode.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    {...register('country', { required: 'Country is required' })}
                    className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="India"
                  />
                  {errors.country && (
                    <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-gray-800 shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Bank Details (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  {...register('bankName')}
                  className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="State Bank of India"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  {...register('accountHolderName')}
                  className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Account holder name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  {...register('accountNumber')}
                  className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  {...register('ifscCode')}
                  className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="SBIN0001234"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
            </div>
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
              {isSubmitting ? 'Adding...' : 'Add Company'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}