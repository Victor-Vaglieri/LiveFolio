import { Files, Search, GitBranch, LayoutDashboard, Settings, User } from "lucide-react";
import Link from "next/link";

export default function ActivityBar() {
  const items = [
    { icon: <Files size={24} />, label: "Explorer", href: "/" },
    { icon: <GitBranch size={24} />, label: "Source Control", href: "/activity" },
    { icon: <LayoutDashboard size={24} />, label: "Stats", href: "/stats" },
    { icon: <User size={24} />, label: "Profile", href: "/about" },
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
