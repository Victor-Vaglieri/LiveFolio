// Mapeamento de tecnologias por repositório
// Adicione aqui os seus projetos e as respectivas stacks
// TODO - isso deveria vir de uma API ou do GitHub ou algum outro jeito, não ser hardcoded
export const REPO_STACKS: Record<string, string[]> = {
  "Victor-Vaglieri/LiveFolio": ["PHP 8.3", "FrankenPHP", "Redis", "PostgreSQL", "Next.js"],
  "Victor-Vaglieri/AppControle": ["React Native", "TypeScript", "Prisma", "Node.js"],
  "Victor-Vaglieri/AI-DE-S": ["Python", "OpenAI API", "GitHub Actions", "ETL"],
  "Victor-Vaglieri/Victor-Vaglieri": ["Markdown", "GitHub Profile"],
};

export function getRepoStack(repoName: string): string[] {
  return REPO_STACKS[repoName] || ["GitHub", "Git"];
}
