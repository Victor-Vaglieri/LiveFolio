'use client';

import { useState } from 'react';

export default function HireToggle({ initialValue, secret }: { initialValue: boolean, secret: string }) {
  const [isHireable, setIsHireable] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          key: 'available_for_hire', 
          value: (!isHireable).toString(),
          secret 
        }),
      });
      if (res.ok) setIsHireable(!isHireable);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 border border-vscode-border rounded bg-vscode-sidebar/20">
      <div>
        <h3 className="font-bold">Status: Available for Hire</h3>
        <p className="text-sm text-vscode-comment">Controla a exibição da tag de disponibilidade na home.</p>
      </div>
      <button 
        onClick={toggle}
        disabled={loading}
        className={`ml-auto px-4 py-2 rounded font-bold transition-colors ${
          isHireable ? 'bg-vscode-success text-vscode-bg' : 'bg-vscode-border text-vscode-text'
        }`}
      >
        {loading ? 'Updating...' : (isHireable ? 'ENABLED' : 'DISABLED')}
      </button>
    </div>
  );
}
