'use client';

import { useState } from 'react';

interface Props {
  initialStatus: string;
  initialCompany: string;
  initialBio: string;
  initialRole: string;
  initialProjects: string;
  secret: string;
}

export default function StatusManager({ initialStatus, initialCompany, initialBio, initialRole, initialProjects, secret }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [company, setCompany] = useState(initialCompany);
  const [bio, setBio] = useState(initialBio);
  const [role, setRole] = useState(initialRole);
  const [projects, setProjects] = useState(initialProjects);
  const [loading, setLoading] = useState(false);

  const save = async (key: string, value: string) => {
    setLoading(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, secret }),
      });
      if (key === 'hire_status') setStatus(value);
      if (key === 'company_name') setCompany(value);
      if (key === 'bio') setBio(value);
      if (key === 'role') setRole(value);
      if (key === 'featured_projects') setProjects(value);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 border border-vscode-border rounded bg-vscode-sidebar/20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ... (Status e Company mantidos) ... */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-vscode-text/70 uppercase">Work Status</label>
          <select 
            value={status}
            onChange={(e) => save('hire_status', e.target.value)}
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
            onBlur={() => save('company_name', company)}
            placeholder="Ex: Google, Freelance, Startup..."
            className="w-full bg-vscode-bg border border-vscode-border p-2 rounded text-vscode-text outline-none focus:border-vscode-highlight"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-vscode-text/70 uppercase">Job Role / Subtitle</label>
        <input 
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          onBlur={() => save('role', role)}
          placeholder="Ex: Fullstack Developer | AI Engineering Student"
          className="w-full bg-vscode-bg border border-vscode-border p-2 rounded text-vscode-text outline-none focus:border-vscode-highlight"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-vscode-text/70 uppercase">Featured Projects (CSV, max 8)</label>
        <input 
          type="text"
          value={projects}
          onChange={(e) => setProjects(e.target.value)}
          onBlur={() => save('featured_projects', projects)}
          placeholder="user/repo, user/repo2..."
          className="w-full bg-vscode-bg border border-vscode-border p-2 rounded text-vscode-text outline-none focus:border-vscode-highlight font-mono text-sm"
        />
        <p className="text-[10px] text-vscode-comment italic">// Ex: Victor-Vaglieri/LiveFolio, Victor-Vaglieri/AppControle</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-vscode-text/70 uppercase">Profile Bio</label>
        <textarea 
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          onBlur={() => save('bio', bio)}
          placeholder="Conte um pouco sobre você..."
          rows={3}
          className="w-full bg-vscode-bg border border-vscode-border p-2 rounded text-vscode-text outline-none focus:border-vscode-highlight resize-none"
        />
      </div>
      
      <div className="flex items-center gap-2 text-xs text-vscode-comment italic">
        {loading ? 'Saving changes...' : '// Changes are saved automatically on change or blur.'}
      </div>
    </div>
  );
}
