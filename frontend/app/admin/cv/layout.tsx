"use client";

import CVAdminNav from '@/components/CVAdminNav';
import { Suspense } from 'react';

export default function CVLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={<div className="h-12 bg-vscode-sidebar border-b border-vscode-border" />}>
        <CVAdminNav />
      </Suspense>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
