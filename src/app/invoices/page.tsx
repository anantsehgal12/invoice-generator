'use client';

import { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import MainLayout from '@/components/MainLayout';
import Link from 'next/link';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  Download,
  Search,
  Filter
} from 'lucide-react';
import { formatCurrency } from '@/utils/calculations';
import { format } from 'date-fns';

export default function InvoicesPage() {
  const { invoices, companies, deleteInvoice } = useAppContext();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesSearch = 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.billTo.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      const matchesType = typeFilter === 'all' || invoice.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    }).sort((a, b) => b.invoiceDate.getTime() - a.invoiceDate.getTime());
  }, [invoices, searchTerm, statusFilter, typeFilter]);

  const handleDelete = async (id: string, invoiceNumber: string) => {
    if (confirm(`Are you sure you want to delete invoice "${invoiceNumber}"? This action cannot be undone.`)) {
      setDeletingId(id);
      deleteInvoice(id);
      setDeletingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const paidAmount = filteredInvoices.reduce((sum, invoice) => sum + (invoice.amountPaid || 0), 0);
  const pendingAmount = filteredInvoices.reduce((sum, invoice) => {
    const amountPaid = invoice.amountPaid || 0;
    return sum + (invoice.total - amountPaid);
  }, 0);

  return (
    <MainLayout 
      title="Invoices" 
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/invoices/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Create Invoice
          </Link>
          <Link
            href="/invoices/create/proforma"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Create Proforma
          </Link>
        </div>
      }
    >
      {invoices.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first invoice.
          </p>
          <div className="mt-6">
            <Link
              href="/invoices/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Create Invoice
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="text-sm font-medium text-gray-500">Total Invoices</div>
              <div className="text-2xl font-bold text-white">{filteredInvoices.length}</div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="text-sm font-medium text-gray-500">Total Amount</div>
              <div className="text-2xl font-bold text-white">{formatCurrency(totalAmount)}</div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="text-sm font-medium text-gray-500">Paid Amount</div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="text-sm font-medium text-gray-500">Pending Amount</div>
              <div className="text-2xl font-bold text-amber-600">{formatCurrency(pendingAmount)}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Types</option>
                  <option value="invoice">Invoice</option>
                  <option value="proforma">Proforma</option>
                </select>
              </div>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-gray-900 shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-200">
                  {filteredInvoices.map((invoice) => {
                    const company = companies.find(c => c.id === invoice.companyId);
                    return (
                      <tr key={invoice.id} className="bg-gray-800 hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            {invoice.invoiceNumber}
                            <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${invoice.type === 'proforma' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'}`}>
                              {invoice.type === 'proforma' ? 'Proforma' : 'Invoice'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {company?.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {invoice.billTo.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {invoice.billTo.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                          {format(invoice.invoiceDate, 'MMM dd, yyyy')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                          {format(invoice.dueDate, 'MMM dd, yyyy')}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(invoice.total)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={`/invoices/${invoice.id}`}
                              className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors duration-200"
                              title="View invoice"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/invoices/${invoice.id}/edit`}
                              className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors duration-200"
                              title="Edit invoice"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/invoices/${invoice.id}`}
                              className="p-2 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors duration-200"
                              title="View/Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(invoice.id, invoice.invoiceNumber)}
                              disabled={deletingId === invoice.id}
                              className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200 disabled:opacity-50"
                              title="Delete invoice"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {filteredInvoices.length === 0 && (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No invoices found matching your filters</p>
              </div>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  );
}