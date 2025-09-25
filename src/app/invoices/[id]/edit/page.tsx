"use client";

import { useState, useMemo, useEffect, use } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/MainLayout";
import { useAppContext } from "@/contexts/AppContext";
import { InvoiceFormData, InvoiceItem } from "@/types";
import { calculateInvoiceTotal, formatCurrency } from "@/utils/calculations";
import { format } from "date-fns";
import { ArrowLeft, Save, Plus, Minus, Eye, Building, Calculator } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditInvoicePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { invoices, companies, products, updateInvoice } = useAppContext();
  const invoice = invoices.find((inv) => inv.id === id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
    reset,
  } = useForm<InvoiceFormData>();

  useEffect(() => {
    if (invoice) {
      // Map existing invoice to form defaults
      reset({
        companyId: invoice.companyId,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: format(invoice.invoiceDate, "yyyy-MM-dd"),
        dueDate: format(invoice.dueDate, "yyyy-MM-dd"),
        placeOfSupply: invoice.placeOfSupply,
        billToName: invoice.billTo.name,
        billToGst: invoice.billTo.gst,
        billToStreet: invoice.billTo.address.street,
        billToCity: invoice.billTo.address.city,
        billToState: invoice.billTo.address.state,
        billToPincode: invoice.billTo.address.pincode,
        billToCountry: invoice.billTo.address.country,
        billToMobile: invoice.billTo.mobile,
        billToEmail: invoice.billTo.email,
        items: invoice.items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          rate: it.rate,
        })),
        discountType: invoice.discountType || "amount",
        discount: invoice.discount || 0,
        notes: invoice.notes || "",
        terms: invoice.terms || "",
      });
    }
  }, [invoice, reset]);

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const { fields: acFields, append: acAppend, remove: acRemove } = useFieldArray({ control, name: "additionalCharges" });

  const watched = watch();
  const selectedCompany = companies.find((c) => c.id === watched.companyId);

  // Ensure place of supply is defaulted if empty after changing company
  useEffect(() => {
    if (selectedCompany && !watched.placeOfSupply) {
      setValue("placeOfSupply", selectedCompany.address.state);
    }
  }, [selectedCompany, setValue, watched.placeOfSupply]);

  const calc = useMemo(() => {
    if (!selectedCompany) return null;
    const items: InvoiceItem[] = watched.items
      .filter((item) => item.productId)
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return null;
        const rate = item.rate ?? product.price;
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
      watched.discount || 0,
      watched.discountType || "amount",
      selectedCompany.address.state,
      watched.placeOfSupply,
      watched.additionalCharges || []
    );
  }, [watched, selectedCompany, products]);

  const onSubmit = async (data: InvoiceFormData) => {
    if (!invoice) return;
    if (!selectedCompany) {
      alert("Please select a company");
      return;
    }
    if (!calc) {
      alert("Please add at least one valid item");
      return;
    }

    setIsSubmitting(true);
    try {
      const items: InvoiceItem[] = data.items
        .filter((item) => item.productId)
        .map((item) => {
          const product = products.find((p) => p.id === item.productId)!;
          const rate = item.rate ?? product.price;
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

      const updates = {
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
        subtotal: calc.subtotal,
        totalTax: calc.totalTax,
        discount: calc.discount,
        discountType: data.discountType,
        additionalCharges: (data.additionalCharges || []).filter(c => c && c.name && c.amount != null),
        total: calc.total,
        notes: data.notes,
        terms: data.terms,
      } as const;

      updateInvoice(invoice.id, updates);
      router.push(`/invoices/${invoice.id}`);
    } catch (error) {
      console.error("Error updating invoice:", error);
      alert("Error updating invoice. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!invoice) {
    return (
      <MainLayout title="Invoice Not Found">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-6">We couldn't find that invoice.</p>
          <button
            onClick={() => router.push("/invoices")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="-ml-1 mr-2 h-5 w-5" /> Back to Invoices
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title={`Edit Invoice ${invoice.invoiceNumber}`}
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="-ml-1 mr-2 h-4 w-4" /> Back
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Save className="-ml-1 mr-2 h-4 w-4" /> {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: main form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Company selection */}
            <div className="bg-gray-800 shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Invoice From</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Company *</label>
                  <select
                    {...register("companyId", { required: "Company is required" })}
                    className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.companyId && <p className="mt-1 text-sm text-red-600">{errors.companyId.message}</p>}
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

            {/* Invoice details */}
            <div className="bg-gray-800 shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Invoice Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Invoice Number *</label>
                  <input
                    type="text"
                    {...register("invoiceNumber", { required: "Invoice number is required" })}
                    className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.invoiceNumber && <p className="mt-1 text-sm text-red-600">{errors.invoiceNumber.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Place of Supply *</label>
                  <input
                    type="text"
                    {...register("placeOfSupply", { required: "Place of supply is required" })}
                    className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.placeOfSupply && <p className="mt-1 text-sm text-red-600">{errors.placeOfSupply.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Invoice Date *</label>
                  <input
                    type="date"
                    {...register("invoiceDate", { required: "Invoice date is required" })}
                    className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.invoiceDate && <p className="mt-1 text-sm text-red-600">{errors.invoiceDate.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Due Date *</label>
                  <input
                    type="date"
                    {...register("dueDate", { required: "Due date is required" })}
                    className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>}
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="bg-gray-800 shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Bill To</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Client Name *</label>
                  <input
                    type="text"
                    {...register("billToName", { required: "Client name is required" })}
                    className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.billToName && <p className="mt-1 text-sm text-red-600">{errors.billToName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">GST Number</label>
                  <input
                    type="text"
                    {...register("billToGst")}
                    className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    style={{ textTransform: "uppercase" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Mobile</label>
                  <input type="tel" {...register("billToMobile")} className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Email</label>
                  <input type="email" {...register("billToEmail")} className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white mb-1">Street Address *</label>
                  <textarea {...register("billToStreet", { required: "Street address is required" })} rows={2} className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">City *</label>
                  <input type="text" {...register("billToCity", { required: "City is required" })} className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">State *</label>
                  <input type="text" {...register("billToState", { required: "State is required" })} className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Pincode *</label>
                  <input type="text" {...register("billToPincode", { required: "Pincode is required" })} className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Country *</label>
                  <input type="text" {...register("billToCountry", { required: "Country is required" })} className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
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
                <p className="text-sm text-white">No additional charges. Add if needed.</p>
              )}
              <div className="space-y-3">
                {acFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    <div className="md:col-span-6">
                      <label className="block text-sm font-medium text-white mb-1">Name</label>
                      <input
                        type="text"
                        {...register(`additionalCharges.${index}.name` as const)}
                        className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Shipping"
                      />
                    </div>
                    <div className="md:col-span-5">
                      <label className="block text-sm font-medium text-white mb-1">Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        {...register(`additionalCharges.${index}.amount` as const, { valueAsNumber: true })}
                        className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                  onClick={() => append({ productId: "", quantity: 1 })}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  <Plus className="-ml-1 mr-1 h-4 w-4" /> Add Item
                </button>
              </div>

              {fields.length === 0 && (
                <p className="text-sm text-white">No items. Add at least one item.</p>
              )}

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    <div className="md:col-span-5">
                      <label className="block text-sm font-medium text-white mb-1">Product</label>
                      <select
                        {...register(`items.${index}.productId` as const, { required: "Product is required" })}
                        className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a product</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.taxRate}% GST)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-white mb-1">Quantity</label>
                      <input
                        type="number"
                        min={1}
                        {...register(`items.${index}.quantity` as const, { valueAsNumber: true, min: 1 })}
                        className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-white mb-1">Rate (optional)</label>
                      <input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.rate` as const, { valueAsNumber: true })}
                        className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="md:col-span-1 flex">
                      <button type="button" onClick={() => remove(index)} className="mt-6 inline-flex items-center p-2 rounded-md text-red-700 bg-red-100 hover:bg-red-200">
                        <Minus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-gray-800 shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Notes & Terms</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Notes</label>
                  <textarea {...register("notes")} rows={3} className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Terms</label>
                  <textarea {...register("terms")} rows={3} className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Right: summary */}
          <div className="space-y-4">
            <div className="bg-gray-800 shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Summary</h3>
              {calc ? (
                <div className="space-y-2 text-sm text-white">
                  <div className="flex justify-between"><span>Subtotal</span><span>{calc.subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Total Tax</span><span>{calc.totalTax.toFixed(2)}</span></div>
                  {watched.discount ? (
                    <div className="flex justify-between"><span>Discount</span><span>-{calc.discount.toFixed(2)}</span></div>
                  ) : null}
                  <div className="flex justify-between font-semibold border-t border-gray-600 pt-2"><span>Total</span><span>{calc.total.toFixed(2)}</span></div>
                </div>
              ) : (
                <p className="text-sm text-gray-300">Add items to see totals</p>
              )}
            </div>
            <div className="bg-gray-800 shadow-sm rounded-lg p-6">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-600"
              >
                <Eye className="-ml-1 mr-2 h-4 w-4" /> {showPreview ? "Hide Preview" : "Show Preview"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pb-8">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </MainLayout>
  );
}
