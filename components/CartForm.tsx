'use client';

import { useRef, useState } from 'react';
import { Item } from '../lib/types';
import { normalizeProductKey } from '../lib/normalize';
import { calculateTotalCents, parseMoneyToCents, parseQuantityToThousandths } from '../lib/money';

type Props = {
  onAdd: (item: Item) => void;
  cartId: string;
};

const emptyForm = {
  productName: '',
  unitPrice: '',
  quantity: '1',
  quantityType: 'UNIT',
  store: '',
  brand: '',
  category: ''
};

export default function CartForm({ onAdd, cartId }: Props) {
  const [form, setForm] = useState(emptyForm);
  const productRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.productName.trim()) return;
    const unitPriceCents = parseMoneyToCents(form.unitPrice);
    const quantityThousandths = parseQuantityToThousandths(form.quantity);
    const quantity = quantityThousandths / 1000;
    const totalCents = calculateTotalCents(unitPriceCents, quantityThousandths);

    const now = new Date().toISOString();
    const productKey = normalizeProductKey(
      `${form.productName}${form.brand ? `|${form.brand}` : ''}`
    );

    onAdd({
      id: crypto.randomUUID(),
      cartId,
      productName: form.productName.trim(),
      productKey,
      category: form.category.trim() || undefined,
      store: form.store.trim() || undefined,
      brand: form.brand.trim() || undefined,
      quantity,
      quantityType: form.quantityType as 'UNIT' | 'WEIGHT',
      unitPriceCents,
      totalCents,
      createdAt: now,
      updatedAt: now,
      clientUpdatedAt: now
    });

    setForm({ ...emptyForm, quantity: form.quantity });
    productRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <input
          ref={productRef}
          value={form.productName}
          onChange={(event) => handleChange('productName', event.target.value)}
          placeholder="Produto"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          required
        />
        <input
          value={form.brand}
          onChange={(event) => handleChange('brand', event.target.value)}
          placeholder="Marca"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <input
          value={form.unitPrice}
          onChange={(event) => handleChange('unitPrice', event.target.value)}
          placeholder="Preço unitário (ex: 12,90)"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          value={form.quantity}
          onChange={(event) => handleChange('quantity', event.target.value)}
          placeholder="Quantidade"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <select
          value={form.quantityType}
          onChange={(event) => handleChange('quantityType', event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="UNIT">Unidade</option>
          <option value="WEIGHT">Peso</option>
        </select>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <input
          value={form.store}
          onChange={(event) => handleChange('store', event.target.value)}
          placeholder="Loja"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          value={form.category}
          onChange={(event) => handleChange('category', event.target.value)}
          placeholder="Categoria"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Adicionar item
        </button>
      </div>
    </form>
  );
}
