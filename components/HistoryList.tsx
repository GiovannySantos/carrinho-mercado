'use client';

import Link from 'next/link';
import { Cart } from '../lib/types';
import { formatCents } from '../lib/money';

type Props = {
  carts: Cart[];
};

export default function HistoryList({ carts }: Props) {
  if (carts.length === 0) {
    return <p className="text-sm text-slate-500">Nenhum carrinho encontrado.</p>;
  }

  return (
    <div className="grid gap-3">
      {carts.map((cart) => (
        <Link
          key={cart.id}
          href={`/history/${cart.date}`}
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
        >
          <div>
            <p className="text-sm font-semibold">{cart.date}</p>
            <p className="text-xs text-slate-500">
              {cart.itemsCount} itens · {cart.status}
            </p>
          </div>
          <span className="text-sm font-semibold">{formatCents(cart.totalCents)}</span>
        </Link>
      ))}
    </div>
  );
}
