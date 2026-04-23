import { Files, GitBranch, LayoutDashboard, Settings, FolderKanban, Target } from "lucide-react";
import Link from "next/link";

export default function ActivityBar() {
  const items = [
    { icon: <Files size={24} />, label: "Explorer (About)", href: "/" },
    { icon: <FolderKanban size={24} />, label: "Projects", href: "/projects" },
    { icon: <GitBranch size={24} />, label: "Source Control (Activity)", href: "/activity" },
    { icon: <LayoutDashboard size={24} />, label: "Stats", href: "/stats" },
    { icon: <Target size={24} />, label: "Goals", href: "/goals" },
  ];

  return (
    <aside className="w-12 bg-vscode-activityBar flex flex-col items-center py-4 gap-6 text-vscode-text/60">
      {items.map((item, idx) => (
        <Link key={idx} href={item.href} title={item.label} className="hover:text-vscode-text cursor-pointer transition-colors">
          {item.icon}
        </Link>
      ))}
      <div className="mt-auto flex flex-col items-center gap-6">
        <Settings size={24} className="hover:text-vscode-text cursor-pointer transition-colors" />
      </div>
    </aside>
  );
}
