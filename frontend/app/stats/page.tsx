import { redis } from '@/lib/redis';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getStats() {
  const repos = await redis.hgetall('stats:repos');
  const authors = await redis.hgetall('stats:authors');
  return { repos, authors };
}

export default async function StatsPage() {
  const { repos, authors } = await getStats();

  const totalEvents = Object.values(repos).reduce((a, b) => a + Number(b), 0);

  return (
    <div className="max-w-4xl mx-auto py-4 font-mono space-y-8">
      <div className="flex items-center gap-2 text-vscode-comment mb-4 border-b border-vscode-border pb-4">
        <span>// stats.json - Performance & Skill distribution</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Repo Chart Placeholder */}
        <section className="p-6 border border-vscode-border rounded-xl bg-vscode-sidebar/20 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-vscode-text">
            <BarChart3 className="w-5 h-5 text-blue-500" /> Repositories Activity
          </h2>
          <div className="space-y-4">
            {Object.entries(repos).map(([name, count]) => {
              const percentage = (Number(count) / totalEvents) * 100;
              return (
                <div key={name} className="space-y-2">
                  <div className="flex justify-between text-[13px]">
                    <span className="truncate text-vscode-highlight">{name}</span>
                    <span className="font-bold text-vscode-string">{count}</span>
                  </div>
                  <div className="w-full bg-vscode-border h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-vscode-statusBar h-full transition-all" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Author Chart Placeholder */}
        <section className="p-6 border border-vscode-border rounded-xl bg-vscode-sidebar/20 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-vscode-text">
            <PieChart className="w-5 h-5 text-purple-500" /> Contributions by Author
          </h2>
          <div className="space-y-4">
            {Object.entries(authors).map(([name, count]) => {
              const percentage = (Number(count) / totalEvents) * 100;
              return (
                <div key={name} className="space-y-2">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-vscode-highlight">{name}</span>
                    <span className="font-bold text-vscode-string">{count}</span>
                  </div>
                  <div className="w-full bg-vscode-border h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-purple-500 h-full transition-all" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="p-8 bg-vscode-statusBar/10 rounded-2xl border border-vscode-statusBar/30 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-vscode-statusBar">TOTAL_PROCESSED_EVENTS</h3>
          <p className="text-vscode-comment italic">// Real-time monitoring since project inception.</p>
        </div>
        <div className="text-6xl font-black text-vscode-text">
          {totalEvents}
        </div>
      </section>
    </div>
  );
}
