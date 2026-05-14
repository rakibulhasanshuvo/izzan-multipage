"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import ProductEditorModal from "./ProductEditorModal";
import { toast } from "sonner";
import { createProduct, updateProduct, deleteProduct } from "@/app/(admin)/admin/actions";

import { Product } from "@/generated/client";

interface ProductManagementProps {
  initialProducts: Product[];
}

export default function ProductManagement({ initialProducts }: ProductManagementProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredProducts = initialProducts.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.categories.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "All" || p.categories.includes(categoryFilter);
    
    const matchesStatus = statusFilter === "All" || 
                          (statusFilter === "Active" ? p.stock > 0 : p.stock <= 0);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveWrapper = async (formData: Partial<Product>) => {
    await handleSave(formData as Product);
  };

  const handleSave = async (formData: Product) => {
    try {
      if (formData.id) {
        await updateProduct(formData);
      } else {
        await createProduct(formData);
      }

      toast.success(formData.id ? "Product updated" : "Product created");
      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Error saving product");
      console.error("Error handling product:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteProduct(id);

      toast.success("Product deleted");
      router.refresh();
    } catch (error) {
      toast.error("Error deleting product");
      console.error("Error handling product:", error);
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="font-serif text-[36px] text-zinc-900 dark:text-zinc-100 leading-tight mb-2">Inventory Management</h1>
          <p className="text-[16px] text-zinc-500 dark:text-zinc-400">
            Manage your boutique&apos;s products and stock levels.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-zinc-900 dark:bg-primary text-white px-6 py-3.5 rounded-full font-serif font-medium flex items-center gap-2 hover:bg-zinc-800 dark:hover:bg-primary-dark transition-all shadow-lg shadow-zinc-900/20 dark:shadow-primary/20 active:scale-95 group"
        >
          <span className="material-symbols-outlined group-hover:rotate-90 transition-transform duration-300">add</span>
          New Product
        </button>
      </div>

      {/* Filters & Search */}
      <div className="relative z-20 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-3xl rounded-2xl p-4 border border-white dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-wrap gap-4 items-center justify-between mb-8 transition-colors duration-300">
        <div className="flex gap-4 items-center flex-1 min-w-[300px]">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">search</span>
            <input
              aria-label="Search products"
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-xl pl-11 pr-4 py-2.5 text-[14px] text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
            />
          </div>
          <div className="relative">
            <button 
              aria-label="Toggle filters"
              aria-expanded={showFilters}
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 border rounded-xl text-[14px] font-medium transition-colors shadow-sm relative",
                showFilters || categoryFilter !== "All" || statusFilter !== "All" 
                  ? "bg-zinc-900 dark:bg-primary text-white border-zinc-900 dark:border-primary hover:bg-zinc-800 dark:hover:bg-primary-dark" 
                  : "bg-zinc-50 dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
              )}
            >
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filters
              {(categoryFilter !== "All" || statusFilter !== "All") && (
                <span className="w-2.5 h-2.5 rounded-full bg-primary absolute -top-1 -right-1 border-2 border-white dark:border-zinc-900"></span>
              )}
            </button>
            
            {showFilters && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-none border border-zinc-100 dark:border-zinc-800 p-5 z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="mb-5">
                  <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block mb-2">Category</label>
                  <select 
                    aria-label="Filter by category"
                    value={categoryFilter} 
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-[13px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    <option value="Best Sellers">Best Sellers</option>
                    <option value="New Arrivals">New Arrivals</option>
                    <option value="Sale">Sale</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block mb-2">Status</label>
                  <select 
                    aria-label="Filter by status"
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-[13px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active (In Stock)</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
                {(categoryFilter !== "All" || statusFilter !== "All") && (
                  <button 
                    onClick={() => { setCategoryFilter("All"); setStatusFilter("All"); }}
                    className="w-full mt-4 text-[12px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 py-1 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <span className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 px-4 py-1.5 rounded-full border border-zinc-100 dark:border-zinc-800">{filteredProducts.length} Products Found</span>
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-3xl rounded-3xl border border-white dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/80 border-b border-zinc-100 dark:border-zinc-800">
                <th className="text-[12px] text-zinc-500 dark:text-zinc-400 py-4 px-6 font-semibold uppercase tracking-widest">Product</th>
                <th className="text-[12px] text-zinc-500 dark:text-zinc-400 py-4 px-6 font-semibold uppercase tracking-widest">Category</th>
                <th className="text-[12px] text-zinc-500 dark:text-zinc-400 py-4 px-6 font-semibold uppercase tracking-widest text-right">Price</th>
                <th className="text-[12px] text-zinc-500 dark:text-zinc-400 py-4 px-6 font-semibold uppercase tracking-widest text-center">Stock</th>
                <th className="text-[12px] text-zinc-500 dark:text-zinc-400 py-4 px-6 font-semibold uppercase tracking-widest text-center">Status</th>
                <th className="text-[12px] text-zinc-500 dark:text-zinc-400 py-4 px-6 font-semibold uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[15px] text-zinc-800 dark:text-zinc-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors border-b border-zinc-100/50 dark:border-zinc-800 last:border-0">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border border-zinc-200/50 dark:border-zinc-700 flex-shrink-0 shadow-sm relative bg-zinc-100 dark:bg-zinc-800">
                        <Image
                          src={product.img}
                          alt={product.name}
                          fill
                          sizes="56px"
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/5 rounded-2xl pointer-events-none"></div>
                      </div>
                      <div>
                        <div className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors">{product.name}</div>
                        <div className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5">{product.badge || "Standard"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2 flex-wrap">
                      {product.categories.split(",").map((cat) => (
                        <span key={cat} className="text-[12px] px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md text-zinc-600 dark:text-zinc-300 font-medium">
                          {cat.trim()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right font-medium text-zinc-900 dark:text-zinc-100">
                    ${product.price}
                    {product.originalPrice && product.originalPrice > 0 && (
                      <span className="text-[13px] text-zinc-400 dark:text-zinc-500 line-through ml-2 font-normal">${product.originalPrice}</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={cn("font-medium", product.stock < 10 ? "text-red-600 dark:text-red-400" : "text-zinc-700 dark:text-zinc-300")}>{product.stock}</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex px-3.5 py-1.5 rounded-full text-[11px] font-medium uppercase tracking-wider border ${
                      product.stock > 0 ? "bg-green-50 text-green-700 border-green-100/50 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50" : "bg-red-50 text-red-700 border-red-100/50 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50"
                    }`}>
                      {product.stock > 0 ? "Active" : "Out of Stock"}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        aria-label={`Edit ${product.name}`}
                        onClick={() => handleEdit(product)}
                        className="p-2.5 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm rounded-full text-zinc-500 dark:text-zinc-400 hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        aria-label={`Delete ${product.name}`}
                        onClick={() => handleDelete(product.id!)}
                        className="p-2.5 bg-white dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-red-950/30 border border-zinc-200 dark:border-zinc-700 shadow-sm hover:border-red-100 dark:hover:border-red-900/50 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProducts.length === 0 && (
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-inner border border-zinc-100 dark:border-zinc-800">
              <span className="material-symbols-outlined text-[40px] text-zinc-300 dark:text-zinc-700">inventory_2</span>
            </div>
            <h3 className="font-serif text-2xl text-zinc-900 dark:text-zinc-100 mb-2">No products found</h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-sm">We couldn&apos;t find any products matching your search criteria. Try adjusting your filters.</p>
          </div>
        )}
      </div>

      <ProductEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
        onSave={handleSaveWrapper}
      />
    </>
  );
}
