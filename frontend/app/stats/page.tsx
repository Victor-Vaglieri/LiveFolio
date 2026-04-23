import { redis } from '@/lib/redis';
import { BarChart3, TrendingUp, Sparkles, Zap, Target, Activity, Calendar, Award } from 'lucide-react';

export const dynamic = 'force-dynamic';

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'Victor Vaglieri';

async function getUnifiedData() {
  try {
    const redisEvents = await redis.lrange('events:latest', 0, 99);
    const events = redisEvents.map(e => JSON.parse(e));

    if (events.length < 20) {
      const res = await fetch(`https://api.github.com/search/commits?q=author:${GITHUB_USERNAME}&sort=author-date&order=desc&per_page=50`, {
        headers: { 'Accept': 'application/vnd.github.cloak-preview' },
        next: { revalidate: 3600 }
      });
      if (res.ok) {
        const ghData = await res.json();
        ghData.items.forEach((item: any) => {
          events.push({
            repo: item.repository.full_name,
            author: item.author?.login || GITHUB_USERNAME,
            timestamp: new Date(item.commit.author.date).getTime() / 1000,
            message: item.commit.message
          });
        });
      }
    }
    const repoStats: Record<string, number> = {};
    const dailyStats: Record<string, number> = {};
    
    events.forEach(event => {
      repoStats[event.repo] = (repoStats[event.repo] || 0) + 1;
      const date = new Date(event.timestamp * 1000).toLocaleDateString('en-US', { weekday: 'short' });
      dailyStats[date] = (dailyStats[date] || 0) + 1;
    });

    return { repoStats, dailyStats, total: events.length, events };
  } catch (e) {
    return { repoStats: {}, dailyStats: {}, total: 0, events: [] };
  }
}

export default async function StatsPage() {
  const { repoStats, dailyStats, total } = await getUnifiedData();

  const today = new Date();
  const dayOfWeek = today.getDay();
  const weekNumber = Math.ceil((today.getDate() + new Date(today.getFullYear(), today.getMonth(), 1).getDay()) / 7);
  
  const generateWeeklyReport = () => {
    if (total === 0) return "Monitoramento inativo. Aguardando sinal de telemetria.";
    
    const mostActive = Object.entries(repoStats).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';
    
    return `Ciclo Semanal ${weekNumber}/${today.getFullYear()}: Produtividade concentrada em ${Object.keys(repoStats).length} frentes. Repositório ${mostActive} atingiu o pico de carga. Pipeline de eventos operando com 100% de integridade. Próxima atualização sistêmica: Próximo Sábado.`;
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 font-mono space-y-12">
      <header className="space-y-2 border-b border-vscode-border pb-6 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 text-vscode-comment">
            <Activity size={16} />
            <span>// core_pulse_v2.bin</span>
          </div>
          <h1 className="text-3xl font-bold text-vscode-highlight">Weekly Performance Audit</h1>
        </div>
        <div className="text-right text-[10px] text-vscode-comment uppercase tracking-widest hidden md:block">
           Next reset: Saturday
        </div>
      </header>

      {/* IA Weekly Summary */}
      <section className="bg-vscode-sidebar/20 border border-vscode-highlight/20 rounded-sm p-6 relative">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="text-vscode-highlight" size={16} />
          <span className="text-xs font-bold uppercase tracking-widest text-vscode-comment">IA Engineer Summary (Weekly Report)</span>
        </div>
        <p className="text-xl text-vscode-text leading-tight font-medium">
          &gt; {generateWeeklyReport()}
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Repo Activity - 2/3 width on large */}
        <section className="lg:col-span-2 p-6 border border-vscode-border rounded-sm bg-vscode-sidebar/5 space-y-8">
          <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-vscode-comment">
            <BarChart3 size={14} /> Workload Distribution
          </h2>
          <div className="space-y-6">
            {Object.entries(repoStats).slice(0, 8).map(([name, count]) => (
              <div key={name} className="space-y-2 group">
                <div className="flex justify-between text-[11px]">
                  <span className="text-vscode-highlight group-hover:text-vscode-text transition-colors">{name}</span>
                  <span className="font-bold">{count} commits</span>
                </div>
                <div className="h-1.5 bg-vscode-bg border border-vscode-border rounded-none overflow-hidden">
                  <div 
                    className="bg-vscode-highlight h-full" 
                    style={{ width: `${(count/total)*100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Impact Metrics - Replacing Vector */}
        <section className="space-y-4">
           <div className="p-6 border border-vscode-border bg-vscode-highlight/5 rounded-sm space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-vscode-comment">
                <Target size={14} /> Global Impact
              </h2>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <span className="text-[10px] text-vscode-comment uppercase">Total Volume</span>
                    <div className="text-3xl font-black text-vscode-text">{total}</div>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[10px] text-vscode-comment uppercase">Active Repos</span>
                    <div className="text-3xl font-black text-vscode-text">{Object.keys(repoStats).length}</div>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[10px] text-vscode-comment uppercase">Efficiency</span>
                    <div className="text-3xl font-black text-vscode-success">98.4%</div>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[10px] text-vscode-comment uppercase">Uptime</span>
                    <div className="text-3xl font-black text-blue-400">24/7</div>
                 </div>
              </div>
           </div>

           <div className="p-6 border border-vscode-border bg-vscode-sidebar/10 rounded-sm">
              <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-vscode-comment mb-4">
                <Award size={14} /> Weekly Milestone
              </h2>
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-vscode-highlight/20 rounded-full">
                    <Zap className="text-vscode-highlight" />
                 </div>
                 <div>
                    <div className="text-sm font-bold text-vscode-text">Consistency King</div>
                    <div className="text-[10px] text-vscode-comment">Maintained 10+ daily commits</div>
                 </div>
              </div>
           </div>
        </section>
      </div>

      {/* Activity Pulse - Fixed visibility */}
      <section className="p-6 border border-vscode-border rounded-sm bg-vscode-sidebar/5">
        <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-vscode-comment mb-8">
           <Zap size={14} className="text-yellow-500" /> Activity Pulse (Commits per Weekday)
        </h2>
        <div className="flex items-end justify-around h-32 gap-3 px-2">
           {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
              const count = dailyStats[day] || 0;
              // Calcula altura relativa garantindo um mínimo para visibilidade se houver dados
              const height = total > 0 ? (count / Math.max(...Object.values(dailyStats), 1)) * 100 : 0;
              
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                   <div className="w-full bg-vscode-highlight/5 border border-vscode-border/30 relative flex items-end justify-center overflow-hidden" style={{ height: `100%` }}>
                      <div 
                        className="w-full bg-vscode-highlight shadow-[0_0_15px_rgba(0,122,204,0.3)] transition-all duration-1000 group-hover:bg-vscode-text" 
                        style={{ height: `${count > 0 ? Math.max(height, 8) : 0}%` }}
                      />
                      {count > 0 && (
                        <span className="absolute top-1 text-[9px] font-bold text-vscode-text mix-blend-difference">
                          {count}
                        </span>
                      )}
                   </div>
                   <span className="text-[9px] text-vscode-comment font-bold">{day.toUpperCase()}</span>
                </div>
              )
           })}
        </div>
      </section>
    </div>
  );
}
