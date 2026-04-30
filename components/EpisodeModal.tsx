
import React, { useState, useEffect } from 'react';
import type { Video, Business, Category } from '../types';
import { DataService } from '../services/dataService';
import { X, Plus } from 'lucide-react';

interface EpisodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  video?: Video | null;
}

const EpisodeModal: React.FC<EpisodeModalProps> = ({ isOpen, onClose, onSave, video }) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [formData, setFormData] = useState<Omit<Video, 'id'>>({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    category: '',
    businessId: '',
    publishedAt: new Date().toISOString(),
    isPrivate: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const { collection, getDocs } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        const [snapshot, fetchedCategories] = await Promise.all([
            getDocs(collection(db, 'businesses')),
            DataService.getCategories()
        ]);
        const allBusinesses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
        const uniqueBusinesses = Array.from(new Map(allBusinesses.map(b => [b.id, b])).values());
        setBusinesses(uniqueBusinesses);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error loading episode modal data:", error);
      }
    };
    if (isOpen) loadInitialData();
  }, [isOpen]);

  const fetchCategories = async () => {
    const cats = await DataService.getCategories();
    setCategories(cats);
  };

  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
        await DataService.createCategory(newCategoryName.trim());
        await fetchCategories();
        setFormData(prev => ({ ...prev, category: newCategoryName.trim() }));
        setNewCategoryName('');
        setShowNewCategoryInput(false);
    } catch (error) {
        console.error("Error creating category:", error);
    }
  };

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title,
        description: video.description,
        videoUrl: video.videoUrl,
        thumbnailUrl: video.thumbnailUrl,
        category: video.category,
        businessId: video.businessId || '',
        publishedAt: video.publishedAt,
        isPrivate: !!video.isPrivate
      });
    } else {
      setFormData({
        title: '',
        description: '',
        videoUrl: '',
        thumbnailUrl: '',
        category: '',
        businessId: '',
        publishedAt: new Date().toISOString(),
        isPrivate: false
      });
    }
  }, [video]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Check for duplicates if it's a new video
      if (!video) {
        const existingVideos = await DataService.getVideos(true);
        const isDuplicate = existingVideos.some(v => 
          v.title.toLowerCase().trim() === formData.title.toLowerCase().trim()
        );
        
        if (isDuplicate && !window.confirm("Já existe um episódio com este título. Deseja continuar mesmo assim?")) {
          setLoading(false);
          return;
        }
      }

      if (video) {
        await DataService.updateVideo(video.id, formData);
      } else {
        await DataService.addVideo(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving video:", error);
      alert("Erro ao salvar episódio. Verifique os campos e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
            {video ? 'Editar' : 'Novo'} <span className="text-yellow-500">Episódio</span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Título</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-yellow-500 outline-none transition-all font-medium"
                placeholder="Ex: Sabores do Litoral"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Categoria</label>
              {!showNewCategoryInput ? (
                <div className="relative">
                  <select 
                    required 
                    value={formData.category || ''} 
                    onChange={e => {
                      if (e.target.value === 'NEW') {
                        setShowNewCategoryInput(true);
                      } else {
                        setFormData({ ...formData, category: e.target.value });
                      }
                    }}
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all font-medium appearance-none"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                    <option value="NEW" className="text-yellow-600 font-bold">+ Criar Nova Categoria</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Nome da categoria"
                    value={newCategoryName} 
                    onChange={e => setNewCategoryName(e.target.value)}
                    className="flex-1 px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all font-medium"
                  />
                  <button 
                    type="button"
                    onClick={handleAddNewCategory}
                    className="px-6 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all uppercase text-xs tracking-widest"
                  >
                    Add
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowNewCategoryInput(false);
                      setNewCategoryName('');
                    }}
                    className="px-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Descrição</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-yellow-500 outline-none transition-all font-medium resize-none"
              placeholder="Conte um pouco sobre este episódio..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">URL do Vídeo (YouTube)</label>
              <input
                required
                type="url"
                value={formData.videoUrl}
                onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-yellow-500 outline-none transition-all font-medium"
                placeholder="https://youtube.com/shorts/..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">URL da Thumbnail</label>
              <input
                required
                type="url"
                value={formData.thumbnailUrl}
                onChange={e => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-yellow-500 outline-none transition-all font-medium"
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Negócio Relacionado</label>
              <select
                value={formData.businessId}
                onChange={e => setFormData({ ...formData, businessId: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-yellow-500 outline-none transition-all font-medium appearance-none"
              >
                <option value="">Nenhum</option>
                {businesses.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-4 pt-8">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPrivate}
                  onChange={e => setFormData({ ...formData, isPrivate: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                <span className="ml-3 text-sm font-black uppercase tracking-widest text-gray-500">Privado</span>
              </label>
            </div>
          </div>

          <div className="pt-6 flex gap-4">
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
              {loading ? 'Salvando...' : 'Salvar Episódio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EpisodeModal;
