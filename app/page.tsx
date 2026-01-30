'use client';

import { useEffect, useMemo, useState } from 'react';
import CartForm from '../components/CartForm';
import CartList from '../components/CartList';
import { Cart, Item, OutboxOp } from '../lib/types';
import {
  enqueueOutboxOp,
  getLocalCartByDate,
  getLocalItemsByCartId,
  saveLocalCart,
  saveLocalItems
} from '../lib/localStore';
import { formatCents } from '../lib/money';
import { supabase } from '../lib/supabaseClient';
import { syncOutbox } from '../lib/sync';

const getToday = () => new Date().toISOString().slice(0, 10);

export default function HomePage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [undoItem, setUndoItem] = useState<Item | null>(null);
  const [sessionUser, setSessionUser] = useState<string | null>(null);
  const [online, setOnline] = useState(true);

  const totals = useMemo(() => {
    const totalCents = items.reduce((sum, item) => sum + item.totalCents, 0);
    return {
      totalCents,
      itemsCount: items.length
    };
  }, [items]);

  useEffect(() => {
    const init = async () => {
      const date = getToday();
      let localCart = await getLocalCartByDate(date);
      if (!localCart) {
        const now = new Date().toISOString();
        localCart = {
          id: crypto.randomUUID(),
          date,
          status: 'OPEN',
          totalCents: 0,
          itemsCount: 0,
          createdAt: now
        };
        await saveLocalCart(localCart);
        await enqueueOutboxOp({
          id: crypto.randomUUID(),
          type: 'UPSERT_CART',
          payload: {
            id: localCart.id,
            date: localCart.date,
            status: localCart.status,
            total_cents: localCart.totalCents,
            items_count: localCart.itemsCount
          },
          createdAt: now
        });
      }
      setCart(localCart);
      const localItems = await getLocalItemsByCartId(localCart.id);
      setItems(localItems);
    };
    init();
  }, []);

  useEffect(() => {
    const updateOnline = () => setOnline(navigator.onLine);
    updateOnline();
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);

    supabase.auth.getSession().then(({ data }) => {
      setSessionUser(data.session?.user.id ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user.id ?? null);
    });

    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!cart) return;
    const updatedCart = {
      ...cart,
      totalCents: totals.totalCents,
      itemsCount: totals.itemsCount
    };
    setCart(updatedCart);
    saveLocalCart(updatedCart);
  }, [cart?.id, totals.totalCents, totals.itemsCount]);

  useEffect(() => {
    if (!sessionUser) return;
    syncOutbox({ session: { user: { id: sessionUser } }, online });
  }, [sessionUser, online, items]);

  const persistItems = async (nextItems: Item[]) => {
    if (!cart) return;
    setItems(nextItems);
    await saveLocalItems(cart.id, nextItems);
  };

  const pushOutbox = async (type: OutboxOp['type'], payload: Record<string, unknown>) => {
    const op: OutboxOp = {
      id: crypto.randomUUID(),
      type,
      payload,
      createdAt: new Date().toISOString()
    };
    await enqueueOutboxOp(op);
  };

  const handleAddItem = async (item: Item) => {
    await persistItems([item, ...items]);
    await pushOutbox('UPSERT_ITEM', {
      ...item,
      cart_id: item.cartId,
      product_name: item.productName,
      product_key: item.productKey,
      unit_price_cents: item.unitPriceCents,
      total_cents: item.totalCents,
      quantity: item.quantity,
      quantity_type: item.quantityType,
      client_updated_at: item.clientUpdatedAt,
      date: cart?.date
    });
  };

  const handleUpdateItem = async (item: Item) => {
    const nextItems = items.map((existing) => (existing.id === item.id ? item : existing));
    await persistItems(nextItems);
    await pushOutbox('UPSERT_ITEM', {
      ...item,
      cart_id: item.cartId,
      product_name: item.productName,
      product_key: item.productKey,
      unit_price_cents: item.unitPriceCents,
      total_cents: item.totalCents,
      quantity: item.quantity,
      quantity_type: item.quantityType,
      client_updated_at: item.clientUpdatedAt,
      date: cart?.date
    });
  };

  const handleDeleteItem = async (id: string) => {
    const removed = items.find((item) => item.id === id) ?? null;
    setUndoItem(removed);
    const nextItems = items.filter((item) => item.id !== id);
    await persistItems(nextItems);
    await pushOutbox('DELETE_ITEM', { id });
  };

  const handleUndo = async () => {
    if (!undoItem) return;
    await handleAddItem(undoItem);
    setUndoItem(null);
  };

  const handleDuplicate = async (item: Item) => {
    const now = new Date().toISOString();
    const duplicate: Item = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      clientUpdatedAt: now
    };
    await handleAddItem(duplicate);
  };

  const handleCloseCart = async () => {
    if (!cart) return;
    const closedCart: Cart = {
      ...cart,
      status: 'CLOSED',
      closedAt: new Date().toISOString(),
      totalCents: totals.totalCents,
      itemsCount: totals.itemsCount
    };
    setCart(closedCart);
    await saveLocalCart(closedCart);
    await pushOutbox('CLOSE_CART', {
      id: closedCart.id,
      status: 'CLOSED',
      closed_at: closedCart.closedAt
    });
  };

  if (!cart) {
    return <p className="text-sm text-slate-500">Carregando carrinho...</p>;
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold">Carrinho do dia</h1>
        <p className="text-sm text-slate-500">{cart.date}</p>
      </section>
      {cart.status === 'OPEN' ? (
        <CartForm onAdd={handleAddItem} cartId={cart.id} />
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Carrinho encerrado. Você pode exportar no histórico.
        </div>
      )}
      <CartList
        items={items}
        onUpdate={handleUpdateItem}
        onDelete={handleDeleteItem}
        onDuplicate={handleDuplicate}
        readonly={cart.status === 'CLOSED'}
      />
      {undoItem && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
          <span>Item removido: {undoItem.productName}</span>
          <button className="text-slate-900 underline" onClick={handleUndo}>
            Desfazer
          </button>
        </div>
      )}
      <footer className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-500">Total</p>
          <p className="text-2xl font-semibold">{formatCents(totals.totalCents)}</p>
          <p className="text-xs text-slate-500">{totals.itemsCount} itens</p>
        </div>
        <button
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          onClick={handleCloseCart}
          disabled={cart.status === 'CLOSED'}
        >
          Encerrar carrinho
        </button>
      </footer>
    </div>
  );
}
