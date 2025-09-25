'use client';

import { useState, useRef, use } from 'react';
import { useAppContext } from '@/contexts/AppContext';

function RecordPayment({ invoiceId, currentPaid, total }: { invoiceId: string; currentPaid: number; total: number }) {
  const { updateInvoice, invoices } = useAppContext();
  const current = invoices.find(i => i.id === invoiceId);
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const submit = () => {
    if (!amount || amount <= 0 || !current) return;
    const payments = (current.payments || []).concat([{ amount, date: new Date(date), method, note }]);
    const amountPaid = (current.amountPaid || 0) + amount;
    const status = amountPaid >= (current.total || total) ? 'paid' : current.status;
    updateInvoice(invoiceId, { payments, amountPaid, status });
    setAmount(0);
    setMethod('');
    setNote('');
  };

  return (
    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
      <div>
        <label className="block text-sm font-medium text-white mb-1">Amount</label>
        <input type="number" step="0.01" value={amount || ''} onChange={(e) => setAmount(parseFloat(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-1">Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-1">Method</label>
        <input type="text" value={method} onChange={(e) => setMethod(e.target.value)} placeholder="UPI / Cash / Card" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
      </div>
      <div className="flex gap-2">
        <button onClick={submit} className="w-full px-4 py-2 mt-6 rounded-md text-sm text-white bg-blue-600 hover:bg-blue-700">Record</button>
      </div>
      <div className="md:col-span-4">
        <label className="block text-sm font-medium text-white mb-1 mt-2">Note</label>
        <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
      </div>
    </div>
  );
}
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import InvoicePreview from '@/components/InvoicePreview';
import { 
  Download, 
  Edit, 
  ArrowLeft,
  Copy,
  Trash2,
  Eye
} from 'lucide-react';
import { generatePDF as generatePDFUtil, prepareElementForPDF } from '@/utils/pdfGenerator';
import { formatCurrency } from '@/utils/calculations';

interface InvoiceViewPageProps {
  params: Promise<{ id: string }>;
}

export default function InvoiceViewPage({ params }: InvoiceViewPageProps) {
  const router = useRouter();
  const { invoices, companies, deleteInvoice, updateInvoice } = useAppContext();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const { id } = use(params);
  const invoice = invoices.find(inv => inv.id === id);
  const company = invoice ? companies.find(comp => comp.id === invoice.companyId) : null;

  if (!invoice || !company) {
    return (
      <MainLayout title="Invoice Not Found">
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Eye className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Invoice not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The invoice you're looking for doesn't exist or has been deleted.
          </p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/invoices')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="-ml-1 mr-2 h-5 w-5" />
              Back to Invoices
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const handleGeneratePDF = async () => {
    if (!invoiceRef.current) return;
    setIsGeneratingPDF(true);
    try {
      await prepareElementForPDF(invoiceRef.current);
      await generatePDFUtil(invoiceRef.current, { filename: `${invoice.invoiceNumber}.pdf` });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete invoice "${invoice.invoiceNumber}"? This action cannot be undone.`)) {
      deleteInvoice(invoice.id);
      router.push('/invoices');
    }
  };

  const copyInvoiceNumber = () => {
    navigator.clipboard.writeText(invoice.invoiceNumber);
    alert('Invoice number copied to clipboard!');
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

  return (
    <MainLayout 
      title={
        <div className="flex items-center space-x-3">
          <span>Invoice {invoice.invoiceNumber}</span>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </span>
        </div>
      }
      actions={
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="-ml-1 mr-2 h-4 w-4" />
            Back
          </button>
          
          <button
            onClick={copyInvoiceNumber}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            title="Copy invoice number"
          >
            <Copy className="-ml-1 mr-2 h-4 w-4" />
            Copy #
          </button>

          <button
            onClick={() => router.push(`/invoices/${invoice.id}/edit`)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Edit className="-ml-1 mr-2 h-4 w-4" />
            Edit
          </button>

          <button
            onClick={handleGeneratePDF}
            disabled={isGeneratingPDF}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            <Download className="-ml-1 mr-2 h-4 w-4" />
            {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
          </button>

          <button
            onClick={handleDelete}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
          >
            <Trash2 className="-ml-1 mr-2 h-4 w-4" />
            Delete
          </button>
        </div>
      }
    >
      <div className="max-w-5xl mx-auto">
        {/* Invoice Preview */}
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <InvoicePreview 
            ref={invoiceRef}
            invoice={invoice} 
            company={company} 
          />
        </div>

        {/* Additional Actions */}
        <div className="mt-8 bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Invoice Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <Download className="mr-2 h-5 w-5" />
              {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
            </button>

            <button
              onClick={() => router.push(`/invoices/${invoice.id}/edit`)}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Edit className="mr-2 h-5 w-5" />
              Edit Invoice
            </button>

            <button
              onClick={copyInvoiceNumber}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Copy className="mr-2 h-5 w-5" />
              Copy Number
            </button>
          </div>
        </div>

        {/* Status & Payments */}
        <div className="mt-8 bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-white mb-4">Status & Payments</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Update Status */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">Update Status</label>
              <select
                value={invoice.status}
                onChange={(e) => {
                  const newStatus = e.target.value as typeof invoice.status;
                  if (newStatus === 'paid') {
                    // When marking as paid, record full payment if not already fully paid
                    const balanceDue = (invoice.total ?? 0) - (invoice.amountPaid || 0);
                    if (balanceDue > 0) {
                      const payments = (invoice.payments || []).concat([{
                        amount: balanceDue,
                        date: new Date(),
                        method: 'Auto',
                        note: 'Marked as paid'
                      }]);
                      updateInvoice(invoice.id, {
                        status: newStatus,
                        payments,
                        amountPaid: invoice.total
                      });
                    } else {
                      updateInvoice(invoice.id, { status: newStatus });
                    }
                  } else {
                    updateInvoice(invoice.id, { status: newStatus });
                  }
                }}
                className="w-full px-3 bg-gray-800 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Record Payment */}
            <RecordPayment invoiceId={invoice.id} currentPaid={invoice.amountPaid || 0} total={invoice.total} />

            {/* Paid/Balance */}
            <div>
              <div className="text-sm text-white">Amount Paid</div>
              <div className="text-lg font-semibold text-gray-100">{formatCurrency(invoice.amountPaid || 0)}</div>
              <div className="text-sm text-white mt-2">Balance Due</div>
              <div className="text-lg font-semibold text-gray-100">{formatCurrency((invoice.total ?? 0) - (invoice.amountPaid || 0))}</div>
            </div>
          </div>
        </div>

        {/* Invoice Details Summary */}
        <div className="mt-8 bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Invoice Summary</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Items</dt>
              <dd className="text-lg font-semibold text-gray-900 dark:text-gray-100">{invoice.items.length}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Subtotal</dt>
              <dd className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(invoice.subtotal)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tax</dt>
              <dd className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(invoice.totalTax)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Final Total</dt>
              <dd className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(invoice.total)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </MainLayout>
  );
}