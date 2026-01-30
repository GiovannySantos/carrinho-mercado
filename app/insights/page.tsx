'use client';

import { useEffect, useMemo, useState } from 'react';
import InsightsCharts, { InsightData, PriceHistory } from '../../components/InsightsCharts';
import { Cart, Item } from '../../lib/types';
import { getAllLocalCarts, getAllLocalItems } from '../../lib/localStore';
import { formatCents } from '../../lib/money';

const groupBy = <T, K extends string>(items: T[], getKey: (item: T) => K) => {
  return items.reduce((acc, item) => {
    const key = getKey(item);
    acc[key] = acc[key] ?? [];
    acc[key].push(item);
    return acc;
  }, {} as Record<K, T[]>);
};

export default function InsightsPage() {
  const [monthFilter, setMonthFilter] = useState('');
  const [carts, setCarts] = useState<Cart[]>([]);
  const [itemsByCart, setItemsByCart] = useState<Record<string, Item[]>>({});
  const [productKey, setProductKey] = useState('');

  useEffect(() => {
    getAllLocalCarts().then(setCarts);
    getAllLocalItems().then(setItemsByCart);
  }, []);

  const monthCarts = useMemo(() => {
    if (!monthFilter) return [] as Cart[];
    return carts.filter((cart) => cart.status === 'CLOSED' && cart.date.startsWith(monthFilter));
  }, [carts, monthFilter]);

  const monthItems = useMemo(() => {
    const items: Item[] = [];
    monthCarts.forEach((cart) => {
      items.push(...(itemsByCart[cart.id] ?? []));
    });
    return items;
  }, [monthCarts, itemsByCart]);

  const totalCents = useMemo(
    () => monthCarts.reduce((sum, cart) => sum + cart.totalCents, 0),
    [monthCarts]
  );

  const topProductsByValue = useMemo<InsightData[]>(() => {
    const grouped = groupBy(monthItems, (item) => item.productKey);
    return Object.entries(grouped)
      .map(([key, items]) => ({
        label: key,
        value: items.reduce((sum, item) => sum + item.totalCents, 0)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [monthItems]);

  const topProductsByQuantity = useMemo<InsightData[]>(() => {
    const grouped = groupBy(monthItems, (item) => item.productKey);
    return Object.entries(grouped)
      .map(([key, items]) => ({
        label: key,
        value: items.reduce((sum, item) => sum + item.quantity, 0)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [monthItems]);

  const topCategories = useMemo<InsightData[]>(() => {
    const grouped = groupBy(monthItems, (item) => (item.category ?? 'Sem categoria'));
    return Object.entries(grouped)
      .map(([key, items]) => ({
        label: key,
        value: items.reduce((sum, item) => sum + item.totalCents, 0)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [monthItems]);

  const productOptions = useMemo(() => {
    const unique = new Set(monthItems.map((item) => item.productKey));
    return Array.from(unique).sort();
  }, [monthItems]);

  const priceHistory = useMemo<PriceHistory[]>(() => {
    if (!productKey) return [];
    const history = monthItems
      .filter((item) => item.productKey === productKey)
      .map((item) => ({
        date: item.createdAt.slice(0, 10),
        value: item.unitPriceCents
      }))
      .sort((a, b) => (a.date > b.date ? 1 : -1));
    return history;
  }, [monthItems, productKey]);

  const bestPrice = useMemo(() => {
    if (!priceHistory.length) return null;
    const best = priceHistory.reduce((min, entry) => (entry.value < min.value ? entry : min));
    return best;
  }, [priceHistory]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Insights mensais</h1>
        <p className="text-sm text-slate-500">Selecione um mês para gerar os insights.</p>
      </header>
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 md:flex-row md:items-center">
        <label className="text-sm text-slate-600">
          Mês
          <input
            type="month"
            value={monthFilter}
            onChange={(event) => setMonthFilter(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <div>
          <p className="text-xs text-slate-500">Total gasto no mês</p>
          <p className="text-xl font-semibold">{formatCents(totalCents)}</p>
        </div>
      </div>
      <InsightsCharts
        topProductsByValue={topProductsByValue}
        topProductsByQuantity={topProductsByQuantity}
        topCategories={topCategories}
        priceHistory={priceHistory}
      />
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-4 text-sm font-semibold">Comparador de produto</h3>
        <select
          value={productKey}
          onChange={(event) => setProductKey(event.target.value)}
          className="mb-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">Selecione um produto</option>
          {productOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {bestPrice ? (
          <div className="text-sm text-slate-600">
            Melhor preço: {formatCents(bestPrice.value)} em {bestPrice.date}
          </div>
        ) : (
          <div className="text-sm text-slate-500">Sem dados para o produto selecionado.</div>
        )}
      </section>
    </div>
  );
}
