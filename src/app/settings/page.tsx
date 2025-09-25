'use client';

import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import MainLayout from '@/components/MainLayout';
import { useForm } from 'react-hook-form';
import { SettingsFormData } from '@/types';
import { 
  Save, 
  RotateCcw, 
  Download, 
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Building2,
  FileText,
  DollarSign,
  HardDrive,
  Palette,
  Clock,
  Globe
} from 'lucide-react';
import { format } from 'date-fns';

export default function SettingsPage() {
  const { settings, companies, updateSettings, resetSettings } = useAppContext();
  const [activeTab, setActiveTab] = useState('general');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    watch
  } = useForm<SettingsFormData>({
    defaultValues: {
      // General settings
      defaultCompanyId: settings.general?.defaultCompanyId || '',
      currency: settings.general?.currency || 'INR',
      dateFormat: settings.general?.dateFormat || 'DD/MM/YYYY',
      timezone: settings.general?.timezone || 'Asia/Kolkata',
      // Invoice settings
      numberPrefix: settings.invoice?.numberPrefix || 'INV',
      numberSuffix: settings.invoice?.numberSuffix || '',
      startingNumber: settings.invoice?.startingNumber || 1,
      dueDays: settings.invoice?.dueDays || 30,
      defaultNotes: settings.invoice?.defaultNotes || '',
      defaultTerms: settings.invoice?.defaultTerms || '',
      showHsnCode: settings.invoice?.showHsnCode ?? true,
      showBankDetails: settings.invoice?.showBankDetails ?? true,
      logoSize: settings.invoice?.logoSize || 'medium',
      // Proforma settings
      proformaNumberPrefix: settings.proforma?.numberPrefix || 'PRO',
      proformaNumberSuffix: settings.proforma?.numberSuffix || '',
      proformaStartingNumber: settings.proforma?.startingNumber || 1,
      proformaDueDays: settings.proforma?.dueDays || 30,
      proformaDefaultNotes: settings.proforma?.defaultNotes || '',
      proformaDefaultTerms: settings.proforma?.defaultTerms || '',
      proformaShowHsnCode: settings.proforma?.showHsnCode ?? true,
      proformaShowBankDetails: settings.proforma?.showBankDetails ?? true,
      proformaLogoSize: settings.proforma?.logoSize || 'medium',
      // Tax settings
      defaultTaxRate: settings.tax?.defaultTaxRate || 18,
      includeStateCode: settings.tax?.includeStateCode ?? true,
      roundingMethod: settings.tax?.roundingMethod || 'nearest',
      decimalPlaces: settings.tax?.decimalPlaces || 2,
      // Backup settings
      autoBackup: settings.backup?.autoBackup ?? false,
      backupFrequency: settings.backup?.backupFrequency || 'weekly',
    }
  });

  const onSubmit = (data: SettingsFormData) => {
    updateSettings({
      general: {
        defaultCompanyId: data.defaultCompanyId,
        currency: data.currency,
        dateFormat: data.dateFormat,
        timezone: data.timezone,
      },
      invoice: {
        numberPrefix: data.numberPrefix,
        numberSuffix: data.numberSuffix,
        startingNumber: data.startingNumber,
        dueDays: data.dueDays,
        defaultNotes: data.defaultNotes,
        defaultTerms: data.defaultTerms,
        showHsnCode: data.showHsnCode,
        showBankDetails: data.showBankDetails,
        logoSize: data.logoSize,
      },
      proforma: {
        numberPrefix: data.proformaNumberPrefix,
        numberSuffix: data.proformaNumberSuffix,
        startingNumber: data.proformaStartingNumber,
        dueDays: data.proformaDueDays,
        defaultNotes: data.proformaDefaultNotes,
        defaultTerms: data.proformaDefaultTerms,
        showHsnCode: data.proformaShowHsnCode,
        showBankDetails: data.proformaShowBankDetails,
        logoSize: data.proformaLogoSize,
      },
      tax: {
        defaultTaxRate: data.defaultTaxRate,
        includeStateCode: data.includeStateCode,
        roundingMethod: data.roundingMethod,
        decimalPlaces: data.decimalPlaces,
      },
      backup: {
        ...settings.backup,
        autoBackup: data.autoBackup,
        backupFrequency: data.backupFrequency,
      },
    });

    setSaveMessage('Settings saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleReset = () => {
    resetSettings();
    reset();
    setShowResetConfirm(false);
    setSaveMessage('Settings reset to default values!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const exportData = () => {
    const allData = {
      companies,
      settings,
      exportedAt: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-generator-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'invoice', name: 'Invoice', icon: FileText },
    { id: 'proforma', name: 'Proforma', icon: FileText },
    { id: 'tax', name: 'Tax', icon: DollarSign },
    { id: 'data', name: 'Data', icon: HardDrive },
  ];

  const currencyOptions = [
    { value: 'INR', label: '₹ Indian Rupee (INR)' },
    { value: 'USD', label: '$ US Dollar (USD)' },
    { value: 'EUR', label: '€ Euro (EUR)' },
    { value: 'GBP', label: '£ British Pound (GBP)' },
  ];

  const dateFormatOptions = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
    { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY' },
  ];

  const timezoneOptions = [
    { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
    { value: 'America/New_York', label: 'America/New_York (EST)' },
    { value: 'Europe/London', label: 'Europe/London (GMT)' },
    { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)' },
  ];


  const logoSizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
  ];

  const roundingOptions = [
    { value: 'none', label: 'No Rounding' },
    { value: 'nearest', label: 'Round to Nearest' },
    { value: 'up', label: 'Round Up' },
    { value: 'down', label: 'Round Down' },
  ];

  return (
    <MainLayout
      title="Settings"
      actions={
        <div className="flex items-center gap-2">
          {saveMessage && (
            <div className="flex items-center text-green-600 text-sm font-medium">
              <CheckCircle className="h-4 w-4 mr-1" />
              {saveMessage}
            </div>
          )}
          {isDirty && (
            <button
              onClick={handleSubmit(onSubmit)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-600">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-300 hover:text-white hover:border-gray-500'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="bg-gray-800 shadow-sm rounded-lg p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">General Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Default Company
                      </label>
                      <select
                        {...register('defaultCompanyId')}
                        className="mt-1 block w-full rounded-md bg-gray-800 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-white"
                      >
                        <option value="">Select a company</option>
                        {companies.map((company) => (
                          <option key={company.id} value={company.id}>
                            {company.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Currency
                      </label>
                      <select
                        {...register('currency')}
                        className="mt-1 block w-full rounded-md bg-gray-800 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-white"
                      >
                        {currencyOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Date Format
                      </label>
                      <select
                        {...register('dateFormat')}
                        className="mt-1 block w-full rounded-md bg-gray-800 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-white"
                      >
                        {dateFormatOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Timezone
                      </label>
                      <select
                        {...register('timezone')}
                        className="mt-1 block w-full rounded-md bg-gray-800 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-white"
                      >
                        {timezoneOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invoice Settings */}
          {activeTab === 'invoice' && (
            <div className="bg-gray-800 shadow-sm rounded-lg p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Invoice Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Invoice Number Prefix
                      </label>
                      <input
                        type="text"
                        {...register('numberPrefix')}
                        className="mt-1 block w-full rounded-md bg-gray-800 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-white"
                        placeholder="INV"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Invoice Number Suffix
                      </label>
                      <input
                        type="text"
                        {...register('numberSuffix')}
                        className="mt-1 block w-full rounded-md bg-gray-800 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-white"
                        placeholder="Optional suffix"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Starting Invoice Number
                      </label>
                      <input
                        type="number"
                        {...register('startingNumber', { min: 1 })}
                        className="mt-1 block w-full rounded-md bg-gray-800 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-white"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Default Due Days
                      </label>
                      <input
                        type="number"
                        {...register('dueDays', { min: 1 })}
                        className="mt-1 block w-full rounded-md bg-gray-800 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-white"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Logo Size
                      </label>
                      <select
                        {...register('logoSize')}
                        className="mt-1 block w-full rounded-md bg-gray-800 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-white"
                      >
                        {logoSizeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="showHsnCode"
                          {...register('showHsnCode')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="showHsnCode" className="ml-2 text-sm text-white">
                          Show HSN Code
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="showBankDetails"
                          {...register('showBankDetails')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="showBankDetails" className="ml-2 text-sm text-white">
                          Show Bank Details
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Default Notes
                    </label>
                    <textarea
                      {...register('defaultNotes')}
                      rows={3}
                      className="mt-1 block w-full rounded-md bg-gray-800 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-white"
                      placeholder="Default notes to appear on invoices..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Default Terms & Conditions
                    </label>
                    <textarea
                      {...register('defaultTerms')}
                      rows={3}
                      className="mt-1 block w-full rounded-md bg-gray-800 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-white"
                      placeholder="Default terms and conditions..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Proforma Settings */}
          {activeTab === 'proforma' && (
            <div className="bg-gray-800 shadow-sm rounded-lg p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Proforma Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Proforma Number Prefix
                      </label>
                      <input
                        type="text"
                        {...register('proformaNumberPrefix')}
                        className="mt-1 block w-full rounded-md bg-gray-800 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-white"
                        placeholder="PRO"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Proforma Number Suffix
                      </label>
                      <input
                        type="text"
                        {...register('proformaNumberSuffix')}
                        className="mt-1 block w-full rounded-md bg-gray-800 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-white"
                        placeholder="Optional suffix"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Starting Proforma Number
                      </label>
                      <input
                        type="number"
                        {...register('proformaStartingNumber', { min: 1 })}
                        className="mt-1 block w-full rounded-md bg-gray-800 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-white"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Default Due Days
                      </label>
                      <input
                        type="number"
                        {...register('proformaDueDays', { min: 1 })}
                        className="mt-1 block w-full rounded-md bg-gray-800 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-white"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Logo Size
                      </label>
                      <select
                        {...register('proformaLogoSize')}
                        className="mt-1 block w-full rounded-md bg-gray-800 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-white"
                      >
                        {logoSizeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="proformaShowHsnCode"
                          {...register('proformaShowHsnCode')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="proformaShowHsnCode" className="ml-2 text-sm text-white">
                          Show HSN Code
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="proformaShowBankDetails"
                          {...register('proformaShowBankDetails')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="proformaShowBankDetails" className="ml-2 text-sm text-white">
                          Show Bank Details
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Default Notes
                    </label>
                    <textarea
                      {...register('proformaDefaultNotes')}
                      rows={3}
                      className="mt-1 block w-full rounded-md bg-gray-800 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-white"
                      placeholder="Default notes to appear on proforma invoices..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Default Terms & Conditions
                    </label>
                    <textarea
                      {...register('proformaDefaultTerms')}
                      rows={3}
                      className="mt-1 block w-full rounded-md bg-gray-800 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-white"
                      placeholder="Default terms and conditions..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tax Settings */}
          {activeTab === 'tax' && (
            <div className="bg-gray-800 shadow-sm rounded-lg p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Tax Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Default Tax Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register('defaultTaxRate', { min: 0, max: 100 })}
                        className="mt-1 block w-full rounded-md bg-gray-800 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-white"
                        min="0"
                        max="100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Decimal Places
                      </label>
                      <select
                        {...register('decimalPlaces')}
                        className="mt-1 block w-full rounded-md bg-gray-800 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-white"
                      >
                        <option value={0}>0</option>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Rounding Method
                      </label>
                      <select
                        {...register('roundingMethod')}
                        className="mt-1 block w-full rounded-md bg-gray-800 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-white"
                      >
                        {roundingOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="includeStateCode"
                        {...register('includeStateCode')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="includeStateCode" className="ml-2 text-sm text-white">
                        Include State Code in Tax Calculations
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Management */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              {/* Backup Settings */}
              <div className="bg-gray-800 shadow-sm rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">Backup Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoBackup"
                      {...register('autoBackup')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="autoBackup" className="ml-2 text-sm text-white">
                      Enable Automatic Backups
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Backup Frequency
                    </label>
                    <select
                      {...register('backupFrequency')}
                      className="mt-1 block w-full rounded-md bg-gray-800 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-white"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                {settings.backup.lastBackup && (
                  <div className="mt-4 p-3 bg-gray-700 rounded-md">
                    <p className="text-sm text-gray-300">
                      Last backup: {format(settings.backup.lastBackup, 'PPP')}
                    </p>
                  </div>
                )}
              </div>

              {/* Data Export/Import */}
              <div className="bg-gray-800 shadow-sm rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">Data Management</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-white">Export Data</h4>
                      <p className="text-sm text-gray-300">
                        Download all your data as a JSON file for backup
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={exportData}
                      className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </button>
                  </div>

                  <div className="border-t border-gray-600 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-white">Reset Settings</h4>
                        <p className="text-sm text-gray-300">
                          Reset all settings to their default values
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowResetConfirm(true)}
                        className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-yellow-400 mr-2" />
                <h3 className="text-lg font-medium text-white">Reset Settings</h3>
              </div>
              <p className="text-sm text-gray-300 mb-6">
                Are you sure you want to reset all settings to their default values? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-white hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Reset Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}