import { GitBranch, Radio, Github } from "lucide-react";

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "Victor-Vaglieri";

export default function StatusBar() {
  return (
    <footer className="h-6 bg-vscode-statusBar border-t border-vscode-border text-[12px] flex items-center px-3 justify-between text-vscode-comment shrink-0">
      <div className="flex items-center gap-4 h-full">
        <div className="flex items-center gap-1 hover:bg-vscode-highlight/10 px-2 h-full cursor-pointer transition-colors">
          <GitBranch size={14} />
          <span>main*</span>
        </div>
        <div className="flex items-center gap-1 hover:bg-vscode-highlight/10 px-2 h-full cursor-pointer transition-colors">
          <Radio size={14} className="text-vscode-success animate-pulse" />
          <span>Live Ingestion Active</span>
        </div>
      </div>

      <div className="flex items-center gap-4 h-full">
        <div className="flex items-center gap-1 hover:bg-vscode-highlight/10 px-2 h-full cursor-pointer transition-colors">
          <Github size={14} />
          <span>{GITHUB_USERNAME} Connected</span>
        </div>
      </div>
    </footer>
  );
}
