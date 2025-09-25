'use client';

import { useState, useEffect, use } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { useAppContext } from '@/contexts/AppContext';
import { CompanyFormData } from '@/types';
import { validateGST, validatePAN } from '@/utils/calculations';
import { saveImageAsBase64 } from '@/utils/storage';
import { Upload, X, Building2, ArrowLeft, Save } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditCompanyPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { companies, updateCompany } = useAppContext();
  const company = companies.find(c => c.id === id);

  const [logoPreview, setLogoPreview] = useState<string | null>(company?.logo || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<CompanyFormData>();

  useEffect(() => {
    if (company) {
      reset({
        name: company.name,
        gst: company.gst,
        pan: company.pan,
        street: company.address.street,
        city: company.address.city,
        state: company.address.state,
        pincode: company.address.pincode,
        country: company.address.country,
        mobile: company.mobile,
        email: company.email,
        website: company.website,
        bankName: company.bankDetails?.bankName,
        accountNumber: company.bankDetails?.accountNumber,
        ifscCode: company.bankDetails?.ifscCode,
        accountHolderName: company.bankDetails?.accountHolderName,
      });
    }
  }, [company, reset]);

  const watchedGST = watch('gst');
  const watchedPAN = watch('pan');

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Logo file size should be less than 2MB');
        return;
      }
      try {
        const base64 = await saveImageAsBase64(file);
        setLogoPreview(base64);
      } catch (err) {
        console.error('Error processing logo:', err);
        alert('Error processing logo file');
      }
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    const fileInput = document.getElementById('logo') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const onSubmit = async (data: CompanyFormData) => {
    if (!company) return;
    setIsSubmitting(true);
    try {
      const updates = {
        name: data.name,
        gst: data.gst,
        pan: data.pan || undefined,
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
        bankDetails: (data.bankName || data.accountNumber || data.ifscCode || data.accountHolderName) ? {
          bankName: data.bankName || '',
          accountNumber: data.accountNumber || '',
          ifscCode: data.ifscCode || '',
          accountHolderName: data.accountHolderName || '',
        } : undefined,
      };
      updateCompany(company.id, updates);
      router.push('/companies');
    } catch (error) {
      console.error('Error updating company:', error);
      alert('Error updating company. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!company) {
    return (
      <MainLayout title="Company Not Found">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-6">We couldn't find that company.</p>
          <button onClick={() => router.push('/companies')} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="-ml-1 mr-2 h-5 w-5" /> Back to Companies
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title={`Edit Company`}
      actions={
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50">
            <ArrowLeft className="-ml-1 mr-2 h-4 w-4" /> Back
          </button>
          <button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="inline-flex items-center px-4 py-2 rounded-md text-sm text-white bg-blue-600 hover:bg-blue-700">
            <Save className="-ml-1 mr-2 h-4 w-4" /> {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Logo */}
          <div className="bg-gray-800 shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Company Logo</h3>
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {logoPreview ? (
                  <div className="relative">
                    <img src={logoPreview} alt="Logo preview" className="w-20 h-20 object-contain border border-gray-300 rounded-lg" />
                    <button type="button" onClick={removeLogo} className="absolute -top-2 -right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200">
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
                <label htmlFor="logo" className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Upload className="-ml-1 mr-2 h-4 w-4" /> Upload Logo
                </label>
                <input id="logo" type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                <p className="mt-1 text-xs text-gray-300">PNG, JPG up to 2MB</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-gray-800 shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">Company Name *</label>
                <input type="text" {...register('name', { required: 'Company name is required' })} className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">GST Number *</label>
                <input type="text" {...register('gst', { required: 'GST number is required', validate: (v) => validateGST(v) || 'Invalid GST format' })} className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" style={{ textTransform: 'uppercase' }} />
                {errors.gst && <p className="mt-1 text-sm text-red-600">{errors.gst.message}</p>}
                {watchedGST && !validateGST(watchedGST) && <p className="mt-1 text-xs text-amber-600">Invalid GST format</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">PAN Number</label>
                <input type="text" {...register('pan', { validate: (v) => !v || validatePAN(v) || 'Invalid PAN format' })} className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" style={{ textTransform: 'uppercase' }} />
                {errors.pan && <p className="mt-1 text-sm text-red-600">{errors.pan.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">Mobile Number *</label>
                <input type="tel" {...register('mobile', { required: 'Mobile number is required', pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid mobile number' } })} className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                {errors.mobile && <p className="mt-1 text-sm text-red-600">{errors.mobile.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">Email</label>
                <input type="email" {...register('email')} className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">Website</label>
                <input type="url" {...register('website')} className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-gray-800 shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Address</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">Street Address *</label>
                <textarea {...register('street', { required: 'Street address is required' })} rows={2} className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                {errors.street && <p className="mt-1 text-sm text-red-600">{errors.street.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">City *</label>
                  <input type="text" {...register('city', { required: 'City is required' })} className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">State *</label>
                  <input type="text" {...register('state', { required: 'State is required' })} className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Pincode *</label>
                  <input type="text" {...register('pincode', { required: 'Pincode is required', pattern: { value: /^[1-9][0-9]{5}$/, message: 'Invalid pincode' } })} className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Country *</label>
                  <input type="text" {...register('country', { required: 'Country is required' })} className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-gray-800 shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Bank Details (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">Bank Name</label>
                <input type="text" {...register('bankName')} className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">Account Holder Name</label>
                <input type="text" {...register('accountHolderName')} className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">Account Number</label>
                <input type="text" {...register('accountNumber')} className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">IFSC Code</label>
                <input type="text" {...register('ifscCode')} className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" style={{ textTransform: 'uppercase' }} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pb-8">
            <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-md text-sm text-white bg-blue-600 hover:bg-blue-700">{isSubmitting ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
