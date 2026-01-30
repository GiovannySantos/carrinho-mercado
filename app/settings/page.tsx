'use client';

import { useState } from 'react';
import { clearLocalCache, exportLocalData, importLocalData } from '../../lib/localStore';

export default function SettingsPage() {
  const [status, setStatus] = useState('');

  const handleExport = async () => {
    const data = await exportLocalData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'carrinho-mercado-backup.json';
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus('Backup exportado.');
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    await importLocalData(JSON.parse(text));
    setStatus('Backup importado com sucesso.');
  };

  const handleClear = async () => {
    const confirmed = window.confirm('Tem certeza que deseja limpar o cache local?');
    if (!confirmed) return;
    await clearLocalCache();
    setStatus('Cache local limpo.');
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Configurações</h1>
        <p className="text-sm text-slate-500">Backup e limpeza do modo guest.</p>
      </header>
      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <button
          onClick={handleExport}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
        >
          Exportar JSON
        </button>
        <label className="text-sm text-slate-600">
          Importar JSON
          <input
            type="file"
            accept="application/json"
            onChange={handleImport}
            className="mt-2 block w-full text-sm"
          />
        </label>
        <button
          onClick={handleClear}
          className="rounded-lg border border-rose-200 px-4 py-2 text-sm text-rose-600"
        >
          Limpar cache local
        </button>
        {status && <p className="text-xs text-slate-500">{status}</p>}
      </div>
    </div>
  );
}
