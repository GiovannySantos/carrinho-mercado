'use client';

import { Item } from '../lib/types';
import { calculateTotalCents, formatCents, parseMoneyToCents, parseQuantityToThousandths } from '../lib/money';

const quantityFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 3
});

type Props = {
  items: Item[];
  onUpdate: (item: Item) => void;
  onDelete: (id: string) => void;
  onDuplicate: (item: Item) => void;
  readonly: boolean;
};

export default function CartList({ items, onUpdate, onDelete, onDuplicate, readonly }: Props) {
  const handleInlineChange = (item: Item, field: keyof Item, value: string) => {
    const updated: Item = { ...item };
    if (field === 'unitPriceCents') {
      updated.unitPriceCents = parseMoneyToCents(value);
    } else if (field === 'quantity') {
      const quantityThousandths = parseQuantityToThousandths(value);
      updated.quantity = quantityThousandths / 1000;
    } else {
      (updated as any)[field] = value;
    }
    const quantityThousandths = parseQuantityToThousandths(updated.quantity);
    updated.totalCents = calculateTotalCents(updated.unitPriceCents, quantityThousandths);
    updated.clientUpdatedAt = new Date().toISOString();
    onUpdate(updated);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="grid grid-cols-7 gap-3 border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase text-slate-500">
        <span>Produto</span>
        <span>Preço</span>
        <span>Qtd</span>
        <span>Tipo</span>
        <span>Loja</span>
        <span>Total</span>
        <span></span>
      </div>
      {items.length === 0 ? (
        <div className="px-4 py-6 text-sm text-slate-500">Nenhum item adicionado.</div>
      ) : (
        items.map((item) => (
          <div key={item.id} className="grid grid-cols-7 items-center gap-3 border-b border-slate-100 px-4 py-3 text-sm">
            <input
              className="w-full rounded border border-slate-200 px-2 py-1"
              value={item.productName}
              disabled={readonly}
              onChange={(event) => handleInlineChange(item, 'productName', event.target.value)}
            />
            <input
              className="w-full rounded border border-slate-200 px-2 py-1"
              value={formatCents(item.unitPriceCents)}
              disabled={readonly}
              onChange={(event) => handleInlineChange(item, 'unitPriceCents', event.target.value)}
            />
            <input
              className="w-full rounded border border-slate-200 px-2 py-1"
              value={quantityFormatter.format(item.quantity)}
              disabled={readonly}
              onChange={(event) => handleInlineChange(item, 'quantity', event.target.value)}
            />
            <span>{item.quantityType === 'WEIGHT' ? 'Peso' : 'Unidade'}</span>
            <input
              className="w-full rounded border border-slate-200 px-2 py-1"
              value={item.store ?? ''}
              disabled={readonly}
              onChange={(event) => handleInlineChange(item, 'store', event.target.value)}
            />
            <span>{formatCents(item.totalCents)}</span>
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                className="rounded border border-slate-200 px-2 py-1"
                onClick={() => onDuplicate(item)}
                disabled={readonly}
              >
                Duplicar
              </button>
              <button
                type="button"
                className="rounded border border-rose-200 px-2 py-1 text-rose-600"
                onClick={() => onDelete(item.id)}
                disabled={readonly}
              >
                Remover
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
