export type CartStatus = 'OPEN' | 'CLOSED';

export type Cart = {
  id: string;
  date: string;
  status: CartStatus;
  notes?: string;
  totalCents: number;
  itemsCount: number;
  createdAt: string;
  closedAt?: string;
};

export type Item = {
  id: string;
  cartId: string;
  productName: string;
  productKey: string;
  category?: string;
  store?: string;
  brand?: string;
  quantity: number;
  quantityType: 'UNIT' | 'WEIGHT';
  unitPriceCents: number;
  totalCents: number;
  createdAt: string;
  updatedAt: string;
  clientUpdatedAt: string;
};

export type OutboxOpType =
  | 'UPSERT_CART'
  | 'UPSERT_ITEM'
  | 'DELETE_ITEM'
  | 'CLOSE_CART'
  | 'REOPEN_CART';

export type OutboxOp = {
  id: string;
  type: OutboxOpType;
  payload: Record<string, unknown>;
  createdAt: string;
};
