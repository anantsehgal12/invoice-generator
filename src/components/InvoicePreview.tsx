'use client';

import { forwardRef } from 'react';
import { Invoice, Company } from '@/types';
import { formatCurrency, numberToWords, calculateGSTType } from '@/utils/calculations';
import { format } from 'date-fns';
import { textAlign } from 'html2canvas/dist/types/css/property-descriptors/text-align';

interface InvoicePreviewProps {
  invoice: Invoice;
  company: Company;
}

const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  ({ invoice, company }, ref) => {
    const gstType = calculateGSTType(company.address?.state || '', invoice.placeOfSupply);
    const isSameState = gstType === 'CGST_SGST';

    return (
      <div
        ref={ref}
        className="pdf-safe p-8 max-w-4xl mx-auto shadow-lg bg-white text-gray-900"
      >
        {/* Header */}
        <div className="border-b-2 pb-6 mb-6" style={{ borderBottomColor: '#334155', borderBottomWidth: '2px', borderBottomStyle: 'solid' }}>
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="h-16 w-16 object-contain"
                  style={{ display: 'block' }}
                />
              ) : (
                <div
                  className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center"
                  style={{ backgroundColor: '#e5e7eb', borderRadius: '4px' }}
                >
                  <span className="text-gray-400 text-xs" style={{ color: '#9ca3af' }}>Logo</span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900" style={{ color: '#111827' }}>{company.name}</h1>
                <div className="text-sm text-gray-600 mt-1" style={{ color: '#4b5563' }}>
                  <p>{company.address.street}</p>
                  <p>{company.address.city}, {company.address.state} - {company.address.pincode}</p>
                  <p>{company.address.country}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold text-blue-300" style={{ color: '#1456a0' }}>
                {invoice.type === 'proforma' ? 'Proforma Invoice' : 'INVOICE'}
              </h2>
              <div className="text-sm text-gray-600 mt-2" style={{ color: '#4b5563' }}>
                <p><strong>GST:</strong> {company.gst}</p>
                {company.pan && <p><strong>PAN:</strong> {company.pan}</p>}
                <p><strong>Mobile:</strong> {company.mobile}</p>
                {company.email && <p><strong>Email:</strong> {company.email}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
            <div className="text-sm text-gray-600">
              <p className="font-semibold text-gray-900">{invoice.billTo.name}</p>
              {invoice.billTo.gst && <p><strong>GST:</strong> {invoice.billTo.gst}</p>}
              <p>{invoice.billTo.address.street}</p>
              <p>{invoice.billTo.address.city}, {invoice.billTo.address.state}</p>
              <p>{invoice.billTo.address.pincode}, {invoice.billTo.address.country}</p>
              {invoice.billTo.mobile && <p><strong>Mobile:</strong> {invoice.billTo.mobile}</p>}
              {invoice.billTo.email && <p><strong>Email:</strong> {invoice.billTo.email}</p>}
            </div>
          </div>

          <div>
            <div className="text-sm text-black space-y-2" style={{ color: '#000000ff' }}>
              <div className="flex justify-between">
                <span className="font-medium">Invoice Number:</span>
                <span>{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Invoice Date:</span>
                <span>{format(invoice.invoiceDate, 'dd/MM/yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Due Date:</span>
                <span>{format(invoice.dueDate, 'dd/MM/yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Place of Supply:</span>
                <span>{invoice.placeOfSupply}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <table
            className="w-full border-collapse border border-gray-300"
            style={{ border: '1px solid #334155', borderCollapse: 'collapse' }}
          >
            <thead>
              <tr className="bg-slate-800" style={{ backgroundColor: '#1e293b' }}>
                <th
                  className="border px-3 py-2 text-left text-white text-xs font-medium uppercase"
                  style={{ border: '1px solid #334155' }}
                >
                  #
                </th>
                <th
                  className="border border-gray-300 px-3 py-2 text-left text-white text-xs font-medium uppercase"
                  style={{ border: '1px solid #334155' }}
                >
                  Item & Description
                </th>
                <th
                  className="border px-3 py-2 text-center text-white text-xs font-medium uppercase"
                  style={{ border: '1px solid #334155' }}
                >
                  HSN/SAC
                </th>
                <th
                  className="border border-gray-300 px-3 py-2 text-white text-center text-xs font-medium uppercase"
                  style={{ border: '1px solid #334155' }}
                >
                  Qty
                </th>
                <th
                  className="border border-gray-300 px-3 py-2 text-white text-center text-xs font-medium uppercase"
                  style={{ border: '1px solid #334155' }}
                >
                  Unit
                </th>
                <th
                  className="border px-3 py-2 text-right text-xs text-white font-medium uppercase"
                  style={{ border: '1px solid #334155' }}
                >
                  Rate
                </th>
                <th
                  className="border border-gray-300 px-3 py-2 text-white text-right text-xs font-medium uppercase"
                  style={{ border: '1px solid #334155' }}
                >
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td className="border px-3 py-2 text-sm" style={{ border: '1px solid #334155' }}>
                    {index + 1}
                  </td>
                  <td className="border px-3 py-2 text-sm" style={{ border: '1px solid #334155' }}>
                    <div className="font-medium">{item.productName}</div>
                    {item.description && (
                      <div className="text-gray-600 text-xs mt-1" style={{ color: '#4b5563' }}>{item.description}</div>
                    )}
                  </td>
                  <td className="border px-3 py-2 text-sm text-center" style={{ border: '1px solid #334155' }}>
                    {item.hsnCode || '-'}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center" style={{ border: '1px solid #334155' }}>
                    {item.quantity}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center" style={{ border: '1px solid #334155' }}>
                    {item.unit}
                  </td>
                  <td className="border px-3 py-2 text-sm text-right" style={{ border: '1px solid #334155' }}>
                    {formatCurrency(item.rate)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-right" style={{ border: '1px solid #334155' }}>
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
              
              {/* Spacer rows for better appearance */}
              {invoice.items.length < 5 && Array.from({ length: 5 - invoice.items.length }).map((_, index) => (
                <tr key={`spacer-${index}`}>
                  <td className="border px-3 py-4" style={{ border: '1px solid #334155' }}>&nbsp;</td>
                  <td className="border px-3 py-4" style={{ border: '1px solid #334155' }}>&nbsp;</td>
                  <td className="border px-3 py-4" style={{ border: '1px solid #334155' }}>&nbsp;</td>
                  <td className="border px-3 py-4" style={{ border: '1px solid #334155' }}>&nbsp;</td>
                  <td className="border px-3 py-4" style={{ border: '1px solid #334155' }}>&nbsp;</td>
                  <td className="border px-3 py-4" style={{ border: '1px solid #334155' }}>&nbsp;</td>
                  <td className="border px-3 py-4" style={{ border: '1px solid #334155' }}>&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-80">
            <table
              className="w-full border-collapse border"
              style={{ border: '1px solid #334155', borderCollapse: 'collapse' }}
            >
              <tbody>
                <tr>
                  <td className="border px-3 py-2 text-sm font-medium" style={{ border: '1px solid #334155' }}>
                    Subtotal
                  </td>
                  <td className="border px-3 py-2 text-sm text-right" style={{ border: '1px solid #334155' }}>
                    {formatCurrency(invoice.subtotal)}
                  </td>
                </tr>
                
                {(invoice.discount ?? 0) > 0 && (
                  <tr>
                    <td className="border px-3 py-2 text-sm font-medium" style={{ border: '1px solid #334155' }}>
                      Discount
                    </td>
                    <td className="border px-3 py-2 text-sm text-right text-red-300" style={{ border: '1px solid #334155', color: '#fca5a5' }}>
                      -{formatCurrency(invoice.discount as number)}
                    </td>
                  </tr>
                )}

                {/* Additional Charges */}
                {(invoice.additionalCharges && invoice.additionalCharges.length > 0) && (
                  <>
                    {invoice.additionalCharges.map((ch, idx) => (
                      <tr key={`ac-${idx}`}>
                        <td className="border px-3 py-2 text-sm font-medium" style={{ border: '1px solid #334155' }}>
                          {ch.name || 'Additional Charge'}
                        </td>
                        <td className="border px-3 py-2 text-sm text-right" style={{ border: '1px solid #334155' }}>
                          {formatCurrency(ch.amount)}
                        </td>
                      </tr>
                    ))}
                  </>
                )}

                {isSameState ? (
                  <>
                    <tr>
                      <td className="border px-3 py-2 text-sm font-medium" style={{ border: '1px solid #334155' }}>
                        CGST
                      </td>
                      <td className="border px-3 py-2 text-sm text-right" style={{ border: '1px solid #334155' }}>
                        {formatCurrency(invoice.totalTax / 2)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 text-sm font-medium" style={{ border: '1px solid #334155' }}>
                        SGST
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-right" style={{ border: '1px solid #334155' }}>
                        {formatCurrency(invoice.totalTax / 2)}
                      </td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-right" style={{ border: '1px solid #334155' }}>
                      IGST
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-right" style={{ border: '1px solid #334155' }}>
                      {formatCurrency(invoice.totalTax)}
                    </td>
                  </tr>
                )}

                <tr className="bg-slate-800" style={{ backgroundColor: '#1e293b', textAlign: 'left', color: 'white'}}>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-white text-left" style={{ border: '1px solid #334155' }}>
                    Total
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-white text-right" style={{ border: '1px solid #334155' }}>
                    {formatCurrency(invoice.total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Amount in Words */}
        <div className="mb-6">
          <p className="text-sm font-medium text-black">
            Amount in Words: <span className="font-normal">{numberToWords(invoice.total)}</span>
          </p>
        </div>

        {/* Notes and Terms */}
        {(invoice.notes || invoice.terms) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {invoice.notes && (
              <div>
                <h4 className="text-sm font-medium text-black mb-2" style={{ color: '#000000' }}>Notes:</h4>
                <p className="text-xs text-black" style={{ color: '#000000' }}>{invoice.notes}</p>
              </div>
            )}

            {invoice.terms && (
              <div>
                <h4 className="text-sm font-medium text-black mb-2" style={{ color: '#000000' }}>Terms & Conditions:</h4>
                <p className="text-xs text-black" style={{ color: '#000000' }}>{invoice.terms}</p>
              </div>
            )}
          </div>
        )}

        {/* Bank Details */}
        {company.bankDetails && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-black mb-2" style={{ color: '#000000' }}>Bank Details:</h4>
            <div className="text-xs text-black grid grid-cols-2 gap-4" style={{ color: '#000000' }}>
              <div>
                <p><strong>Bank Name:</strong> {company.bankDetails.bankName}</p>
                <p><strong>Account Holder:</strong> {company.bankDetails.accountHolderName}</p>
              </div>
              <div>
                <p><strong>Account Number:</strong> {company.bankDetails.accountNumber}</p>
                <p><strong>IFSC Code:</strong> {company.bankDetails.ifscCode}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t bottom-0 pt-4" style={{ borderTopColor: '#334155', borderTopWidth: '1px', borderStyle: 'solid' }}>
          <div className="flex justify-between items-center">
            <div className="text-xs text-black">
              <p>This is a computer-generated invoice and does not require a signature.</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-black mb-8">
                For {company.name}
              </div>
              <div className="border-t pt-2 text-xs text-black" style={{ borderTop: '1px solid #475569' }}>
                Authorized Signatory
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

InvoicePreview.displayName = 'InvoicePreview';

export default InvoicePreview;