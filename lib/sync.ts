import { supabase } from './supabaseClient';
import { OutboxOp } from './types';
import { consumeOutboxOps, getLocalItemsByCartId, getOutboxOps, saveLocalItems } from './localStore';

const resolveConflict = async (cartId: string, serverItems: any[]) => {
  const localItems = await getLocalItemsByCartId(cartId);
  const merged = localItems.map((item) => {
    const serverItem = serverItems.find((server) => server.id === item.id);
    if (!serverItem) return item;
    return new Date(serverItem.client_updated_at) > new Date(item.clientUpdatedAt)
      ? {
          ...item,
          unitPriceCents: serverItem.unit_price_cents,
          totalCents: serverItem.total_cents,
          quantity: Number(serverItem.quantity),
          updatedAt: serverItem.updated_at,
          clientUpdatedAt: serverItem.client_updated_at
        }
      : item;
  });
  await saveLocalItems(cartId, merged);
};

export const syncOutbox = async ({
  session,
  online
}: {
  session: { user: { id: string } } | null;
  online: boolean;
}) => {
  if (!session || !online) return;

  const ops = await getOutboxOps();
  let processed = 0;

  for (const op of ops) {
    try {
      if (op.type === 'UPSERT_CART') {
        const cart = op.payload;
        await supabase
          .from('carts')
          .upsert({ ...cart, user_id: session.user.id }, { onConflict: 'id' });
      }

      if (op.type === 'UPSERT_ITEM') {
        const item = op.payload as any;
        await supabase
          .from('items')
          .upsert({ ...item, user_id: session.user.id }, { onConflict: 'id' });
        await supabase.from('price_history').insert({
          user_id: session.user.id,
          product_key: item.product_key,
          date: item.date,
          store: item.store,
          unit_price_cents: item.unit_price_cents
        });
      }

      if (op.type === 'DELETE_ITEM') {
        const { id } = op.payload as { id: string };
        await supabase.from('items').delete().eq('id', id);
      }

      if (op.type === 'CLOSE_CART') {
        const cart = op.payload;
        await supabase.from('carts').update(cart).eq('id', (cart as any).id);
      }

      if (op.type === 'REOPEN_CART') {
        const cart = op.payload;
        await supabase.from('carts').update(cart).eq('id', (cart as any).id);
      }

      if (op.type === 'UPSERT_ITEM') {
        const { cart_id } = op.payload as { cart_id: string };
        const { data } = await supabase.from('items').select('*').eq('cart_id', cart_id);
        if (data) {
          await resolveConflict(cart_id, data);
        }
      }

      processed += 1;
    } catch (error) {
      console.error('Sync failed', error);
      break;
    }
  }

  if (processed > 0) {
    await consumeOutboxOps(processed);
  }
};
