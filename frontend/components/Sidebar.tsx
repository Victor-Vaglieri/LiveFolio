"use client";

import { ChevronDown, FileJson, FileCode, FileText, BarChart2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const files = [
    { name: "home.json", icon: <FileJson size={16} className="text-vscode-icon-json" />, href: "/" },
    { name: "activity.log", icon: <FileCode size={16} className="text-vscode-icon-log" />, href: "/activity" },
    { name: "stats.json", icon: <BarChart2 size={16} className="text-vscode-icon-stats" />, href: "/stats" },
    { name: "about.md", icon: <FileText size={16} className="text-vscode-icon-md" />, href: "/about" },
  ];

  return (
    <aside className="w-60 bg-vscode-sidebar border-r border-vscode-border flex flex-col text-vscode-text">
      <div className="p-3 text-[11px] uppercase tracking-wider text-vscode-text/60 font-semibold flex items-center justify-between">
        Explorer
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1 p-1 bg-vscode-border/30 font-bold text-[12px] cursor-pointer">
          <ChevronDown size={14} />
          <span>LIVEFOLIO-PROJECT</span>
        </div>
        
        <div className="flex flex-col gap-0.5 pt-1">
          {files.map((file, idx) => (
            <Link 
              key={idx} 
              href={file.href} 
              className={`flex items-center gap-2 px-5 py-1 text-[13px] hover:bg-vscode-hover transition-colors ${pathname === file.href ? 'bg-vscode-tabActive' : ''}`}
            >
              {file.icon}
              <span>{file.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
