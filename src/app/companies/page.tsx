'use client';

import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import MainLayout from '@/components/MainLayout';
import Link from 'next/link';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin,
  CreditCard
} from 'lucide-react';

export default function CompaniesPage() {
  const { companies, deleteCompany } = useAppContext();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      setDeletingId(id);
      deleteCompany(id);
      setDeletingId(null);
    }
  };

  return (
    <MainLayout 
      title="Companies" 
      actions={
        <Link
          href="/companies/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Company
        </Link>
      }
    >
      {companies.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No companies</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating your first company.
          </p>
          <div className="mt-6">
            <Link
              href="/companies/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Add Company
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <div
              key={company.id}
              className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt={`${company.name} logo`}
                        className="h-12 w-12 object-contain border border-gray-200 rounded"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
                        {company.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">GST: {company.gst}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Link
                      href={`/companies/${company.id}/edit`}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors duration-200"
                      title="Edit company"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(company.id, company.name)}
                      disabled={deletingId === company.id}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200 disabled:opacity-50"
                      title="Delete company"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                    <span className="truncate">
                      {company.address.city}, {company.address.state}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                    <span>{company.mobile}</span>
                  </div>

                  {company.email && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                      <span className="truncate">{company.email}</span>
                    </div>
                  )}

                  {company.bankDetails && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <CreditCard className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                      <span className="truncate">{company.bankDetails.bankName}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Added {company.createdAt.toLocaleDateString()}
                    </span>
                    <Link
                      href={`/companies/${company.id}`}
                      className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  );
}