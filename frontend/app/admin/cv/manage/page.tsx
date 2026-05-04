"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Trash2, Download, Eye, AlertCircle, Loader2, Tag, ChevronDown, ChevronUp } from 'lucide-react';

interface CV {
  id: string;
  title: string;
  file_name: string;
  created_at: string;
  skills: string[];
}

interface Skill {
  id: string;
  name: string;
}

function CVManageContent() {
  const searchParams = useSearchParams();
  const secret = searchParams.get('secret');

  const [cvs, setCvs] = useState<CV[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSavingTags, setIsSavingTags] = useState(false);

  useEffect(() => {
    if (!secret) return;
    loadData();
  }, [secret]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cvsRes, skillsRes] = await Promise.all([
        fetch(`/api/cv?secret=${secret}`),
        fetch(`/api/skills?secret=${secret}`)
      ]);
      const cvsData = await cvsRes.json();
      const skillsData = await skillsRes.json();
      
      if (Array.isArray(cvsData)) setCvs(cvsData);
      if (Array.isArray(skillsData)) setAllSkills(skillsData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este currículo?')) return;
    try {
      await fetch(`/api/cv/${id}?secret=${secret}`, { method: 'DELETE' });
      setCvs(prev => prev.filter(cv => cv.id !== id));
    } catch (err) {
      alert('Erro ao excluir');
    }
  };

  const startEditTags = (cv: CV) => {
    setEditingId(cv.id);
    const skillIds = allSkills
      .filter(s => cv.skills.includes(s.name))
      .map(s => s.id);
    setSelectedSkills(skillIds);
  };

  const saveTags = async (cvId: string) => {
    setIsSavingTags(true);
    try {
      await fetch(`/api/cv/${cvId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillIds: selectedSkills, secret }),
      });
      setEditingId(null);
      loadData();
    } catch (err) {
      alert('Erro ao salvar tags');
    } finally {
      setIsSavingTags(false);
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
        <h1 className="text-3xl font-bold text-vscode-highlight">Gerenciar Currículos</h1>
        <p className="text-vscode-comment">Visualize, edite tags ou remova currículos da base</p>
      </header>

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-vscode-highlight" /></div>
      ) : (
        <div className="grid gap-4">
          {cvs.length === 0 && <p className="text-center text-vscode-comment py-12">Nenhum currículo encontrado.</p>}
          
          {cvs.map(cv => (
            <div key={cv.id} className="border border-vscode-border rounded-lg bg-vscode-sidebar/10 overflow-hidden">
              <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-vscode-highlight">{cv.title}</h3>
                  <p className="text-xs text-vscode-comment flex items-center gap-2">
                    {cv.file_name} • {new Date(cv.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a 
                    href={`/api/cv/${cv.id}/download?secret=${secret}`} 
                    target="_blank"
                    className="p-2 hover:bg-vscode-highlight/10 rounded transition-colors text-vscode-comment hover:text-vscode-highlight"
                    title="Visualizar PDF"
                  >
                    <Eye size={20} />
                  </a>
                  <button 
                    onClick={() => startEditTags(cv)}
                    className={`p-2 hover:bg-vscode-highlight/10 rounded transition-colors ${editingId === cv.id ? 'text-vscode-highlight' : 'text-vscode-comment'}`}
                    title="Editar Tags"
                  >
                    <Tag size={20} />
                  </button>
                  <button 
                    onClick={() => handleDelete(cv.id)}
                    className="p-2 hover:bg-red-500/10 rounded transition-colors text-vscode-comment hover:text-red-500"
                    title="Excluir"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {/* Seção de Tags */}
              <div className="px-4 pb-4 border-t border-vscode-border/30 pt-3">
                {editingId === cv.id ? (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex flex-wrap gap-2">
                      {allSkills.map(skill => {
                        const isSelected = selectedSkills.includes(skill.id);
                        return (
                          <button
                            key={skill.id}
                            onClick={() => setSelectedSkills(prev => isSelected ? prev.filter(id => id !== skill.id) : [...prev, skill.id])}
                            className={`px-2 py-0.5 rounded text-xs border transition-colors ${
                              isSelected ? 'bg-vscode-highlight/20 border-vscode-highlight text-vscode-highlight' : 'border-vscode-border text-vscode-comment'
                            }`}
                          >
                            {skill.name}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => saveTags(cv.id)}
                        disabled={isSavingTags}
                        className="bg-vscode-highlight text-black text-xs font-bold px-4 py-1.5 rounded flex items-center gap-1"
                      >
                        {isSavingTags ? <Loader2 size={14} className="animate-spin" /> : <Tag size={14} />}
                        Salvar Tags
                      </button>
                      <button 
                        onClick={() => setEditingId(null)}
                        className="text-xs border border-vscode-border px-4 py-1.5 rounded"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {cv.skills.length > 0 ? (
                      cv.skills.map(skill => (
                        <span key={skill} className="px-2 py-0.5 bg-vscode-sidebar rounded text-xs text-vscode-comment border border-vscode-border">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-vscode-comment italic">Sem tags identificadas</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default function CVManage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-vscode-comment">Carregando...</div>}>
      <CVManageContent />
    </Suspense>
  );
}
