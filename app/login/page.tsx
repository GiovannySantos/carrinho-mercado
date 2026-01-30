'use client';

import { supabase } from '../../lib/supabaseClient';

export default function LoginPage() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 rounded-xl border border-slate-200 bg-white p-6">
      <div>
        <h1 className="text-2xl font-semibold">Entrar</h1>
        <p className="text-sm text-slate-500">
          Conecte sua conta para sincronizar os dados com o Supabase.
        </p>
      </div>
      <button
        onClick={handleLogin}
        className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
      >
        Entrar com Google
      </button>
    </div>
  );
}
