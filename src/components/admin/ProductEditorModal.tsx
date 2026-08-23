"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ProductView as Product } from "@/lib/serialize";
import {
  productFormSchema,
  type ProductFormInput,
  type ProductFormOutput,
} from "@/lib/validation";

interface ProductEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (values: ProductFormOutput & { id?: string }) => void;
}

const DEFAULT_VALUES: ProductFormInput = {
  name: "",
  description: "",
  price: 0,
  originalPrice: null,
  img: "",
  hoverImg: "",
  categories: "",
  badge: "",
  stock: 100,
};

const inputClassName =
  "w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-[14px] text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all shadow-sm";

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-red-600 dark:text-red-400 mt-1">{message}</p> : null;

export default function ProductEditorModal({
  isOpen,
  onClose,
  product,
  onSave,
}: ProductEditorModalProps) {
  const [isUploadingImg, setIsUploadingImg] = useState(false);
  const [isUploadingHoverImg, setIsUploadingHoverImg] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductFormOutput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const categoriesValue = watch("categories") ?? "";

  useEffect(() => {
    if (!isOpen) return;
    if (product) {
      reset({
        name: product.name ?? "",
        description: product.description ?? "",
        price: product.price,
        originalPrice: product.originalPrice ?? null,
        img: product.img ?? "",
        hoverImg: product.hoverImg ?? "",
        categories: product.categories ?? "",
        badge: product.badge ?? "",
        stock: product.stock,
      });
    } else {
      reset(DEFAULT_VALUES);
    }
  }, [product, isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = (values: ProductFormOutput) => {
    onSave({ ...values, id: product?.id });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: "img" | "hoverImg") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (fieldName === "img") setIsUploadingImg(true);
    else setIsUploadingHoverImg(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload file");
      }

      setValue(fieldName, data.url, { shouldValidate: true });

      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error uploading image");
    } finally {
      if (fieldName === "img") setIsUploadingImg(false);
      else setIsUploadingHoverImg(false);
      // Reset input value so same file can be uploaded again if needed
      e.target.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-zinc-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-3xl rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-white/50 dark:border-zinc-800/50 flex flex-col animate-in zoom-in-95 duration-500">
        {/* Header */}
        <div className="px-10 py-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-white/50 dark:bg-zinc-900/50 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-light via-primary to-primary-dark"></div>
          <div>
            <h3 className="font-serif text-[32px] text-zinc-900 dark:text-zinc-100 leading-tight">
              {product ? "Edit Product" : "New Product"}
            </h3>
            <p className="text-[15px] text-zinc-500 dark:text-zinc-400 mt-1">Fill in the details for your boutique item.</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200/50 dark:border-zinc-700 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="contents">
          <div className="flex-1 overflow-y-auto p-10 bg-zinc-50/30 dark:bg-zinc-950/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Left Column: Visuals */}
              <div className="space-y-8">
                <div>
                  <label className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-3 block">
                    Product Imagery
                  </label>
                  <div className="space-y-5">
                    <div className="aspect-square rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center overflow-hidden relative group transition-colors hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-600">
                      {watch("img") ? (
                        <Image
                          src={watch("img")}
                          alt="Preview"
                          fill
                          sizes="(max-width: 768px) 100vw, 400px"
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-full shadow-sm border border-zinc-100 dark:border-zinc-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-500">
                            <span className="material-symbols-outlined text-[28px] text-zinc-400 dark:text-zinc-500 group-hover:text-primary transition-colors">add_photo_alternate</span>
                          </div>
                          <p className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">Primary Image URL</p>
                        </>
                      )}
                    </div>
                    <div className="relative group/upload">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 text-[18px]">image</span>
                      <input
                        type="text"
                        {...register("img")}
                        placeholder="Primary Image URL"
                        aria-invalid={!!errors.img}
                        className={`${inputClassName} pl-11 pr-24`}
                      />
                      <FieldError message={errors.img?.message} />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <label className="cursor-pointer bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors flex items-center gap-1">
                          {isUploadingImg ? (
                            <span className="material-symbols-outlined animate-spin text-[14px]">sync</span>
                          ) : (
                            <span className="material-symbols-outlined text-[14px]">upload</span>
                          )}
                          Upload
                          <input type="file" className="hidden" accept="image/*,video/*" onChange={(e) => handleFileUpload(e, "img")} disabled={isUploadingImg} />
                        </label>
                      </div>
                    </div>
                    <div className="relative group/upload">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 text-[18px]">layers</span>
                      <input
                        type="text"
                        {...register("hoverImg")}
                        placeholder="Hover Image URL (Optional)"
                        className={`${inputClassName} pl-11 pr-24`}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <label className="cursor-pointer bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors flex items-center gap-1">
                          {isUploadingHoverImg ? (
                            <span className="material-symbols-outlined animate-spin text-[14px]">sync</span>
                          ) : (
                            <span className="material-symbols-outlined text-[14px]">upload</span>
                          )}
                          Upload
                          <input type="file" className="hidden" accept="image/*,video/*" onChange={(e) => handleFileUpload(e, "hoverImg")} disabled={isUploadingHoverImg} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Details */}
              <div className="space-y-8">
                <div className="space-y-5">
                  <div>
                    <label className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">Name</label>
                    <input
                      type="text"
                      {...register("name")}
                      aria-invalid={!!errors.name}
                      className={inputClassName}
                    />
                    <FieldError message={errors.name?.message} />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">Description</label>
                    <textarea
                      {...register("description")}
                      rows={4}
                      className={`${inputClassName} resize-none`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">Price ($)</label>
                      <input
                        type="number"
                        step="any"
                        {...register("price")}
                        aria-invalid={!!errors.price}
                        className={inputClassName}
                      />
                      <FieldError message={errors.price?.message} />
                    </div>
                    <div>
                      <label className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">Sale Price ($)</label>
                      <input
                        type="number"
                        step="any"
                        {...register("originalPrice")}
                        aria-invalid={!!errors.originalPrice}
                        className={inputClassName}
                      />
                      <FieldError message={errors.originalPrice?.message} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-3 block">Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {["Best Sellers", "New Arrivals", "Sale"].map(category => {
                        const currentCategories = categoriesValue ? categoriesValue.split(',').map(c => c.trim()).filter(Boolean) : [];
                        const isSelected = currentCategories.includes(category);
                        return (
                          <button
                            key={category}
                            type="button"
                            onClick={() => {
                              let newCategories = [...currentCategories];
                              if (isSelected) {
                                newCategories = newCategories.filter(c => c !== category);
                              } else {
                                newCategories.push(category);
                              }
                              setValue("categories", newCategories.join(', '), { shouldValidate: true });
                            }}
                            className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
                              isSelected
                                ? "bg-zinc-900 dark:bg-primary text-white shadow-md"
                                : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600"
                            }`}
                          >
                            {category}
                          </button>
                        );
                      })}
                    </div>
                    <FieldError message={errors.categories?.message} />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">Badge</label>
                      <input
                        type="text"
                        placeholder="e.g. New, Sale"
                        {...register("badge")}
                        className={inputClassName}
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">Stock</label>
                      <input
                        type="number"
                        {...register("stock")}
                        aria-invalid={!!errors.stock}
                        className={inputClassName}
                      />
                      <FieldError message={errors.stock?.message} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-10 py-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-4 bg-white/50 dark:bg-zinc-900/50">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 rounded-full border border-zinc-200 dark:border-zinc-700 text-[14px] font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 rounded-full bg-zinc-900 dark:bg-primary text-white text-[14px] font-medium hover:bg-zinc-800 dark:hover:bg-primary-dark transition-all shadow-[0_4px_14px_rgba(0,0,0,0.15)] active:scale-95 group flex items-center gap-2"
            >
              {product ? "Update Product" : "Create Product"}
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
