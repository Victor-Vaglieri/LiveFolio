import { db } from '@/lib/db';
import { Table, BarChart2, ShieldCheck, Settings } from 'lucide-react';
import StatusManager from '@/components/StatusManager';
import { getAllSettings, initSettingsTable } from '@/lib/settings';

export const dynamic = 'force-dynamic';

async function getVisits() {
  const res = await db.query('SELECT * FROM visits ORDER BY created_at DESC LIMIT 100');
  return res.rows;
}

async function getStats() {
  const res = await db.query('SELECT source, COUNT(*) as count FROM visits GROUP BY source ORDER BY count DESC');
  return res.rows;
}

export default async function AdminTracking({
  searchParams,
}: {
  searchParams: { secret?: string };
}) {
  const secret = process.env.ADMIN_SECRET || 'projeto_livefolio_secret_123'; // TODO - usar variável de ambiente e não hardcoded
  
  if (searchParams.secret !== secret) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <ShieldCheck className="w-12 h-12 mx-auto text-red-500" />
          <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
          <p className="text-muted-foreground">Invalid secret provided.</p>
        </div>
      </div>
    );
  }

  await initSettingsTable();
  const visits = await getVisits();
  const stats = await getStats();
  const settings = await getAllSettings();

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto space-y-12 bg-vscode-bg text-vscode-text">
      <header className="border-b border-vscode-border pb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-vscode-highlight">Admin Dashboard</h1>
          <p className="text-vscode-comment mt-2">Visitor insights and system settings</p>
        </div>
      </header>

      {/* System Settings */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Settings className="w-5 h-5 text-vscode-highlight" /> System Settings
        </h2>
        <StatusManager 
          initialStatus={settings.hire_status || 'available'} 
          initialCompany={settings.company_name || ''} 
          secret={secret} 
        />
      </section>

      {/* Summary Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.source} className="p-4 border border-vscode-border rounded-lg bg-vscode-sidebar/20">
            <span className="text-xs text-vscode-comment uppercase font-semibold">{stat.source}</span>
            <div className="text-2xl font-bold mt-1 text-vscode-highlight">{stat.count}</div>
          </div>
        ))}
      </section>

      {/* Visits Table */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Table className="w-5 h-5 text-vscode-highlight" /> Detailed Logs
        </h2>
        <div className="border border-vscode-border rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-vscode-sidebar/40 text-vscode-comment uppercase text-xs font-medium border-b border-vscode-border">
              <tr>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">Path</th>
                <th className="px-4 py-3">User Agent</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vscode-border">
              {visits.map((visit) => (
                <tr key={visit.id} className="hover:bg-vscode-sidebar/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-vscode-string">{visit.source}</td>
                  <td className="px-4 py-3 font-mono text-xs">{visit.ip}</td>
                  <td className="px-4 py-3">{visit.path}</td>
                  <td className="px-4 py-3 truncate max-w-xs text-vscode-comment">{visit.user_agent}</td>
                  <td className="px-4 py-3 text-vscode-comment">
                    {new Date(visit.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
