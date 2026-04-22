'use client';

import { useState } from 'react';

interface Props {
  initialStatus: string;
  initialCompany: string;
  secret: string;
}

export default function StatusManager({ initialStatus, initialCompany, secret }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [company, setCompany] = useState(initialCompany);
  const [loading, setLoading] = useState(false);

  const save = async (newStatus: string, newCompany: string) => {
    setLoading(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'hire_status', value: newStatus, secret }),
      });
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'company_name', value: newCompany, secret }),
      });
      setStatus(newStatus);
      setCompany(newCompany);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 border border-vscode-border rounded bg-vscode-sidebar/20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-vscode-text/70 uppercase">Work Status</label>
          <select 
            value={status}
            onChange={(e) => save(e.target.value, company)}
            className="w-full bg-vscode-bg border border-vscode-border p-2 rounded text-vscode-text outline-none focus:border-vscode-highlight"
          >
            <option value="available">Available for Hire</option>
            <option value="open">Open to Opportunities</option>
            <option value="busy">Working / Busy</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-vscode-text/70 uppercase">Company Name</label>
          <input 
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            onBlur={() => save(status, company)}
            placeholder="Ex: Google, Freelance, Startup..."
            className="w-full bg-vscode-bg border border-vscode-border p-2 rounded text-vscode-text outline-none focus:border-vscode-highlight"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-vscode-comment italic">
        {loading ? 'Saving changes...' : '// Changes are saved automatically on change.'}
      </div>
    </div>
  );
}
