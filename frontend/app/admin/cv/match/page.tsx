"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Trophy, Eye, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

interface MatchResult {
  id: string;
  title: string;
  file_name: string;
  match_count: number;
  matched_skills: string[];
}

interface Skill {
  id: string;
  name: string;
}

function CVMatchContent() {
  const searchParams = useSearchParams();
  const secret = searchParams.get('secret');

  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!secret) return;
    fetch(`/api/skills?secret=${secret}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAllSkills(data);
      });
  }, [secret]);

  const handleMatch = async () => {
    if (selectedSkillIds.length === 0) return;
    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch('/api/cv/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillIds: selectedSkillIds, secret }),
      });
      const data = await res.json();
      if (Array.isArray(data)) setResults(data);
    } catch (err) {
      alert('Erro ao processar match');
    } finally {
      setIsLoading(false);
    }
  };

  if (!secret) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
        <h1 className="text-xl font-bold">Acesso Negado</h1>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-8 space-y-8 bg-vscode-bg text-vscode-text min-h-screen">
      <header className="border-b border-vscode-border pb-4">
        <h1 className="text-3xl font-bold text-vscode-highlight">Match de Vagas</h1>
        <p className="text-vscode-comment">Selecione os requisitos da vaga para encontrar o melhor currículo</p>
      </header>

      <section className="bg-vscode-sidebar/20 p-6 rounded-lg border border-vscode-border space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-vscode-comment">Tecnologias Requisitadas</h2>
        <div className="flex flex-wrap gap-2">
          {allSkills.map(skill => {
            const isSelected = selectedSkillIds.includes(skill.id);
            return (
              <button
                key={skill.id}
                onClick={() => setSelectedSkillIds(prev => isSelected ? prev.filter(id => id !== skill.id) : [...prev, skill.id])}
                className={`px-3 py-1 rounded-full text-sm border transition-all ${
                  isSelected 
                    ? 'bg-vscode-highlight text-black border-vscode-highlight font-bold' 
                    : 'border-vscode-border text-vscode-comment hover:border-vscode-highlight/50'
                }`}
              >
                {skill.name}
              </button>
            );
          })}
        </div>

        <button 
          onClick={handleMatch}
          disabled={isLoading || selectedSkillIds.length === 0}
          className="w-full bg-vscode-highlight text-black font-bold py-3 rounded-lg flex justify-center items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
          {isLoading ? "Buscando..." : "Encontrar Melhores Currículos"}
        </button>
      </section>

      {hasSearched && (
        <section className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Trophy className="text-vscode-highlight" /> Resultados (Top 5)
          </h2>

          {results.length === 0 ? (
            <p className="text-center py-12 text-vscode-comment border border-dashed border-vscode-border rounded-lg">
              Nenhum currículo atende aos requisitos selecionados.
            </p>
          ) : (
            <div className="grid gap-4">
              {results.map((cv, index) => (
                <div 
                  key={cv.id} 
                  className={`relative p-6 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-vscode-highlight/50 ${
                    index === 0 ? 'bg-vscode-highlight/5 border-vscode-highlight' : 'bg-vscode-sidebar/10 border-vscode-border'
                  }`}
                >
                  {index === 0 && (
                    <div className="absolute -top-3 -left-3 bg-vscode-highlight text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      MELHOR MATCH
                    </div>
                  )}

                  <div className="space-y-3 flex-1">
                    <div>
                      <h3 className="text-xl font-bold text-vscode-highlight">{cv.title}</h3>
                      <p className="text-sm text-vscode-comment">{cv.file_name}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {cv.matched_skills.map(skill => (
                        <span key={skill} className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded border border-green-400/20">
                          <CheckCircle2 size={12} /> {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-black text-vscode-highlight">
                        {cv.match_count}
                        <span className="text-sm font-normal text-vscode-comment">/{selectedSkillIds.length}</span>
                      </div>
                      <div className="text-[10px] uppercase font-bold text-vscode-comment tracking-tighter">Skills Identificadas</div>
                    </div>

                    <a 
                      href={`/api/cv/${cv.id}/download?secret=${secret}`} 
                      target="_blank"
                      className="bg-vscode-sidebar hover:bg-vscode-highlight hover:text-black p-4 rounded-full transition-all border border-vscode-border"
                      title="Visualizar Currículo"
                    >
                      <Eye size={24} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}

export default function CVMatch() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-vscode-comment">Carregando...</div>}>
      <CVMatchContent />
    </Suspense>
  );
}
