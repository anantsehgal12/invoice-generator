'use client';

import { useAppContext } from '@/contexts/AppContext';
import MainLayout from '@/components/MainLayout';
import Link from 'next/link';
import { 
  Building2, 
  Package, 
  FileText, 
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  PlusCircle,
  ArrowRight
} from 'lucide-react';
import { formatCurrency } from '@/utils/calculations';
import { format } from 'date-fns';

export default function Dashboard() {
  const { companies, products, invoices } = useAppContext();

  // Calculate stats
  const totalRevenue = invoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.total, 0);

  const pendingAmount = invoices
    .filter(invoice => invoice.status === 'sent' || invoice.status === 'overdue')
    .reduce((sum, invoice) => sum + invoice.total, 0);

  const overdueInvoices = invoices.filter(invoice => invoice.status === 'overdue').length;
  const recentInvoices = invoices.slice(-5).reverse();

  const stats = [
    {
      name: 'Total Companies',
      value: companies.length.toString(),
      icon: Building2,
      color: 'text-blue-600 bg-blue-100',
      href: '/companies'
    },
    {
      name: 'Total Products',
      value: products.length.toString(),
      icon: Package,
      color: 'text-green-600 bg-green-100',
      href: '/products'
    },
    {
      name: 'Total Invoices',
      value: invoices.length.toString(),
      icon: FileText,
      color: 'text-purple-600 bg-purple-100',
      href: '/invoices'
    },
    {
      name: 'Revenue (Paid)',
      value: formatCurrency(totalRevenue),
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-100',
      href: '/invoices?status=paid'
    },
    {
      name: 'Pending Amount',
      value: formatCurrency(pendingAmount),
      icon: DollarSign,
      color: 'text-amber-600 bg-amber-100',
      href: '/invoices?status=sent'
    },
    {
      name: 'Overdue Invoices',
      value: overdueInvoices.toString(),
      icon: Calendar,
      color: 'text-red-600 bg-red-100',
      href: '/invoices?status=overdue'
    },
  ];

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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <MainLayout
      title="Dashboard"
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/invoices/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
            Create Invoice
          </Link>
          <Link
            href="/invoices/create/proforma"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
            Create Proforma
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.name}
                href={stat.href}
                className="bg-gray-800 overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`p-3 rounded-lg ${stat.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                      <p className="text-2xl font-semibold text-white">{stat.value}</p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Invoices */}
          <div className="bg-gray-800 shadow-sm rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Recent Invoices</h3>
                <Link
                  href="/invoices"
                  className="text-sm text-blue-600 hover:text-blue-500 flex items-center"
                >
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="px-6 py-4">
              {recentInvoices.length > 0 ? (
                <div className="space-y-3">
                  {recentInvoices.map((invoice) => {
                    const company = companies.find(c => c.id === invoice.companyId);
                    return (
                      <div key={invoice.id} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {invoice.invoiceNumber}
                          </p>
                          <p className="text-xs text-gray-500">
                            {company?.name} • {format(invoice.invoiceDate, 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">
                            {formatCurrency(invoice.total)}
                          </p>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            getStatusColor(invoice.status)
                          }`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No invoices yet</p>
                  <Link
                    href="/invoices/create"
                    className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                  >
                    Create your first invoice
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800 shadow-sm rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-white">Quick Actions</h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-3">
                <Link
                  href="/invoices/create"
                  className="flex items-center p-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  <PlusCircle className="mr-3 h-5 w-5 text-gray-400" />
                  Create New Invoice
                  <ArrowRight className="ml-auto h-4 w-4 text-gray-400" />
                </Link>

                <Link
                  href="/invoices/create/proforma"
                  className="flex items-center p-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  <PlusCircle className="mr-3 h-5 w-5 text-gray-400" />
                  Create New Proforma
                  <ArrowRight className="ml-auto h-4 w-4 text-gray-400" />
                </Link>
                
                {companies.length === 0 && (
                  <Link
                    href="/companies"
                    className="flex items-center p-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                  >
                    <Building2 className="mr-3 h-5 w-5 text-gray-400" />
                    Add Your Company
                    <ArrowRight className="ml-auto h-4 w-4 text-gray-400" />
                  </Link>
                )}
                
                {products.length === 0 && (
                  <Link
                    href="/products"
                    className="flex items-center p-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                  >
                    <Package className="mr-3 h-5 w-5 text-gray-400" />
                    Add Products
                    <ArrowRight className="ml-auto h-4 w-4 text-gray-400" />
                  </Link>
                )}
                
                <Link
                  href="/invoices"
                  className="flex items-center p-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  <FileText className="mr-3 h-5 w-5 text-gray-400" />
                  View All Invoices
                  <ArrowRight className="ml-auto h-4 w-4 text-gray-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
    </>
  );
}
