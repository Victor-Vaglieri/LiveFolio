"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Trash2, AlertCircle, Loader2, BookOpen } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  search_terms: string[];
}

function SkillsDictionaryContent() {
  const searchParams = useSearchParams();
  const secret = searchParams.get('secret');

  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [newName, setNewName] = useState('');
  const [newTerms, setNewTerms] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!secret) return;
    loadSkills();
  }, [secret]);

  const loadSkills = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/skills?secret=${secret}`);
      const data = await res.json();
      if (Array.isArray(data)) setSkills(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newTerms || !secret) return;

    setIsAdding(true);
    const termsArray = newTerms.split(',').map(t => t.trim()).filter(t => t !== '');

    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, search_terms: termsArray, secret }),
      });
      if (res.ok) {
        setNewName('');
        setNewTerms('');
        loadSkills();
      }
    } catch (err) {
      alert('Erro ao adicionar skill');
    } finally {
      setIsAdding(false);
    }
  };

  if (!secret) {
    return <div className="p-8 text-center text-red-500 font-bold">Acesso Negado</div>;
  }

  return (
    <main className="max-w-4xl mx-auto p-8 space-y-8 bg-vscode-bg text-vscode-text min-h-screen">
      <header className="border-b border-vscode-border pb-4">
        <h1 className="text-3xl font-bold text-vscode-highlight">Dicionário de Tecnologias</h1>
        <p className="text-vscode-comment">Gerencie os termos que o sistema busca automaticamente nos seus currículos</p>
      </header>

      {/* Formulário de Adição */}
      <section className="bg-vscode-sidebar/20 p-6 rounded-lg border border-vscode-border">
        <form onSubmit={handleAddSkill} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-vscode-comment">Nome da Skill</label>
              <input 
                type="text" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: React"
                className="w-full bg-vscode-sidebar border border-vscode-border p-2 rounded text-sm focus:outline-none focus:border-vscode-highlight"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-vscode-comment">Termos de Busca (separados por vírgula)</label>
              <input 
                type="text" 
                value={newTerms}
                onChange={(e) => setNewTerms(e.target.value)}
                placeholder="Ex: react, react.js, reactjs"
                className="w-full bg-vscode-sidebar border border-vscode-border p-2 rounded text-sm focus:outline-none focus:border-vscode-highlight"
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={isAdding || !newName || !newTerms}
            className="bg-vscode-highlight text-black font-bold px-6 py-2 rounded text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {isAdding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Adicionar ao Dicionário
          </button>
        </form>
      </section>

      {/* Lista de Skills */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BookOpen className="text-vscode-highlight" size={20} /> Skills Cadastradas
        </h2>
        
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin w-8 h-8 text-vscode-highlight" /></div>
        ) : (
          <div className="grid gap-2">
            {skills.map(skill => (
              <div key={skill.id} className="p-4 border border-vscode-border rounded bg-vscode-sidebar/10 flex justify-between items-center group">
                <div>
                  <h3 className="font-bold text-vscode-highlight">{skill.name}</h3>
                  <p className="text-xs text-vscode-comment italic">
                    Busca por: {Array.isArray(skill.search_terms) ? skill.search_terms.join(', ') : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default function SkillsDictionary() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-vscode-comment">Carregando...</div>}>
      <SkillsDictionaryContent />
    </Suspense>
  );
}
