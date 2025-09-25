"use client";

import { use, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/MainLayout";
import { useAppContext } from "@/contexts/AppContext";
import { ProductFormData } from "@/types";

interface PageProps { params: Promise<{ id: string }> }

export default function EditProductPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { products, updateProduct } = useAppContext();
  const product = products.find(p => p.id === id);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormData>();

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        hsnCode: product.hsnCode,
        price: product.price,
        taxRate: product.taxRate,
        unit: product.unit,
        category: product.category,
      });
    }
  }, [product, reset]);

  const onSubmit = (data: ProductFormData) => {
    if (!product) return;
    updateProduct(product.id, {
      name: data.name,
      description: data.description,
      hsnCode: data.hsnCode,
      price: data.price,
      taxRate: data.taxRate,
      unit: data.unit,
      category: data.category,
    });
    router.push("/products");
  };

  if (!product) {
    return (
      <MainLayout title="Product Not Found">
        <div className="text-center py-12">
          <p className="text-gray-600">We couldn't find that product.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`Edit Product`}>
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">Name *</label>
              <input type="text" {...register("name", { required: "Name is required" })} className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">HSN/SAC</label>
              <input type="text" {...register("hsnCode")} className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Price *</label>
              <input type="number" step="0.01" {...register("price", { valueAsNumber: true, required: "Price is required" })} className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">GST % *</label>
              <input type="number" step="0.01" {...register("taxRate", { valueAsNumber: true, required: "GST is required" })} className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              {errors.taxRate && <p className="mt-1 text-sm text-red-600">{errors.taxRate.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Unit *</label>
              <input type="text" {...register("unit", { required: "Unit is required" })} className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              {errors.unit && <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Category</label>
              <input type="text" {...register("category")} className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">Description</label>
            <textarea {...register("description")} rows={3} className="w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md text-sm text-white bg-blue-600 hover:bg-blue-700">Save Changes</button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
