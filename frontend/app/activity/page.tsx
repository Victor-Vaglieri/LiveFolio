import { redis } from '@/lib/redis';
import { trackVisit } from '@/lib/tracking';
import { Terminal, FolderGit2, Cpu } from 'lucide-react';
import { getRepoStack } from '@/lib/stacks';

export const dynamic = 'force-dynamic';

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'Victor Vaglieri';

async function getGitHubCommits() {
  try {
    const res = await fetch(`https://api.github.com/search/commits?q=author:${GITHUB_USERNAME}&sort=author-date&order=desc&per_page=30`, {
      headers: { 'Accept': 'application/vnd.github.cloak-preview' },
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items.map((item: any) => ({
      repo: item.repository.full_name,
      author: item.author?.login || GITHUB_USERNAME,
      branch: 'main',
      timestamp: new Date(item.commit.author.date).getTime() / 1000,
      message: item.commit.message,
      type: 'PUSH_HISTORICO'
    }));
  } catch (e) {
    return [];
  }
}

async function getRepoLanguages(repoFullName: string) {
  try {
    const res = await fetch(`https://api.github.com/repos/${repoFullName}/languages`, {
      next: { revalidate: 86400 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Object.keys(data);
  } catch (e) {
    return [];
  }
}

async function getLatestEvents() {
  try {
    const events = await redis.lrange('events:latest', 0, 49);
    if (!Array.isArray(events)) return [];
    
    return events
      .map((e) => {
        try {
          return e ? JSON.parse(e) : null;
        } catch (err) {
          return null;
        }
      })
      .filter((e) => e !== null);
  } catch (e) {
    console.error('[ERRO] Falha ao buscar eventos do Redis:', e);
    return [];
  }
}

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: { ref?: string; source?: string };
}) {
  const source = searchParams.ref || searchParams.source || null;
  await trackVisit(source);

  const redisEvents = await getLatestEvents();
  const ghCommits = redisEvents.length < 10 ? await getGitHubCommits() : [];
  
  const allEvents = [...redisEvents, ...ghCommits].reduce((acc: any[], current: any) => {
    const isDuplicate = acc.find(item => item.message === current.message);
    if (!isDuplicate) acc.push(current);
    return acc;
  }, []).sort((a, b) => b.timestamp - a.timestamp);
  
  const groupedEvents = allEvents.reduce((acc: any, event: any) => {
    if (!acc[event.repo]) {
      acc[event.repo] = [];
    }
    acc[event.repo].push(event);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto py-4 font-mono text-vscode-text">
      <div className="space-y-2 mb-8 border-b border-vscode-border pb-6">
        <div className="flex items-center gap-2 text-vscode-comment">
          <Terminal size={16} />
          <span>// activity.log - Monitoramento em tempo real (Híbrido Redis + GitHub)</span>
        </div>
        <div className="pl-6 space-y-2">
          <p className="text-[13px] text-vscode-text/70">
            <span className="text-vscode-highlight">user:</span> {GITHUB_USERNAME.toLowerCase()} | 
            <span className="text-vscode-highlight ml-2">status:</span> tracking_active
          </p>
        </div>
      </div>

      <div className="space-y-12">
        {Object.keys(groupedEvents).length === 0 && (
          <p className="text-vscode-comment italic text-sm text-center">Nenhum log detectado.</p>
        )}
        
        {await Promise.all(Object.entries(groupedEvents).map(async ([repo, repoEvents]: [string, any]) => {
          const stack = await getRepoLanguages(repo);
          return (
            <section key={repo} className="space-y-4">
              <div className="bg-vscode-sidebar/30 p-3 rounded border border-vscode-border space-y-3">
                <div className="flex items-center gap-2 text-vscode-highlight">
                  <FolderGit2 size={18} />
                  <h2 className="text-lg font-bold">{repo}</h2>
                  <span className="text-[10px] bg-vscode-highlight text-vscode-bg px-2 py-0.5 rounded-full uppercase ml-auto">
                    {repoEvents.length} eventos
                  </span>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <Cpu size={12} className="text-vscode-comment" />
                  <span className="text-[11px] text-vscode-comment uppercase font-bold mr-2">Stack Automática:</span>
                  {stack.length > 0 ? stack.slice(0, 5).map((tech) => (
                    <span key={tech} className="text-[10px] px-1.5 py-0.5 border border-vscode-border rounded bg-vscode-bg text-vscode-text/70">
                      {tech}
                    </span>
                  )) : <span className="text-[10px] text-vscode-comment italic">Analisando linguagens...</span>}
                </div>
              </div>

              <div className="space-y-1 pl-4 border-l border-vscode-border/50">
                {repoEvents.map((event: any, i: number) => (
                  <div key={i} className="group flex gap-4 text-[12px] hover:bg-vscode-highlight/5 p-1 rounded transition-colors items-start">
                    <span className="text-vscode-comment/40 min-w-[30px] text-right select-none">{i + 1}</span>
                    <div className="flex flex-col gap-0.5 w-full">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-vscode-success font-bold">[{new Date(event.timestamp * 1000).toLocaleTimeString()}]</span>
                        <span className={`${event.type === 'PUSH_HISTORICO' ? 'text-vscode-comment' : 'text-vscode-text'} font-semibold`}>
                          {event.type === 'PUSH_HISTORICO' ? 'HISTORICO' : 'PUSH'}
                        </span>
                        <span className="text-vscode-string">"{event.author}"</span>
                        <span className="text-vscode-text">em</span>
                        <span className="text-vscode-highlight font-mono">{event.branch.replace('refs/heads/', '')}</span>
                      </div>
                      <div className="text-vscode-comment italic">
                        └─&gt; {event.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        }))}
      </div>
    </div>
  );
}
