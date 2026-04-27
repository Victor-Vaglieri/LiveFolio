import { Milestone, Flag, Compass, CheckCircle2 } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function GoalsPage() {
  const milestones = [
    { 
      title: "Core Infrastructure & Security", 
      status: "completed", 
      tasks: [
        "Redis Stream Ingestion (Upstash)", 
        "PHP 8.3 Worker processing real-time events", 
        "PostgreSQL Persistence (Supabase Pooler)", 
        "IPv4/IPv6 Dual-stack routing compatibility",
        "Rate Limiting per IP for Webhook protection",
        "SSL/TLS Encryption for all database connections",
        "Language Skills auto-update from repository analysis"
      ] 
    },
    { 
      title: "UI/UX & Branding", 
      status: "completed", 
      tasks: [
        "VS Code '2026 Dark' Theme integration", 
        "Dynamic Stats Dashboard", 
        "Mobile-friendly Responsive Design",
        "Centralized Design System via Tailwind + CSS Variables"
      ] 
    },
    { 
      title: "Advanced Tracking & Visibility", 
      status: "planned", 
      tasks: [
        "Downloadable dynamic CV (PDF generation)"
      ] 
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-12 font-sans selection:bg-vscode-highlight/30 text-vscode-text">
      <section className="space-y-6">
        <div className="flex items-center gap-3">
            <Flag className="text-vscode-highlight" size={32} />
            <h1 className="text-4xl font-bold text-vscode-highlight"># Roadmap & Goals</h1>
        </div>
        <p className="text-vscode-comment italic leading-relaxed">
            // High-performance engineering meets professional visibility.<br/>
            // Status: Systems operational, tracking evolution in real-time.
        </p>
      </section>

      <div className="space-y-10">
        {milestones.map((milestone, idx) => (
          <div key={idx} className="relative pl-10 border-l-2 border-vscode-border/50 space-y-4">
            <div className={`absolute -left-[13px] top-0 w-6 h-6 rounded-full border-4 border-vscode-bg flex items-center justify-center ${
              milestone.status === 'completed' ? 'bg-vscode-success text-vscode-bg' : 
              milestone.status === 'in-progress' ? 'bg-vscode-highlight animate-pulse' : 'bg-vscode-sidebar'
            }`}>
                {milestone.status === 'completed' && <CheckCircle2 size={12} strokeWidth={4} />}
            </div>
            
            <div className="space-y-1">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                {milestone.title}
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border tracking-widest ${
                    milestone.status === 'completed' ? 'text-vscode-success border-vscode-success/30 bg-vscode-success/5' : 
                    milestone.status === 'in-progress' ? 'text-vscode-highlight border-vscode-highlight/30 bg-vscode-highlight/5' : 'text-vscode-comment border-vscode-comment/30 bg-vscode-sidebar/5'
                }`}>
                    {milestone.status}
                </span>
                </h2>
            </div>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {milestone.tasks.map((task, i) => (
                <li key={i} className="flex items-start gap-3 text-[14px] text-vscode-text/70 bg-vscode-sidebar/5 p-2 rounded border border-vscode-border/20 hover:border-vscode-border transition-colors">
                  <span className={`mt-1 font-mono font-bold ${milestone.status === 'completed' ? 'text-vscode-success' : 'text-vscode-comment'}`}>
                    {milestone.status === 'completed' ? '✔' : '»'}
                  </span>
                  {task}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <section className="p-8 border border-vscode-highlight/20 bg-vscode-highlight/5 rounded-2xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5">
            <Compass size={120} />
        </div>
        <Compass size={48} className="text-vscode-highlight shrink-0 group-hover:rotate-45 transition-transform duration-700" />
        <div className="space-y-3 relative z-10 text-center md:text-left">
          <h3 className="text-xl font-bold text-vscode-text">The Engineering Mission</h3>
          <p className="text-vscode-text/60 leading-relaxed max-w-2xl">
            Continuously evolving the **LiveFolio** ecosystem to bridge the gap between open-source contributions and professional visibility. We prioritize **low latency**, **high availability**, and **technical transparency**.
          </p>
        </div>
      </section>
    </div>
  );
}
