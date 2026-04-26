
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { DataService } from '../services/dataService';
import type { Video, Business } from '../types';

interface EpisodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  video?: Video | null;
}

const EpisodeModal: React.FC<EpisodeModalProps> = ({ isOpen, onClose, onSave, video }) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
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
    const loadBusinesses = async () => {
      // For now, we'll fetch all businesses to populate the dropdown
      // In a real app, we might have a dedicated service method
      try {
        const { collection, getDocs } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        const snapshot = await getDocs(collection(db, 'businesses'));
        const allBusinesses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
        // Ensure unique IDs
        const uniqueBusinesses = Array.from(new Map(allBusinesses.map(b => [b.id, b])).values());
        setBusinesses(uniqueBusinesses);
      } catch (error) {
        console.error("Error loading businesses:", error);
      }
    };
    loadBusinesses();
  }, []);

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
            {video ? 'Editar' : 'Novo'} <span className="text-yellow-500">Episódio</span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
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
              <input
                required
                type="text"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-yellow-500 outline-none transition-all font-medium"
                placeholder="Ex: Alimentação"
              />
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
