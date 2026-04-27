
import React, { useState, useMemo, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { DataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import type { Video, Favorite } from '../types';
import VideoCard from '../components/VideoCard';
import EpisodeModal from '../components/EpisodeModal';

const Episodes: React.FC = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [categories, setCategories] = useState<string[]>([]);
  
  // CRUD State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const loadData = async () => {
    try {
      const isAdmin = user?.role === 'admin';
      const [videoData, favData, catData] = await Promise.all([
        DataService.getVideos(isAdmin),
        user ? DataService.getFavorites(user.uid) : Promise.resolve([]),
        DataService.getCategories()
      ]);
      // Ensure unique IDs
      const uniqueVideos = Array.from(new Map(videoData.map(v => [v.id, v])).values());
      setVideos(uniqueVideos);
      setFavorites(favData);
      setCategories(['all', ...catData.map(c => c.name)]);
    } catch (error) {
      console.error("Error loading episodes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleToggleFavorite = async (videoId: string) => {
    if (!user) return;
    try {
      const existingFav = favorites.find(f => f.videoId === videoId);
      if (existingFav) {
        await DataService.removeFavorite(user.uid, existingFav.id);
        setFavorites(prev => prev.filter(f => f.id !== existingFav.id));
      } else {
        const newFavId = await DataService.addFavorite(user.uid, videoId);
        setFavorites(prev => [...prev, { id: newFavId, videoId, userId: user.uid, createdAt: new Date().toISOString() }]);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleTogglePrivacy = async (videoId: string, currentStatus: boolean) => {
    if (user?.role !== 'admin') return;
    try {
      await DataService.toggleVideoPrivacy(videoId, !currentStatus);
      setVideos(prev => prev.map(v => v.id === videoId ? { ...v, isPrivate: !currentStatus } : v));
    } catch (error) {
      console.error("Error toggling privacy:", error);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este episódio?")) return;
    try {
      await DataService.deleteVideo(videoId);
      setVideos(prev => prev.filter(v => v.id !== videoId));
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  const handleEditVideo = (video: Video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const handleAddVideo = () => {
    setSelectedVideo(null);
    setIsModalOpen(true);
  };

  const handleCleanup = async () => {
    if (!window.confirm("Deseja remover episódios duplicados?")) return;
    try {
      const removedCount = await DataService.cleanupDuplicates();
      alert(`${removedCount} episódios duplicados foram removidos.`);
      loadData();
    } catch (error) {
      console.error("Error cleaning up duplicates:", error);
    }
  };

  const handleSeed = async () => {
    if (!window.confirm("Deseja adicionar episódios de exemplo?")) return;
    try {
      await DataService.seedData();
      alert("Episódios de exemplo adicionados com sucesso.");
      loadData();
    } catch (error) {
      console.error("Error seeding data:", error);
    }
  };

  const filteredAndSortedVideos = useMemo(() => {
    let result = [...videos];

    if (filterCategory !== 'all') {
      result = result.filter(v => v.category === filterCategory);
    }

    if (sortBy === 'recent') {
      result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }

    return result;
  }, [videos, filterCategory, sortBy]);
  
  const FilterSelect: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[] }> = ({ label, value, onChange, options }) => (
    <div className="flex flex-col gap-1 w-full">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <select
            value={value}
            onChange={onChange}
            className="w-full bg-gray-100 border-none text-gray-800 font-bold py-3 px-4 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:bg-white transition-all appearance-none cursor-pointer"
        >
            {options.map(option => {
                let label = option;
                if (option === 'all') label = 'Todos';
                if (option === 'recent') label = 'Recentes';
                if (option === 'popular') label = 'Populares';
                return <option key={option} value={option}>{label}</option>;
            })}
        </select>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gray-900 py-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500 via-transparent to-transparent"></div>
          </div>
          <div className="container mx-auto px-6 relative z-10">
              <h1 className="text-5xl font-black text-white uppercase tracking-tighter">Explorar <span className="text-yellow-500">Episódios</span></h1>
              <p className="text-gray-400 mt-4 max-w-xl mx-auto">Filtrados por nicho ou popularidade. Descubra o melhor de Capão da Canoa.</p>
              
              {user?.role === 'admin' && (
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <button 
                    onClick={handleAddVideo}
                    className="inline-flex items-center gap-2 bg-yellow-500 text-gray-900 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-yellow-600 transition-all shadow-xl shadow-yellow-500/20"
                  >
                    <Plus className="w-5 h-5" /> Novo Episódio
                  </button>
                  <button 
                    onClick={handleCleanup}
                    className="inline-flex items-center gap-2 bg-gray-800 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-gray-700 transition-all border border-gray-700"
                  >
                    Limpar Duplicados
                  </button>
                  <button 
                    onClick={handleSeed}
                    className="inline-flex items-center gap-2 bg-gray-800 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-gray-700 transition-all border border-gray-700"
                  >
                    Gerar Exemplos
                  </button>
                </div>
              )}
          </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Modern Filters Bar */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 -mt-20 relative z-30 mb-16 grid grid-cols-1 md:grid-cols-2 gap-6">
            <FilterSelect label="Categoria" value={filterCategory} onChange={e => setFilterCategory(e.target.value)} options={categories} />
            <FilterSelect label="Ordenar por" value={sortBy} onChange={e => setSortBy(e.target.value)} options={['recent', 'popular']} />
        </div>

        {/* Video Grid */}
        {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="bg-gray-100 animate-pulse aspect-[9/16] rounded-3xl"></div>)}
             </div>
        ) : filteredAndSortedVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredAndSortedVideos.map(video => (
              <VideoCard 
                key={video.id} 
                video={video} 
                isFavorite={favorites.some(f => f.videoId === video.id)}
                onToggleFavorite={(e) => {
                  e.preventDefault();
                  handleToggleFavorite(video.id);
                }}
                isAdmin={user?.role === 'admin'}
                onTogglePrivacy={(e) => {
                  e.preventDefault();
                  handleTogglePrivacy(video.id, !!video.isPrivate);
                }}
                onEdit={(e) => {
                  e.preventDefault();
                  handleEditVideo(video);
                }}
                onDelete={(e) => {
                  e.preventDefault();
                  handleDeleteVideo(video.id);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-gray-50 rounded-3xl">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <h3 className="text-2xl font-bold text-gray-700">Nenhum resultado encontrado</h3>
            <p className="text-gray-500 mt-2">Tente mudar os filtros ou pesquisar por outro bairro.</p>
          </div>
        )}
      </div>

      <EpisodeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={loadData} 
        video={selectedVideo} 
      />
    </div>
  );
};

export default Episodes;
