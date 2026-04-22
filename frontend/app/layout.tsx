import type { Metadata } from "next";
import "./globals.css";
import ActivityBar from "@/components/ActivityBar";
import StatusBar from "@/components/StatusBar";
import Tabs from "@/components/Tabs";

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "Victor-Vaglieri"; // TODO - usar variável de ambiente e não hardcoded

export const metadata: Metadata = {
  title: `${GITHUB_USERNAME} | LiveFolio`,
  description: "Real-time VS Code style activity portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-vscode-bg text-vscode-text h-screen flex flex-col">
        <div className="flex flex-1 overflow-hidden">
          <ActivityBar />
          <div className="flex-1 flex flex-col min-w-0">
            <Tabs />
            <div className="flex-1 overflow-auto bg-vscode-bg p-4">
              {children}
            </div>
          </div>
        </div>
        <StatusBar />
      </body>
    </html>
  );
}
