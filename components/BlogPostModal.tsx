
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { DataService } from '../services/dataService';
import type { BlogPost } from '../types';

interface BlogPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  post?: BlogPost | null;
}

const BlogPostModal: React.FC<BlogPostModalProps> = ({ isOpen, onClose, onSave, post }) => {
  const [formData, setFormData] = useState<Omit<BlogPost, 'id' | 'publishedAt'>>({
    title: '',
    content: '',
    author: '',
    thumbnailUrl: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        content: post.content,
        author: post.author,
        thumbnailUrl: post.thumbnailUrl,
        tags: post.tags || []
      });
    } else {
      setFormData({
        title: '',
        content: '',
        author: 'Equipe Rota Local',
        thumbnailUrl: '',
        tags: []
      });
    }
  }, [post]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (post) {
        await DataService.updateBlogPost(post.id, formData);
      } else {
        await DataService.createBlogPost(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving blog post:", error);
      alert("Erro ao salvar postagem.");
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
            {post ? 'Editar' : 'Nova'} <span className="text-yellow-500">Postagem</span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Título</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-yellow-500 outline-none transition-all font-medium"
                placeholder="Ex: As 5 Melhores Praias"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Autor</label>
              <input
                required
                type="text"
                value={formData.author}
                onChange={e => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-yellow-500 outline-none transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Imagem de Capa (URL)</label>
            <input
              required
              type="url"
              value={formData.thumbnailUrl}
              onChange={e => setFormData({ ...formData, thumbnailUrl: e.target.value })}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-yellow-500 outline-none transition-all font-medium"
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Conteúdo (Markdown suportado)</label>
            <textarea
              required
              rows={10}
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-yellow-500 outline-none transition-all font-medium resize-none"
              placeholder="Escreva sua postagem aqui..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-yellow-500 outline-none transition-all font-medium"
                placeholder="Adicionar tag..."
              />
              <button
                type="button"
                onClick={addTag}
                className="px-6 bg-gray-900 text-white font-black rounded-2xl hover:bg-gray-800 transition-all uppercase tracking-widest text-xs"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span key={tag} className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-yellow-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-6 flex gap-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 bg-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-200 transition-all uppercase tracking-widest text-sm"
            >
              Cancelar
            </button>
            <button
              disabled={loading}
              type="submit"
              className="flex-1 px-8 py-4 bg-yellow-500 text-gray-900 font-black rounded-2xl hover:bg-yellow-600 transition-all shadow-xl shadow-yellow-500/20 uppercase tracking-widest text-sm disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Publicar Postagem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogPostModal;
