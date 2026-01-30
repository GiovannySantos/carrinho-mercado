'use client';

import { useEffect, useMemo, useState } from 'react';
import HistoryList from '../../components/HistoryList';
import { Cart } from '../../lib/types';
import { getAllLocalCarts } from '../../lib/localStore';

export default function HistoryPage() {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [monthFilter, setMonthFilter] = useState('');

  useEffect(() => {
    getAllLocalCarts().then((data) => {
      const sorted = data.sort((a, b) => (a.date < b.date ? 1 : -1));
      setCarts(sorted);
    });
  }, []);

  const filtered = useMemo(() => {
    if (!monthFilter) return carts;
    return carts.filter((cart) => cart.date.startsWith(monthFilter));
  }, [carts, monthFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Histórico</h1>
        <p className="text-sm text-slate-500">Filtre seus carrinhos por mês.</p>
      </div>
      <input
        type="month"
        value={monthFilter}
        onChange={(event) => setMonthFilter(event.target.value)}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      <HistoryList carts={filtered} />
    </div>
  );
}
