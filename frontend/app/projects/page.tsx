import { getSetting } from '@/lib/settings';
import { trackVisit } from '@/lib/tracking';
import { FolderGit2, Star, Code2, ExternalLink, Github } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface ProjectData {
  name: string;
  full_name: string;
  description: string;
  stars: number;
  language: string;
  url: string;
  image: string;
}

async function getProjectData(repoPath: string): Promise<ProjectData | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${repoPath.trim()}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return null;
    const data = await res.json();
    
    return {
      name: data.name,
      full_name: data.full_name,
      description: data.description || "No description provided.",
      stars: data.stargazers_count,
      language: data.language || "Mixed",
      url: data.html_url,
      // Usando o serviço de Social Preview do GitHub para a imagem
      image: `https://opengraph.githubassets.com/1/${repoPath.trim()}`
    };
  } catch (e) {
    return null;
  }
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { ref?: string; source?: string };
}) {
  const source = searchParams.ref || searchParams.source || null;
  await trackVisit(source);

  const projectsCsv = await getSetting('featured_projects', '');
  const projectPaths = projectsCsv.split(',').filter(p => p.trim() !== '').slice(0, 8);
  
  const projects = (await Promise.all(
    projectPaths.map(path => getProjectData(path))
  )).filter((p): p is ProjectData => p !== null);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-10 font-sans text-vscode-text">
      <header className="space-y-2 border-b border-vscode-border pb-6">
        <div className="flex items-center gap-2 text-vscode-comment font-mono">
          <FolderGit2 size={16} />
          <span>// projects.md - Curated work and open source contributions</span>
        </div>
        <h1 className="text-3xl font-bold text-vscode-highlight">Featured Projects</h1>
      </header>

      {projects.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-vscode-border rounded-lg">
           <p className="text-vscode-comment italic">Nenhum projeto configurado no painel admin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.full_name} className="group border border-vscode-border rounded-lg overflow-hidden bg-vscode-sidebar/10 hover:border-vscode-highlight/50 transition-all hover:shadow-xl hover:shadow-vscode-highlight/5 flex flex-col">
              {/* Thumbnail */}
              <div className="relative aspect-[2/1] overflow-hidden bg-vscode-bg border-b border-vscode-border">
                <img 
                  src={project.image} 
                  alt={project.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-vscode-bg/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <a 
                     href={project.url} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="bg-vscode-highlight text-vscode-bg px-4 py-2 rounded font-bold flex items-center gap-2 scale-90 group-hover:scale-100 transition-transform"
                   >
                     <Github size={18} /> View on GitHub
                   </a>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-lg text-vscode-highlight truncate group-hover:text-vscode-text transition-colors">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-vscode-comment font-mono bg-vscode-bg px-2 py-0.5 rounded border border-vscode-border">
                     <Star size={12} className="text-yellow-500" />
                     {project.stars}
                  </div>
                </div>

                <p className="text-sm text-vscode-text/70 line-clamp-2 leading-relaxed flex-1">
                  {project.description}
                </p>

                <div className="pt-4 flex items-center justify-between border-t border-vscode-border/30">
                  <div className="flex items-center gap-2">
                    <Code2 size={14} className="text-vscode-comment" />
                    <span className="text-[11px] font-bold text-vscode-comment uppercase tracking-widest">
                      {project.language}
                    </span>
                  </div>
                  <ExternalLink size={14} className="text-vscode-comment opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <footer className="pt-10 border-t border-vscode-border/30 text-center">
         <p className="text-[10px] text-vscode-comment uppercase tracking-[0.2em]">
            &gt; TOTAL_PROJECTS_LISTED: {projects.length} | SYSTEM_READY
         </p>
      </footer>
    </div>
  );
}
