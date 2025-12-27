"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuthContext } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
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

const CATEGORY_OPTIONS = [
  { value: "cement", labelKey: "category_cement" },
  { value: "steel", labelKey: "category_steel" },
  { value: "rebar", labelKey: "category_rebar" },
  { value: "structural-steel", labelKey: "category_structural_steel" },
  { value: "aggregates", labelKey: "category_aggregates" },
  { value: "sand", labelKey: "category_sand" },
  { value: "gravel", labelKey: "category_gravel" },
  { value: "crushed-stone", labelKey: "category_crushed_stone" },
  { value: "blocks", labelKey: "category_blocks" },
  { value: "bricks", labelKey: "category_bricks" },
  { value: "equipment", labelKey: "category_equipment" },
  { value: "scaffolding", labelKey: "category_scaffolding" },
  { value: "finishes", labelKey: "category_finishes" },
  { value: "lumber", labelKey: "category_lumber" },
  { value: "tiles", labelKey: "category_tiles" },
  { value: "roofing", labelKey: "category_roofing" },
  { value: "flooring", labelKey: "category_flooring" },
  { value: "paint", labelKey: "category_paint" },
  { value: "doors", labelKey: "category_doors" },
  { value: "windows", labelKey: "category_windows" },
  { value: "glass", labelKey: "category_glass" },
  { value: "plumbing", labelKey: "category_plumbing" },
  { value: "electrical", labelKey: "category_electrical" },
  { value: "lighting", labelKey: "category_lighting" },
  { value: "sanitary", labelKey: "category_sanitary" },
  { value: "pipes", labelKey: "category_pipes" },
  { value: "insulation", labelKey: "category_insulation" },
  { value: "waterproofing", labelKey: "category_waterproofing" },
  { value: "adhesives", labelKey: "category_adhesives" },
  { value: "sealants", labelKey: "category_sealants" },
  { value: "hardware", labelKey: "category_hardware" },
  { value: "fasteners", labelKey: "category_fasteners" },
  { value: "tools", labelKey: "category_tools" },
  { value: "landscaping", labelKey: "category_landscaping" },
  { value: "road-works", labelKey: "category_road_works" },
];

function ProductComposer() {
  const { tokens } = useAuthContext();
  const { t } = useLocale();
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
            t("product_new_missing_seller"),
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
            : t("product_new_load_failed"),
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
        setSuccessMessage(t("product_new_updated", { name: updated.name }));
        setEditingProductId(null);
      } else {
        const created = await createProduct(tokens.access, payload);
        setProducts((prev) => [created, ...prev]);
        setSuccessMessage(t("product_new_published", { name: created.name }));
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
            ? t("product_new_update_failed")
            : t("product_new_create_failed"),
      );
    } finally {
      setSaving(false);
    }
  };

  const categoryOptions = useMemo(() => {
    if (!form.category) return CATEGORY_OPTIONS;
    const exists = CATEGORY_OPTIONS.some(
      (option) => option.value === form.category,
    );
    if (exists) return CATEGORY_OPTIONS;
    return [
      { value: form.category, labelKey: form.category },
      ...CATEGORY_OPTIONS,
    ];
  }, [form.category]);

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
      setSuccessMessage(t("product_new_removed"));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("product_new_delete_failed"),
      );
    } finally {
      setDeletingProductId(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] p-6 text-sm text-muted shadow-soft">
        {t("product_new_loading")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-300 bg-red-500/10 p-6 text-sm text-red-600">
        {error}{" "}
        <Link href="/seller" className="font-semibold text-[color:var(--brand)]">
          {t("product_new_error_manage")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <motion.header initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          {t("product_new_badge")}
        </p>
        <h1 className="text-3xl font-semibold text-primary">
          {t("product_new_title")}
        </h1>
        {seller && (
          <p className="mt-1 text-sm text-muted">
            {t("product_new_belongs_prefix")}{" "}
            <span className="font-semibold text-primary">{seller.business_name}</span>.
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
          <MetricCard
            title={t("product_new_metric_products")}
            value={inventoryMetrics.totalCount}
            subtitle={t("product_new_metric_products_note")}
          />
          <MetricCard
            title={t("product_new_metric_units")}
            value={inventoryMetrics.totalStock.toLocaleString()}
            subtitle={t("product_new_metric_units_note")}
          />
          <MetricCard
            title={t("product_new_metric_value")}
            value={inventoryMetrics.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            subtitle={t("product_new_metric_value_note")}
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
              {t("product_new_editing_notice")}
              <button
                type="button"
                onClick={cancelEdit}
                className="ml-3 inline-flex items-center rounded border border-amber-300 px-2 py-0.5 text-[11px] font-semibold text-amber-700 transition hover:bg-amber-100"
              >
                {t("product_new_cancel_edit")}
              </button>
            </div>
          )}
          <InputField
            label={t("product_new_name_label")}
            required
            value={form.name}
            onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
            placeholder={t("product_new_name_placeholder")}
            className="sm:col-span-2"
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary">
              {t("product_new_category_label")} *
            </label>
            <select
              value={form.category}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, category: event.target.value }))
              }
              required
              className="mt-2 w-full rounded-xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-3 py-2 text-sm text-primary shadow-inner outline-none transition focus:border-[color:var(--brand-strong)] focus:ring-2 focus:ring-[color:var(--brand-soft)]"
            >
              <option value="" disabled>
                {t("category_select_placeholder")}
              </option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {"labelKey" in option ? t(option.labelKey) : option.value}
                </option>
              ))}
            </select>
          </div>
          <InputField
            label={t("product_new_brand_label")}
            value={form.brand ?? ""}
            onChange={(value) => setForm((prev) => ({ ...prev, brand: value }))}
            placeholder={t("product_new_brand_placeholder")}
          />
          <InputField
            label={t("product_new_unit_label")}
            required
            value={form.unit}
            onChange={(value) => setForm((prev) => ({ ...prev, unit: value }))}
            placeholder={t("product_new_unit_placeholder")}
          />
          <InputField
            label={t("product_new_price_label")}
            required
            type="number"
            min="0"
            value={String(form.price)}
            onChange={(value) => setForm((prev) => ({ ...prev, price: Number(value) }))}
          />
          <InputField
            label={t("product_new_stock_label")}
            required
            type="number"
            min="0"
            value={String(form.stock)}
            onChange={(value) => setForm((prev) => ({ ...prev, stock: Number(value) }))}
          />
          <InputField
            label={t("product_new_description_label")}
            value={form.description ?? ""}
            onChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
            placeholder={t("product_new_description_placeholder")}
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
                ? t("product_new_saving_update")
                : t("product_new_saving_create")
              : editingProductId
                ? t("product_new_save_changes")
                : t("product_new_publish")}
          </button>
          {editingProductId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="inline-flex items-center rounded-full border border-[color:var(--border-muted)] px-4 py-2 text-sm font-semibold text-primary transition hover:bg-brand-soft"
            >
              {t("product_new_cancel_edit")}
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
          <h2 className="text-lg font-semibold text-primary">
            {t("product_new_header_title")}
          </h2>
          {products.length > 0 && (
            <p className="text-sm text-muted">
              {t("product_new_header_count", {
                count: products.length,
                suffix: products.length === 1 ? "" : "s",
              })}
            </p>
          )}
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[color:var(--border-muted)] bg-[color:var(--surface)] p-10 text-center text-sm text-muted">
            {t("product_new_empty")}
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
                    <p className="text-muted">{t("product_new_unit_price")}</p>
                    <p className="text-sm font-semibold text-primary">{Number(product.price).toLocaleString()} TZS</p>
                  </div>
                  <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-3 py-3 text-xs">
                    <p className="text-muted">{t("product_new_stock")}</p>
                    <p className="text-sm font-semibold text-primary">
                      {product.stock.toLocaleString()} {t("units_label")}
                    </p>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[color:var(--border-muted)] px-3 py-2 text-xs font-semibold text-primary transition hover:bg-brand-soft"
                    >
                      {t("product_new_view")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => beginEditProduct(product)}
                      className="inline-flex flex-1 items-center justify-center rounded-full border border-[color:var(--border-muted)] px-3 py-2 text-xs font-semibold text-primary transition hover:bg-brand-soft"
                    >
                      {t("product_new_edit")}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(product.id)}
                      className="inline-flex flex-1 items-center justify-center rounded-full border border-red-300 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-500/10"
                      disabled={deletingProductId === product.id}
                    >
                      {deletingProductId === product.id
                        ? t("product_new_deleting")
                        : t("product_new_delete")}
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
