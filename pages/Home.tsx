
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import type { Video, Favorite } from '../types';
import VideoCard from '../components/VideoCard';
import EpisodeModal from '../components/EpisodeModal';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [featuredVideos, setFeaturedVideos] = useState<Video[]>([]);
  const [localStories, setLocalStories] = useState<Video[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  
  // CRUD State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const loadData = async () => {
    try {
      const isAdmin = user?.role === 'admin';
      const [featured, all, favData] = await Promise.all([
        DataService.getFeaturedVideos(3, isAdmin),
        DataService.getVideos(isAdmin),
        user ? DataService.getFavorites(user.uid) : Promise.resolve([])
      ]);
      setFeaturedVideos(featured);
      setLocalStories(all.slice(0, 6)); // Just a sample for home
      setFavorites(favData);
    } catch (error) {
      console.error("Error loading home data:", error);
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
      setFeaturedVideos(prev => prev.map(v => v.id === videoId ? { ...v, isPrivate: !currentStatus } : v));
      setLocalStories(prev => prev.map(v => v.id === videoId ? { ...v, isPrivate: !currentStatus } : v));
    } catch (error) {
      console.error("Error toggling privacy:", error);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este episódio?")) return;
    try {
      await DataService.deleteVideo(videoId);
      setFeaturedVideos(prev => prev.filter(v => v.id !== videoId));
      setLocalStories(prev => prev.filter(v => v.id !== videoId));
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  const handleEditVideo = (video: Video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center bg-gray-900 text-white overflow-hidden">
         <div className="absolute inset-0 z-0 opacity-40">
            <img 
                src="https://rotalocal.com.br/image/centro.png?auto=format&fit=crop&q=80&w=2000" 
                alt="Capão da Canoa" 
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
         </div>
         
         <div className="container mx-auto px-6 py-5 relative z-10">
            <div className="max-w-3xl">
                <span className="inline-block px-3 py-1 bg-yellow-500 text-gray-900 text-xs font-bold uppercase tracking-widest rounded mb-6">
                    Hub de Conexão Local
                </span>
                <h1 className="text-[45px] font-black leading-tight mb-8">
                    Conectando a Comunidade ao <span className="text-yellow-500 italic">Comércio de Capão.</span>
                </h1>
                <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-xl">
                    Descubra as histórias reais por trás dos negócios que fazem nossa cidade pulsar. Vídeos, perfis exclusivos e muito mais.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        to="/comercial"
                        className="bg-yellow-500 text-gray-900 font-bold py-4 px-10 rounded-full hover:bg-yellow-400 transition-all duration-300 text-center shadow-2xl shadow-yellow-500/20"
                    >
                        Quero ser entrevistado
                    </Link>
                    <Link
                        to="/episodios"
                        className="bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold py-4 px-10 rounded-full hover:bg-white hover:text-gray-900 transition-all duration-300 text-center"
                    >
                        Explorar Episódios
                    </Link>
                </div>
            </div>
         </div>
      </section>

      {/* Destaques da Semana */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Destaques <span className="text-yellow-500">do Momento</span></h2>
                <div className="w-20 h-1.5 bg-yellow-500 mt-2"></div>
              </div>
              <Link to="/episodios" className="text-gray-500 hover:text-yellow-600 font-bold border-b-2 border-transparent hover:border-yellow-500 transition-all">Ver todos os episódios →</Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredVideos.map(video => (
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
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-900 py-16 text-white border-y border-white/5">
          <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                  <p className="text-4xl font-black text-yellow-500">100k+</p>
                  <p className="text-gray-400 text-sm uppercase tracking-widest font-bold">Views Mensais</p>
              </div>
              <div>
                  <p className="text-4xl font-black text-yellow-500">50+</p>
                  <p className="text-gray-400 text-sm uppercase tracking-widest font-bold">Comércios</p>
              </div>
              <div>
                  <p className="text-4xl font-black text-yellow-500">15</p>
                  <p className="text-gray-400 text-sm uppercase tracking-widest font-bold">Bairros</p>
              </div>
              <div>
                  <p className="text-4xl font-black text-yellow-500">100%</p>
                  <p className="text-gray-400 text-sm uppercase tracking-widest font-bold">Caponense</p>
              </div>
          </div>
      </section>

      {/* Histórias que Movem Capão */}
       <section className="py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-black text-gray-900 mb-4 uppercase tracking-tighter">Histórias que <span className="text-yellow-500">Movem Capão</span></h2>
          <p className="text-gray-500 max-w-2xl mb-16 text-lg italic">"Atrás de cada balcão, uma jornada de superação e paixão pelo que faz."</p>
           
           {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[1,2,3,4].map(i => <div key={i} className="bg-gray-100 animate-pulse aspect-[9/16] rounded-3xl"></div>)}
             </div>
           ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {localStories.map(video => (
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
           )}
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-yellow-500 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10">
            <svg className="w-64 h-64 text-gray-900" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z"/></svg>
        </div>
        <div className="container mx-auto px-6 py-24 relative z-10 flex flex-col items-center text-center">
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 uppercase tracking-tighter">Sua empresa merece ser vista!</h2>
          <p className="text-gray-800 text-xl max-w-2xl mb-12">
            Junte-se à maior rede de visibilidade local do litoral gaúcho. Vídeos profissionais que convertem.
          </p>
          <Link
            to="/comercial"
            className="bg-gray-900 text-white font-black py-5 px-12 rounded-full hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 text-lg shadow-2xl"
          >
            QUERO PARTICIPAR DO ROTA LOCAL
          </Link>
        </div>
      </section>

      <EpisodeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={loadData} 
        video={selectedVideo} 
      />
    </div>
  );
};

export default Home;
