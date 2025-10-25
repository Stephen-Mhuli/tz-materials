"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuthContext } from "@/context/AuthContext";
import {
  createProduct,
  deleteProduct,
  fetchMyProducts,
  fetchSellerProfile,
  type CreateProductPayload,
  updateProduct,
} from "@/lib/api";
import type { Product, Seller } from "@/lib/types";

export default function NewProductPage() {
  return (
    <AuthGuard roles={["seller_admin", "seller_staff"]}>
      <ProductComposer />
    </AuthGuard>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

function ProductComposer() {
  const { tokens } = useAuthContext();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const [form, setForm] = useState<CreateProductPayload>({
    name: "",
    category: "",
    description: "",
    unit: "",
    price: 0,
    stock: 0,
    brand: "",
  });

  useEffect(() => {
    if (!tokens?.access) return;

    const load = async () => {
      try {
        setLoading(true);
        const [sellerRecords] = await Promise.all([
          fetchSellerProfile(tokens.access),
        ]);
        if (sellerRecords.length === 0) {
          setError(
            "No seller profile found. Create one first from the Seller Tools page.",
          );
          return;
        }
        const sellerRecord = sellerRecords[0];
        setSeller(sellerRecord);
        const myProducts = await fetchMyProducts(tokens.access, sellerRecord.id);
        setProducts(myProducts);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load seller/products.",
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [tokens?.access]);

  const inventoryMetrics = useMemo(() => {
    if (products.length === 0) {
      return { totalCount: 0, totalStock: 0, totalValue: 0 };
    }
    const totalCount = products.length;
    const totalStock = products.reduce(
      (sum, product) => sum + Number(product.stock ?? 0),
      0,
    );
    const totalValue = products.reduce(
      (sum, product) => sum + Number(product.price ?? 0) * Number(product.stock ?? 0),
      0,
    );
    return { totalCount, totalStock, totalValue };
  }, [products]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tokens?.access) return;
    setSaving(true);
    setSuccessMessage(null);
    setError(null);
    try {
      const payload: CreateProductPayload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      };
      if (editingProductId) {
        const updated = await updateProduct(tokens.access, editingProductId, payload);
        setProducts((prev) =>
          prev.map((product) =>
            product.id === editingProductId ? { ...updated } : product,
          ),
        );
        setSuccessMessage(`Product "${updated.name}" updated.`);
        setEditingProductId(null);
      } else {
        const created = await createProduct(tokens.access, payload);
        setProducts((prev) => [created, ...prev]);
        setSuccessMessage(`Product "${created.name}" published.`);
      }
      setForm({
        name: "",
        category: "",
        description: "",
        unit: "",
        price: 0,
        stock: 0,
        brand: "",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : editingProductId
            ? "Failed to update product."
            : "Failed to create product.",
      );
    } finally {
      setSaving(false);
    }
  };

  const beginEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setSuccessMessage(null);
    setError(null);
    setForm({
      name: product.name,
      category: product.category,
      description: product.description ?? "",
      unit: product.unit,
      price: Number(product.price),
      stock: Number(product.stock),
      brand: product.brand ?? "",
    });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    setSuccessMessage(null);
    setError(null);
    setForm({
      name: "",
      category: "",
      description: "",
      unit: "",
      price: 0,
      stock: 0,
      brand: "",
    });
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!tokens?.access) return;
    setDeletingProductId(productId);
    setError(null);
    setSuccessMessage(null);
    try {
      await deleteProduct(tokens.access, productId);
      setProducts((prev) => prev.filter((product) => product.id !== productId));
      if (editingProductId === productId) {
        cancelEdit();
      }
      setSuccessMessage("Product removed.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete product.",
      );
    } finally {
      setDeletingProductId(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] p-6 text-sm text-muted shadow-soft">
        Loading seller data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-300 bg-red-500/10 p-6 text-sm text-red-600">
        {error}{" "}
        <Link href="/seller" className="font-semibold text-[color:var(--brand)]">
          Manage seller profile
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <motion.header initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Catalogue</p>
        <h1 className="text-3xl font-semibold text-primary">Publish a new product</h1>
        {seller && (
          <p className="mt-1 text-sm text-muted">
            Products will belong to <span className="font-semibold text-primary">{seller.business_name}</span>.
          </p>
        )}
      </motion.header>

      {inventoryMetrics.totalCount > 0 && (
        <motion.section
          className="grid gap-4 sm:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
        >
          <MetricCard title="Products" value={inventoryMetrics.totalCount} subtitle="Active catalogue entries" />
          <MetricCard
            title="Units on hand"
            value={inventoryMetrics.totalStock.toLocaleString()}
            subtitle="Aggregated available stock"
          />
          <MetricCard
            title="Inventory value (TZS)"
            value={inventoryMetrics.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            subtitle="Stock × price snapshot"
          />
        </motion.section>
      )}

      <motion.form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] p-6 shadow-soft"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {editingProductId && (
            <div className="sm:col-span-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Editing product – updates will be applied to the selected item.
              <button
                type="button"
                onClick={cancelEdit}
                className="ml-3 inline-flex items-center rounded border border-amber-300 px-2 py-0.5 text-[11px] font-semibold text-amber-700 transition hover:bg-amber-100"
              >
                Cancel edit
              </button>
            </div>
          )}
          <InputField
            label="Product name"
            required
            value={form.name}
            onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
            placeholder="Cement Bag 50kg"
            className="sm:col-span-2"
          />
          <InputField
            label="Category"
            required
            value={form.category}
            onChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
            placeholder="cement"
          />
          <InputField
            label="Brand"
            value={form.brand ?? ""}
            onChange={(value) => setForm((prev) => ({ ...prev, brand: value }))}
            placeholder="Twiga"
          />
          <InputField
            label="Unit"
            required
            value={form.unit}
            onChange={(value) => setForm((prev) => ({ ...prev, unit: value }))}
            placeholder="bag"
          />
          <InputField
            label="Price (TZS)"
            required
            type="number"
            min="0"
            value={String(form.price)}
            onChange={(value) => setForm((prev) => ({ ...prev, price: Number(value) }))}
          />
          <InputField
            label="Stock quantity"
            required
            type="number"
            min="0"
            value={String(form.stock)}
            onChange={(value) => setForm((prev) => ({ ...prev, stock: Number(value) }))}
          />
          <InputField
            label="Short description"
            value={form.description ?? ""}
            onChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
            placeholder="High-quality Portland cement suitable for structural works."
            multiline
            className="sm:col-span-2"
          />
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mt-4 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
            {successMessage}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center rounded-full bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:scale-[1.01] hover:shadow-strong disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[color:var(--brand-strong)]"
          >
            {saving
              ? editingProductId
                ? "Updating product..."
                : "Publishing..."
              : editingProductId
                ? "Save changes"
                : "Publish product"}
          </button>
          {editingProductId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="inline-flex items-center rounded-full border border-[color:var(--border-muted)] px-4 py-2 text-sm font-semibold text-primary transition hover:bg-brand-soft"
            >
              Cancel edit
            </button>
          )}
        </div>
      </motion.form>

      <motion.section
        className="space-y-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">Your published products</h2>
          {products.length > 0 && (
            <p className="text-sm text-muted">
              {products.length} listing{products.length === 1 ? "" : "s"} visible in the catalogue
            </p>
          )}
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[color:var(--border-muted)] bg-[color:var(--surface)] p-10 text-center text-sm text-muted">
            No products published yet. Once you publish inventory it will appear here automatically.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <motion.article
                key={product.id}
                className="flex flex-col overflow-hidden rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] shadow-soft transition hover:-translate-y-1 hover:shadow-strong"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.35 }}
              >
                <div className="relative h-32 w-full bg-brand-soft" />
                <div className="flex flex-1 flex-col gap-4 px-5 py-5">
                  <div>
                    <h3 className="text-lg font-semibold text-primary">{product.name}</h3>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">{product.category}</p>
                  </div>
                  <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-3 py-3 text-xs">
                    <p className="text-muted">Unit price</p>
                    <p className="text-sm font-semibold text-primary">{Number(product.price).toLocaleString()} TZS</p>
                  </div>
                  <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-3 py-3 text-xs">
                    <p className="text-muted">Stock</p>
                    <p className="text-sm font-semibold text-primary">{product.stock.toLocaleString()} units</p>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[color:var(--border-muted)] px-3 py-2 text-xs font-semibold text-primary transition hover:bg-brand-soft"
                    >
                      View product →
                    </Link>
                    <button
                      type="button"
                      onClick={() => beginEditProduct(product)}
                      className="inline-flex flex-1 items-center justify-center rounded-full border border-[color:var(--border-muted)] px-3 py-2 text-xs font-semibold text-primary transition hover:bg-brand-soft"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(product.id)}
                      className="inline-flex flex-1 items-center justify-center rounded-full border border-red-300 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-500/10"
                      disabled={deletingProductId === product.id}
                    >
                      {deletingProductId === product.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  required,
  multiline,
  type = "text",
  min,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  type?: string;
  min?: string;
  className?: string;
}) {
  return (
    <div className={className ? `space-y-2 ${className}` : "space-y-2"}>
      <label className="text-sm font-medium text-primary">
        {label}
        {required ? " *" : ""}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={3}
          className="mt-2 w-full rounded-xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-3 py-2 text-sm text-primary shadow-inner outline-none transition focus:border-[color:var(--brand-strong)] focus:ring-2 focus:ring-[color:var(--brand-soft)]"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          type={type}
          min={min}
          className="mt-2 w-full rounded-xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-3 py-2 text-sm text-primary shadow-inner outline-none transition focus:border-[color:var(--brand-strong)] focus:ring-2 focus:ring-[color:var(--brand-soft)]"
        />
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number;
  subtitle: string;
}) {
  return (
    <div className="rounded-3xl border border-[color:var(--border-muted)] bg-brand-soft px-5 py-6 shadow-soft">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-primary">{value}</p>
      <p className="text-xs text-muted">{subtitle}</p>
    </div>
  );
}
