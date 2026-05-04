"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Upload, Check, AlertCircle, Plus, X, Loader2 } from 'lucide-react';

function CVUploadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const secret = searchParams.get('secret');

  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ cvId: string; detectedSkills: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [allSkills, setAllSkills] = useState<{ id: string, name: string }[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!secret) return;
    fetch(`/api/skills?secret=${secret}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAllSkills(data);
      });
  }, [secret]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !secret) return;

    setIsUploading(true);
    setError(null);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('secret', secret);

    try {
      const res = await fetch('/api/cv/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setUploadResult(data);
        const detectedIds = allSkills
          .filter(s => data.detectedSkills.includes(s.name))
          .map(s => s.id);
        setSelectedSkills(detectedIds);
      } else {
        setError(data.error || 'Falha no upload');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const syncTags = async () => {
    if (!uploadResult || !secret) return;
    setIsSyncing(true);
    try {
      await fetch(`/api/cv/${uploadResult.cvId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillIds: selectedSkills, secret }),
      });
      alert('Tags sincronizadas com sucesso!');
    } catch (err: any) {
      alert('Erro ao sincronizar tags: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!secret) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
        <h1 className="text-xl font-bold">Acesso Negado</h1>
        <p className="text-vscode-comment">Secret inválido ou não fornecido.</p>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-8 space-y-8 bg-vscode-bg text-vscode-text min-h-screen">
      <header className="border-b border-vscode-border pb-4">
        <h1 className="text-3xl font-bold text-vscode-highlight">Upload de Currículo</h1>
        <p className="text-vscode-comment">Adicione uma nova variação do seu currículo PDF</p>
      </header>

      {!uploadResult ? (
        <form onSubmit={handleUpload} className="space-y-6 bg-vscode-sidebar/20 p-6 rounded-lg border border-vscode-border">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Título / Foco do CV</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Backend Go / Fullstack React"
              className="w-full bg-vscode-sidebar border border-vscode-border p-2 rounded focus:outline-none focus:border-vscode-highlight"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Arquivo PDF</label>
            <div className="border-2 border-dashed border-vscode-border rounded-lg p-8 text-center hover:border-vscode-highlight transition-colors cursor-pointer relative">
              <input 
                type="file" 
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="w-12 h-12 mx-auto text-vscode-comment mb-2" />
              <p className="text-sm">{file ? file.name : "Clique ou arraste o PDF aqui"}</p>
            </div>
          </div>

          {error && <div className="text-red-500 text-sm flex items-center gap-2"><AlertCircle size={16}/> {error}</div>}

          <button 
            type="submit" 
            disabled={isUploading || !file}
            className="w-full bg-vscode-highlight text-black font-bold py-2 rounded disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isUploading ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
            {isUploading ? "Processando..." : "Fazer Upload e Analisar"}
          </button>
        </form>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-green-500/10 border border-green-500/50 p-6 rounded-lg flex items-center gap-4">
            <div className="bg-green-500 rounded-full p-2 text-black">
              <Check size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Upload concluído!</h2>
              <p className="text-vscode-comment">O sistema analisou seu currículo e identificou as seguintes tags.</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Revisar Tags</h3>
            <div className="flex flex-wrap gap-2">
              {allSkills.map(skill => {
                const isSelected = selectedSkills.includes(skill.id);
                return (
                  <button
                    key={skill.id}
                    onClick={() => {
                      setSelectedSkills(prev => 
                        isSelected ? prev.filter(id => id !== skill.id) : [...prev, skill.id]
                      );
                    }}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors flex items-center gap-1 ${
                      isSelected 
                        ? 'bg-vscode-highlight/20 border-vscode-highlight text-vscode-highlight' 
                        : 'border-vscode-border text-vscode-comment hover:border-vscode-highlight/50'
                    }`}
                  >
                    {skill.name}
                    {isSelected ? <X size={12}/> : <Plus size={12}/>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={syncTags}
              disabled={isSyncing}
              className="flex-1 bg-vscode-highlight text-black font-bold py-2 rounded flex justify-center items-center gap-2"
            >
              {isSyncing ? <Loader2 className="animate-spin" /> : <Check size={18} />}
              Salvar Alterações
            </button>
            <button 
              onClick={() => { setUploadResult(null); setFile(null); setTitle(''); setSelectedSkills([]); }}
              className="px-6 border border-vscode-border rounded hover:bg-vscode-sidebar/30"
            >
              Fazer Novo Upload
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function CVUpload() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-vscode-comment">Carregando...</div>}>
      <CVUploadContent />
    </Suspense>
  );
}
