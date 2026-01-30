import localforage from 'localforage';
import { Cart, Item, OutboxOp } from './types';

const store = localforage.createInstance({
  name: 'carrinho-mercado'
});

const CARTS_KEY = 'localCartByDate';
const ITEMS_KEY = 'localItemsByCartId';
const OUTBOX_KEY = 'outboxOps';

export const getLocalCartByDate = async (date: string): Promise<Cart | null> => {
  const carts = (await store.getItem<Record<string, Cart>>(CARTS_KEY)) ?? {};
  return carts[date] ?? null;
};

export const getAllLocalCarts = async (): Promise<Cart[]> => {
  const carts = (await store.getItem<Record<string, Cart>>(CARTS_KEY)) ?? {};
  return Object.values(carts);
};

export const saveLocalCart = async (cart: Cart): Promise<void> => {
  const carts = (await store.getItem<Record<string, Cart>>(CARTS_KEY)) ?? {};
  carts[cart.date] = cart;
  await store.setItem(CARTS_KEY, carts);
};

export const getLocalItemsByCartId = async (cartId: string): Promise<Item[]> => {
  const items = (await store.getItem<Record<string, Item[]>>(ITEMS_KEY)) ?? {};
  return items[cartId] ?? [];
};

export const getAllLocalItems = async (): Promise<Record<string, Item[]>> => {
  return (await store.getItem<Record<string, Item[]>>(ITEMS_KEY)) ?? {};
};

export const saveLocalItems = async (cartId: string, items: Item[]): Promise<void> => {
  const itemsByCart = (await store.getItem<Record<string, Item[]>>(ITEMS_KEY)) ?? {};
  itemsByCart[cartId] = items;
  await store.setItem(ITEMS_KEY, itemsByCart);
};

export const enqueueOutboxOp = async (op: OutboxOp): Promise<void> => {
  const ops = (await store.getItem<OutboxOp[]>(OUTBOX_KEY)) ?? [];
  ops.push(op);
  await store.setItem(OUTBOX_KEY, ops);
};

export const getOutboxOps = async (): Promise<OutboxOp[]> => {
  return (await store.getItem<OutboxOp[]>(OUTBOX_KEY)) ?? [];
};

export const consumeOutboxOps = async (count: number): Promise<void> => {
  const ops = (await store.getItem<OutboxOp[]>(OUTBOX_KEY)) ?? [];
  ops.splice(0, count);
  await store.setItem(OUTBOX_KEY, ops);
};

export const clearLocalCache = async (): Promise<void> => {
  await store.removeItem(CARTS_KEY);
  await store.removeItem(ITEMS_KEY);
  await store.removeItem(OUTBOX_KEY);
};

export const exportLocalData = async (): Promise<Record<string, unknown>> => {
  const carts = (await store.getItem<Record<string, Cart>>(CARTS_KEY)) ?? {};
  const items = (await store.getItem<Record<string, Item[]>>(ITEMS_KEY)) ?? {};
  const outbox = (await store.getItem<OutboxOp[]>(OUTBOX_KEY)) ?? [];
  return { carts, items, outbox };
};

export const importLocalData = async (data: {
  carts?: Record<string, Cart>;
  items?: Record<string, Item[]>;
  outbox?: OutboxOp[];
}): Promise<void> => {
  await store.setItem(CARTS_KEY, data.carts ?? {});
  await store.setItem(ITEMS_KEY, data.items ?? {});
  await store.setItem(OUTBOX_KEY, data.outbox ?? []);
};
