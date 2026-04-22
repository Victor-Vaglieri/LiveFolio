import Image from "next/image";
import { GraduationCap, Code, Server, Database, Wrench, BarChart3, PieChart, FileCheck, ExternalLink } from "lucide-react";
import { redis } from '@/lib/redis';
import { trackVisit } from '@/lib/tracking';
import { getAllSettings, initSettingsTable } from '@/lib/settings';

export const dynamic = 'force-dynamic';

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "Victor-Vaglieri"; // TODO - usar variável de ambiente e não hardcoded
const GITHUB_URL = process.env.GITHUB_URL || `https://github.com/${GITHUB_USERNAME}`;
const LINKEDIN_URL = process.env.LINKEDIN_URL || "#";
const LEETCODE_URL = process.env.LEETCODE_URL || "#";

async function getStats() {
  const repos = await redis.hgetall('stats:repos');
  const authors = await redis.hgetall('stats:authors');
  return { repos, authors };
}

interface Certificate {
  name: string;
  school: string;
  link: string;
}

async function getCertificates(): Promise<Certificate[]> {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_USERNAME}/contents/certificados?ref=main`, {
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) return [];
    
    const files = await res.json();
    
    return files
      .filter((file: any) => file.name.endsWith('.pdf'))
      .map((file: any) => {
        const nameWithoutExt = file.name.replace('.pdf', '');
        const [course, school] = nameWithoutExt.split(' - ');
        return {
          name: course || nameWithoutExt,
          school: school || 'Institution',
          link: file.html_url
        };
      });
  } catch (e) {
    console.error("Erro ao buscar certificados:", e);
    return [];
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: { ref?: string; source?: string };
}) {
  const source = searchParams.ref || searchParams.source || null;
  await trackVisit(source);
  await initSettingsTable();

  const { repos, authors } = await getStats();
  const certificates = await getCertificates();
  const settings = await getAllSettings();
  
  const totalEvents = Object.values(repos).reduce((a, b) => a + Number(b), 0);
  
  const hireStatus = settings.hire_status || 'available';
  const companyName = settings.company_name || '';

  const profile = {
    name: "Victor Vaglieri",
    role: "Fullstack Developer & AI Engineering Student",
    bio: "Passionate about event-driven architectures, AI automation, and clean code. Currently building automated ETL pipelines and real-time monitoring systems.", // TODO trocar isso por algo real
    avatar: `${GITHUB_URL}.png`, // TODO isso não esta funcionando
  };

  // TODO - isso deveria vir de uma API ou do GitHub ou algum outro jeito, não ser hardcoded
  const skills = [
    { category: "Frontend", items: ["React", "Next.js", "Angular", "JavaScript", "TypeScript", "HTML5", "CSS3"], icon: <Code size={18} className="text-blue-400" /> },
    { category: "Backend", items: ["PHP (8.3)", "Node.js", "Python", "Java", "Kotlin", "C++", "Flask", "FrankenPHP"], icon: <Server size={18} className="text-green-400" /> },
    { category: "Databases", items: ["PostgreSQL", "MySQL", "MongoDB", "Oracle", "Redis"], icon: <Database size={18} className="text-red-400" /> },
    { category: "Infrastructure", items: ["Docker", "Nginx", "AWS", "GitHub Actions", "Linux", "Apache Kafka"], icon: <Wrench size={18} className="text-orange-400" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-12 font-sans selection:bg-vscode-highlight/30 text-vscode-text">
      {/* Markdown Header */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-8 border-b border-vscode-border pb-8">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-vscode-highlight shadow-xl shadow-vscode-highlight/10">
            <Image src={profile.avatar} alt={profile.name} fill className="object-cover" />
          </div>
          <div className="text-center md:text-left space-y-4">
            <h1 className="text-4xl font-bold text-vscode-highlight"># {profile.name}</h1>
            <p className="text-xl text-vscode-text/70">&gt; {profile.role}</p>
            
            <div className="flex flex-wrap gap-3 justify-center md:justify-start items-center">
               {hireStatus === 'available' && (
                 <span className="flex items-center gap-1 text-[12px] bg-vscode-success/10 text-vscode-success px-2 py-0.5 rounded border border-vscode-success/30">
                   <span className="w-1.5 h-1.5 rounded-full bg-vscode-success animate-pulse"></span>
                   Available for Hire
                 </span>
               )}
               {hireStatus === 'open' && (
                 <span className="flex items-center gap-1 text-[12px] bg-vscode-highlight/10 text-vscode-highlight px-2 py-0.5 rounded border border-vscode-highlight/30">
                   <span className="w-1.5 h-1.5 rounded-full bg-vscode-highlight animate-pulse"></span>
                   Open to Opportunities {companyName && `(at ${companyName})`}
                 </span>
               )}
               {hireStatus === 'busy' && (
                 <span className="flex items-center gap-1 text-[12px] bg-vscode-comment/10 text-vscode-comment px-2 py-0.5 rounded border border-vscode-comment/30">
                   <span className="w-1.5 h-1.5 rounded-full bg-vscode-comment"></span>
                   Working {companyName && `at ${companyName}`}
                 </span>
               )}
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-2">
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                <img src="https://img.shields.io/badge/github-%2324292e.svg?&style=for-the-badge&logo=github&logoColor=white" alt="github" className="h-6" />
              </a>
              <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
                <img src="https://img.shields.io/badge/linkedin-%231E77B5.svg?&style=for-the-badge&logo=linkedin&logoColor=white" alt="linkedin" className="h-6" />
              </a>
              <a href={LEETCODE_URL} target="_blank" rel="noopener noreferrer">
                <img src="https://img.shields.io/badge/-LeetCode-FFA116?style=for-the-badge&logo=LeetCode&logoColor=black" alt="leetcode" className="h-6" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="bg-vscode-sidebar/20 p-4 rounded border-l-4 border-vscode-highlight text-vscode-text/90 italic leading-relaxed">
           "{profile.bio}"
        </div>
      </section>

      {/* Skills */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold border-b border-vscode-border pb-2 text-vscode-highlight">## Technical Stack</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.map((skill, idx) => (
            <div key={idx} className="p-4 border border-vscode-border rounded bg-vscode-sidebar/10">
              <div className="flex items-center gap-2 font-bold mb-3">
                {skill.icon}
                <span className="text-vscode-text">{skill.category}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {skill.items.map((item, i) => (
                  <span key={i} className="text-[12px] text-vscode-text/80 px-2 py-1 bg-vscode-bg border border-vscode-border rounded">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Certificates */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold border-b border-vscode-border pb-2 text-vscode-highlight">## Certificates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {certificates.length > 0 ? (
            certificates.map((cert, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border border-vscode-border rounded bg-vscode-sidebar/5 hover:bg-vscode-sidebar/20 transition-colors group">
                <div className="flex items-center gap-4">
                  <FileCheck className="text-vscode-success w-5 h-5" />
                  <div>
                    <h3 className="font-bold text-vscode-text text-sm">{cert.name}</h3>
                    <p className="text-[10px] text-vscode-comment uppercase font-bold">{cert.school}</p>
                  </div>
                </div>
                <a href={cert.link} target="_blank" rel="noopener noreferrer" className="text-vscode-highlight p-2 opacity-40 group-hover:opacity-100 transition-opacity">
                  <ExternalLink size={16} />
                </a>
              </div>
            ))
          ) : (
            <p className="text-vscode-comment italic text-sm">No certificates detected in GitHub directory.</p>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold border-b border-vscode-border pb-2 text-vscode-highlight">## Real-time Metrics (`stats.json`)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
             <h3 className="text-sm font-semibold text-vscode-comment uppercase flex items-center gap-2">
               <BarChart3 size={16} /> Repository Activity
             </h3>
             <div className="space-y-3">
                {Object.entries(repos).map(([name, count]) => (
                  <div key={name} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span>{name}</span>
                      <span className="text-vscode-highlight">{count} events</span>
                    </div>
                    <div className="h-1.5 bg-vscode-border rounded-full overflow-hidden">
                      <div className="h-full bg-vscode-highlight transition-all" style={{ width: `${(Number(count)/totalEvents)*100}%` }} />
                    </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="space-y-4">
             <h3 className="text-sm font-semibold text-vscode-comment uppercase flex items-center gap-2">
               <PieChart size={16} /> Contribution Weight
             </h3>
             <div className="space-y-3">
                {Object.entries(authors).map(([name, count]) => (
                  <div key={name} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span>{name}</span>
                      <span className="text-vscode-success">{count} events</span>
                    </div>
                    <div className="h-1.5 bg-vscode-border rounded-full overflow-hidden">
                      <div className="h-full bg-vscode-success transition-all" style={{ width: `${(Number(count)/totalEvents)*100}%` }} />
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="p-4 border border-vscode-success/30 bg-vscode-success/5 rounded text-center">
            <span className="text-sm text-vscode-comment">Total Event Volume:</span>
            <span className="text-2xl font-black ml-2 text-vscode-success">{totalEvents}</span>
        </div>
      </section>
    </div>
  );
}
