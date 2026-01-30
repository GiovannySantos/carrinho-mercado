'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function SyncBadge() {
  const [online, setOnline] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const updateOnline = () => setOnline(navigator.onLine);
    updateOnline();
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);

    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user.email ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null);
    });

    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="flex items-center gap-3 text-sm">
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${
          online ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
        }`}
      >
        {online ? 'Online' : 'Offline'}
      </span>
      <span className="text-slate-600">
        {userEmail ? `Logado: ${userEmail}` : 'Guest'}
      </span>
    </div>
  );
}
