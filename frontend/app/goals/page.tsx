import { Milestone, Flag, Compass } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function GoalsPage() {
  const milestones = [
    { 
      title: "Core Infrastructure", 
      status: "completed", 
      tasks: ["Redis Stream Ingestion", "PHP 8.3 Worker Processing", "PostgreSQL Persistence", "Next.js VS Code Theme"] 
    },
    { 
      title: "Real-time AI Analysis", 
      status: "in-progress", 
      tasks: ["Automated PR Analysis via GPT-4", "Coding Patterns Detection", "Language Skills auto-update"] 
    },
    { 
      title: "Advanced Tracking", 
      status: "planned", 
      tasks: ["Heatmaps for recruiters", "Downloadable dynamic CV", "LinkedIn Integration"] 
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-12 font-sans selection:bg-vscode-highlight/30">
      <section className="space-y-6">
        <h1 className="text-4xl font-bold text-vscode-highlight"># Roadmap & Goals</h1>
        <p className="text-vscode-comment italic">// Tracking my evolution as an engineer.</p>
      </section>

      <div className="space-y-8">
        {milestones.map((milestone, idx) => (
          <div key={idx} className="relative pl-8 border-l-2 border-vscode-border space-y-4">
            <div className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full border-4 border-vscode-bg ${
              milestone.status === 'completed' ? 'bg-vscode-success' : 
              milestone.status === 'in-progress' ? 'bg-vscode-highlight animate-pulse' : 'bg-vscode-comment'
            }`} />
            
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {milestone.title}
              <span className={`text-[10px] uppercase px-2 py-0.5 rounded border ${
                milestone.status === 'completed' ? 'text-vscode-success border-vscode-success' : 
                milestone.status === 'in-progress' ? 'text-vscode-highlight border-vscode-highlight' : 'text-vscode-comment border-vscode-comment'
              }`}>
                {milestone.status}
              </span>
            </h2>

            <ul className="space-y-2">
              {milestone.tasks.map((task, i) => (
                <li key={i} className="flex items-center gap-2 text-vscode-text/80">
                  <span className={milestone.status === 'completed' ? 'text-vscode-success' : 'text-vscode-comment'}>
                    {milestone.status === 'completed' ? '[x]' : '[ ]'}
                  </span>
                  {task}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <section className="p-8 border border-vscode-highlight/20 bg-vscode-highlight/5 rounded-2xl flex items-center gap-6">
        <Compass size={48} className="text-vscode-highlight shrink-0" />
        <div className="space-y-2">
          <h3 className="text-xl font-bold">The Mission</h3>
          <p className="text-vscode-text/70 leading-relaxed">
            Continuously evolving the **LiveFolio** ecosystem to bridge the gap between open-source contributions and professional visibility through automation and high-performance engineering.
          </p>
        </div>
      </section>
    </div>
  );
}
