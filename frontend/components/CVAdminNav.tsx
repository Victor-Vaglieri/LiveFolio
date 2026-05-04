"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Home, Upload, LayoutList, Target, BookOpen, ArrowLeft } from 'lucide-react';

export default function CVAdminNav() {
  const searchParams = useSearchParams();
  const secret = searchParams.get('secret');

  const links = [
    { name: 'Início', href: '/admin/cv', icon: <Home size={16} /> },
    { name: 'Upload', href: '/admin/cv/upload', icon: <Upload size={16} /> },
    { name: 'Base', href: '/admin/cv/manage', icon: <LayoutList size={16} /> },
    { name: 'Match', href: '/admin/cv/match', icon: <Target size={16} /> },
    { name: 'Skills', href: '/admin/cv/skills', icon: <BookOpen size={16} /> },
  ];

  return (
    <nav className="bg-vscode-sidebar border-b border-vscode-border px-4 py-2 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Link 
          href={`/admin/tracking?secret=${secret}`}
          className="text-vscode-comment hover:text-vscode-text p-1"
          title="Voltar ao Painel Geral"
        >
          <ArrowLeft size={20} />
        </Link>
        <span className="text-vscode-comment text-xs font-bold uppercase tracking-widest hidden md:inline">CV ATS</span>
      </div>

      <div className="flex items-center gap-2 md:gap-4 text-sm font-medium">
        {links.map((link) => (
          <Link
            key={link.href}
            href={`${link.href}?secret=${secret}`}
            className="flex items-center gap-1.5 px-3 py-1 rounded hover:bg-vscode-highlight/10 text-vscode-comment hover:text-vscode-highlight transition-colors"
          >
            {link.icon}
            <span className="hidden sm:inline">{link.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
