"use client";

import { usePathname } from "next/navigation";
import { X, FileCode, FileText, Target } from "lucide-react";
import Link from "next/link";

export default function Tabs() {
  const pathname = usePathname();

  const files = [
    { name: "about.md", icon: <FileText size={14} className="text-vscode-icon-md" />, href: "/" },
    { name: "projects.md", icon: <FileCode size={14} className="text-vscode-icon-code" />, href: "/projects" },
    { name: "stats.json", icon: <FileCode size={14} className="text-vscode-icon-json" />, href: "/stats" },
    { name: "activity.log", icon: <FileCode size={14} className="text-vscode-icon-log" />, href: "/activity" },
    { name: "goals.md", icon: <Target size={14} className="text-vscode-icon-goal" />, href: "/goals" },
  ];

  return (
    <div className="h-9 bg-vscode-tab flex border-b border-vscode-border shrink-0">
      {files.map((file, idx) => (
        <Link 
          key={idx} 
          href={file.href}
          className={`flex items-center px-4 border-r border-vscode-border text-[13px] gap-2 cursor-pointer transition-all ${
            pathname === file.href 
              ? 'bg-vscode-bg border-t-2 border-vscode-highlight text-vscode-text' 
              : 'text-vscode-text/50 hover:bg-vscode-bg/50'
          }`}
        >
          {file.icon}
          <span>{file.name}</span>
          <X size={14} className="hover:bg-vscode-border/50 rounded ml-2 p-0.5" />
        </Link>
      ))}
    </div>
  );
}
