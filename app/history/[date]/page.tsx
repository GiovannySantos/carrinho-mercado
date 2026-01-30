'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CartList from '../../../components/CartList';
import { Cart, Item, OutboxOp } from '../../../lib/types';
import {
  enqueueOutboxOp,
  getLocalCartByDate,
  getLocalItemsByCartId,
  saveLocalCart
} from '../../../lib/localStore';
import { formatCents } from '../../../lib/money';

export default function HistoryDetailPage() {
  const params = useParams<{ date: string }>();
  const [cart, setCart] = useState<Cart | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!params?.date) return;
      const data = await getLocalCartByDate(params.date);
      setCart(data);
      if (data) {
        const localItems = await getLocalItemsByCartId(data.id);
        setItems(localItems);
      }
    };
    load();
  }, [params]);

  const pushOutbox = async (type: OutboxOp['type'], payload: Record<string, unknown>) => {
    const op: OutboxOp = {
      id: crypto.randomUUID(),
      type,
      payload,
      createdAt: new Date().toISOString()
    };
    await enqueueOutboxOp(op);
  };

  const handleReopen = async () => {
    if (!cart) return;
    const updated: Cart = { ...cart, status: 'OPEN', closedAt: undefined };
    setCart(updated);
    await saveLocalCart(updated);
    await pushOutbox('REOPEN_CART', {
      id: updated.id,
      status: 'OPEN',
      closed_at: null
    });
  };

  const handleExportJSON = () => {
    const payload = { cart, items };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `carrinho-${cart?.date}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const header = [
      'product_name',
      'unit_price_cents',
      'quantity',
      'quantity_type',
      'store',
      'brand',
      'category',
      'total_cents'
    ];
    const rows = items.map((item) => [
      item.productName,
      item.unitPriceCents,
      item.quantity,
      item.quantityType,
      item.store ?? '',
      item.brand ?? '',
      item.category ?? '',
      item.totalCents
    ]);
    const csv = [header, ...rows].map((row) => row.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `carrinho-${cart?.date}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (!cart) {
    return <p className="text-sm text-slate-500">Carrinho não encontrado.</p>;
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Carrinho {cart.date}</h1>
          <p className="text-sm text-slate-500">Status: {cart.status}</p>
        </div>
        {cart.status === 'CLOSED' && (
          <button
            onClick={handleReopen}
            className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm"
          >
            Reabrir carrinho
          </button>
        )}
      </header>
      <CartList
        items={items}
        onUpdate={() => undefined}
        onDelete={() => undefined}
        onDuplicate={() => undefined}
        readonly={cart.status === 'CLOSED'}
      />
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
        <p className="text-sm text-slate-500">Total</p>
        <p className="text-xl font-semibold">{formatCents(cart.totalCents)}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleExportJSON}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          Exportar JSON
        </button>
        <button
          onClick={handleExportCSV}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          Exportar CSV
        </button>
      </div>
    </div>
  );
}
