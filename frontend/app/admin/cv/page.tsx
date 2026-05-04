import { ShieldCheck, Upload, LayoutList, Target, BookOpen } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function CVAdminHub({
  searchParams,
}: {
  searchParams: { secret?: string };
}) {
  const secret = process.env.ADMIN_SECRET;
  
  if (!secret || searchParams.secret !== secret) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <ShieldCheck className="w-12 h-12 mx-auto text-red-500" />
          <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      title: "Upload de CV",
      description: "Adicione novos PDFs e faça o parse automático de tecnologias.",
      icon: <Upload size={40} className="text-vscode-highlight" />,
      href: `/admin/cv/upload?secret=${secret}`
    },
    {
      title: "Gerenciar Base",
      description: "Visualize seus currículos salvos, edite tags manuais ou exclua variações.",
      icon: <LayoutList size={40} className="text-vscode-highlight" />,
      href: `/admin/cv/manage?secret=${secret}`
    },
    {
      title: "Match de Vagas",
      description: "Compare os requisitos de uma vaga com sua base de currículos para achar o melhor.",
      icon: <Target size={40} className="text-vscode-highlight" />,
      href: `/admin/cv/match?secret=${secret}`
    },
    {
      title: "Dicionário de Skills",
      description: "Gerencie as palavras-chave que o sistema busca automaticamente nos PDFs.",
      icon: <BookOpen size={40} className="text-vscode-highlight" />,
      href: `/admin/cv/skills?secret=${secret}`
    }
  ];

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto space-y-12 bg-vscode-bg text-vscode-text">
      <header className="border-b border-vscode-border pb-8">
        <h1 className="text-4xl font-bold tracking-tight text-vscode-highlight">CV Dinâmico & ATS</h1>
        <p className="text-vscode-comment mt-2">Gerencie suas variações de currículo e otimize seu match para vagas.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menuItems.map((item) => (
          <Link 
            key={item.title} 
            href={item.href}
            className="group p-8 border border-vscode-border rounded-xl bg-vscode-sidebar/10 hover:border-vscode-highlight/50 hover:bg-vscode-sidebar/20 transition-all flex flex-col gap-4"
          >
            <div className="p-3 bg-vscode-bg rounded-lg w-fit border border-vscode-border group-hover:border-vscode-highlight/30 transition-colors">
              {item.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-vscode-highlight group-hover:translate-x-1 transition-transform inline-block">
                {item.title} →
              </h2>
              <p className="text-vscode-comment mt-2 leading-relaxed">
                {item.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
