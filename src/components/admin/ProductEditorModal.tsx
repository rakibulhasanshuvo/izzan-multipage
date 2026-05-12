"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Product } from "@/generated/client";

interface ProductEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (product: Partial<Product>) => void;
}

export default function ProductEditorModal({
  isOpen,
  onClose,
  product,
  onSave,
}: ProductEditorModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    originalPrice: null,
    img: "",
    hoverImg: "",
    categories: "",
    badge: "",
    stock: 100,
  });

  useEffect(() => {
    if (product) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(product);
    } else {
      setFormData({
        name: "",
        description: "",
        price: 0,
        originalPrice: null,
        img: "",
        hoverImg: "",
        categories: "",
        badge: "",
        stock: 100,
      });
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? (name === "price" || name === "stock" ? 0 : null) : 
                (name === "price" || name === "stock" || name === "originalPrice" ? parseFloat(value) : value),
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-zinc-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white/95 backdrop-blur-3xl rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-white/50 flex flex-col animate-in zoom-in-95 duration-500">
        {/* Header */}
        <div className="px-10 py-8 border-b border-zinc-100 flex justify-between items-center bg-white/50 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-light via-primary to-primary-dark"></div>
          <div>
            <h3 className="font-serif text-[32px] text-zinc-900 leading-tight">
              {product ? "Edit Product" : "New Product"}
            </h3>
            <p className="text-[15px] text-zinc-500 mt-1">Fill in the details for your boutique item.</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/50 rounded-full text-zinc-500 hover:text-zinc-900 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 bg-zinc-50/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left Column: Visuals */}
            <div className="space-y-8">
              <div>
                <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-widest mb-3 block">
                  Product Imagery
                </label>
                <div className="space-y-5">
                  <div className="aspect-square rounded-2xl bg-zinc-50 border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center overflow-hidden relative group transition-colors hover:bg-zinc-100/50 hover:border-zinc-300">
                    {formData.img ? (
                      <Image
                        src={formData.img}
                        alt="Preview"
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-white rounded-full shadow-sm border border-zinc-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-500">
                          <span className="material-symbols-outlined text-[28px] text-zinc-400 group-hover:text-primary transition-colors">add_photo_alternate</span>
                        </div>
                        <p className="text-[13px] font-medium text-zinc-500 group-hover:text-zinc-900 transition-colors">Primary Image URL</p>
                      </>
                    )}
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-[18px]">image</span>
                    <input
                      type="text"
                      name="img"
                      value={formData.img}
                      onChange={handleChange}
                      placeholder="Primary Image URL"
                      className="w-full bg-white border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-[14px] text-zinc-800 placeholder:text-zinc-400 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all shadow-sm"
                    />
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-[18px]">layers</span>
                    <input
                      type="text"
                      name="hoverImg"
                      value={formData.hoverImg || ""}
                      onChange={handleChange}
                      placeholder="Hover Image URL (Optional)"
                      className="w-full bg-white border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-[14px] text-zinc-800 placeholder:text-zinc-400 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Details */}
            <div className="space-y-8">
              <div className="space-y-5">
                <div>
                  <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-widest mb-2 block">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-[14px] text-zinc-800 placeholder:text-zinc-400 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-widest mb-2 block">Description</label>
                  <textarea
                    name="description"
                    value={formData.description || ""}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-[14px] text-zinc-800 placeholder:text-zinc-400 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none resize-none transition-all shadow-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-widest mb-2 block">Price ($)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-[14px] text-zinc-800 placeholder:text-zinc-400 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-widest mb-2 block">Sale Price ($)</label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice || ""}
                      onChange={handleChange}
                      className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-[14px] text-zinc-800 placeholder:text-zinc-400 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-widest mb-3 block">Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {["Best Sellers", "New Arrivals", "Sale"].map(category => {
                      const currentCategories = formData.categories ? formData.categories.split(',').map(c => c.trim()).filter(Boolean) : [];
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
                            setFormData({ ...formData, categories: newCategories.join(', ') });
                          }}
                          className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
                            isSelected 
                              ? "bg-zinc-900 text-white shadow-md" 
                              : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300"
                          }`}
                        >
                          {category}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-widest mb-2 block">Badge</label>
                    <input
                      type="text"
                      name="badge"
                      value={formData.badge || ""}
                      onChange={handleChange}
                      placeholder="e.g. New, Sale"
                      className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-[14px] text-zinc-800 placeholder:text-zinc-400 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-widest mb-2 block">Stock</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-[14px] text-zinc-800 placeholder:text-zinc-400 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-6 border-t border-zinc-100 flex justify-end gap-4 bg-white/50">
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-full border border-zinc-200 text-[14px] font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-8 py-3 rounded-full bg-zinc-900 text-white text-[14px] font-medium hover:bg-zinc-800 transition-all shadow-[0_4px_14px_rgba(0,0,0,0.15)] active:scale-95 group flex items-center gap-2"
          >
            {product ? "Update Product" : "Create Product"}
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
