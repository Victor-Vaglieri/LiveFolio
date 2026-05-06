"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Trash2, AlertCircle, Loader2, BookOpen } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  search_terms: string[];
  color?: string;
}

function SkillsDictionaryContent() {
  const searchParams = useSearchParams();
  const secret = searchParams.get('secret');

  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [newName, setNewName] = useState('');
  const [newTerms, setNewTerms] = useState('');
  const [newColor, setNewColor] = useState('#3b82f6');
  const [isAdding, setIsAdding] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  // Gera uma cor aleatória em formato Hex
  const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  useEffect(() => {
    setNewColor(generateRandomColor());
  }, []);

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
      if (editingSkill) {
        const res = await fetch('/api/skills', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingSkill.id, name: newName, search_terms: termsArray, color: newColor, secret }),
        });
        if (res.ok) {
          setEditingSkill(null);
          setNewName('');
          setNewTerms('');
          setNewColor(generateRandomColor());
          loadSkills();
        }
      } else {
        const res = await fetch('/api/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newName, search_terms: termsArray, color: newColor, secret }),
        });
        if (res.ok) {
          setNewName('');
          setNewTerms('');
          setNewColor(generateRandomColor());
          loadSkills();
        }
      }
    } catch (err) {
      alert('Erro ao salvar skill');
    } finally {
      setIsAdding(false);
    }
  };

  const startEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setNewName(skill.name);
    setNewTerms(skill.search_terms.join(', '));
    setNewColor(skill.color || '#3b82f6');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingSkill(null);
    setNewName('');
    setNewTerms('');
    setNewColor('#3b82f6');
  };

  if (!secret) {
    return <div className="p-8 text-center text-red-500 font-bold">Acesso Negado</div>;
  }

  return (
    <main className="max-w-6xl mx-auto p-8 space-y-8 bg-vscode-bg text-vscode-text min-h-screen">
      <header className="border-b border-vscode-border pb-4">
        <h1 className="text-3xl font-bold text-vscode-highlight">Dicionário de Tecnologias</h1>
        <p className="text-vscode-comment">Gerencie os termos que o sistema busca automaticamente nos seus currículos</p>
      </header>

      {/* Formulário de Adição/Edição */}
      <section className="bg-vscode-sidebar/20 p-6 rounded-lg border border-vscode-border">
        <h2 className="text-sm font-bold uppercase text-vscode-comment mb-4">
          {editingSkill ? 'Editar Skill' : 'Adicionar Nova Skill'}
        </h2>
        <form onSubmit={handleAddSkill} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <label className="text-xs font-bold uppercase text-vscode-comment">Termos de Busca</label>
              <input 
                type="text" 
                value={newTerms}
                onChange={(e) => setNewTerms(e.target.value)}
                placeholder="Ex: react, react.js, reactjs"
                className="w-full bg-vscode-sidebar border border-vscode-border p-2 rounded text-sm focus:outline-none focus:border-vscode-highlight"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-vscode-comment">Cor da Skill</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="h-9 w-12 bg-vscode-sidebar border border-vscode-border rounded cursor-pointer"
                />
                <input 
                  type="text" 
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="flex-1 bg-vscode-sidebar border border-vscode-border p-2 rounded text-sm focus:outline-none focus:border-vscode-highlight uppercase"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              type="submit" 
              disabled={isAdding || !newName || !newTerms}
              className="bg-vscode-highlight text-black font-bold px-6 py-2 rounded text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {isAdding ? <Loader2 size={16} className="animate-spin" /> : editingSkill ? <Plus size={16} /> : <Plus size={16} />}
              {editingSkill ? 'Salvar Alterações' : 'Adicionar ao Dicionário'}
            </button>
            {editingSkill && (
              <button 
                type="button" 
                onClick={cancelEdit}
                className="bg-vscode-sidebar border border-vscode-border text-vscode-text px-6 py-2 rounded text-sm hover:bg-vscode-sidebar/50"
              >
                Cancelar
              </button>
            )}
          </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {skills.map(skill => (
              <div 
                key={skill.id} 
                className="p-4 border border-vscode-border rounded bg-vscode-sidebar/10 flex flex-col justify-between group hover:border-vscode-highlight/50 transition-colors"
                style={{ borderLeftWidth: '4px', borderLeftColor: skill.color || '#3b82f6' }}
              >
                <div className="mb-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-vscode-highlight truncate" title={skill.name}>{skill.name}</h3>
                    <div 
                      className="w-3 h-3 rounded-full shadow-sm" 
                      style={{ backgroundColor: skill.color || '#3b82f6' }}
                    />
                  </div>
                  <p className="text-[10px] text-vscode-comment italic line-clamp-2 mt-1" title={skill.search_terms.join(', ')}>
                    {Array.isArray(skill.search_terms) ? skill.search_terms.join(', ') : ''}
                  </p>
                </div>
                <button 
                  onClick={() => startEdit(skill)}
                  className="text-xs bg-vscode-sidebar border border-vscode-border p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:text-vscode-highlight"
                >
                  Editar
                </button>
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
