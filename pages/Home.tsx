
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Globe, MessageCircle, ExternalLink, Search } from 'lucide-react';
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
      // Ensure unique IDs
      const uniqueFeatured = Array.from(new Map(featured.map(v => [v.id, v])).values());
      const uniqueAll = Array.from(new Map(all.map(v => [v.id, v])).values());
      
      setFeaturedVideos(uniqueFeatured);
      setLocalStories(uniqueAll.slice(0, 6)); // Just a sample for home
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
                src="https://iili.io/BsKyZPI.jpg" 
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

      {/* Guia Local Promotion */}
      <section className="py-24 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-2xl shadow-gray-200/50 border border-gray-100 flex flex-col lg:flex-row items-center gap-12 relative group/section">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none hidden lg:block">
               <img src="https://iili.io/BsKyitR.png" alt="" className="w-64 h-64 grayscale transition-transform duration-1000 group-hover/section:rotate-12" />
            </div>
            
            <div className="flex-1 space-y-8 relative z-10">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-500 text-gray-900 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-yellow-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-900 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-900"></span>
                </span>
                Diretório da Cidade
              </span>
              
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 uppercase tracking-tighter leading-none">
                Guia <span className="text-yellow-500">Local</span> Completo
              </h2>
              
              <div className="space-y-4">
                <p className="text-xl text-gray-600 leading-relaxed font-medium">
                  Tudo o que você precisa saber sobre o comércio de Capão da Canoa em um só lugar. Encontre informações precisas para facilitar seu dia a dia.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  {[
                    { icon: <Phone className="w-5 h-5 text-yellow-500" />, text: "Telefones e WhatsApp" },
                    { icon: <MapPin className="w-5 h-5 text-yellow-500" />, text: "Endereços via GPS" },
                    { icon: <Globe className="w-5 h-5 text-yellow-500" />, text: "Redes Sociais e Sites" },
                    { icon: <MessageCircle className="w-5 h-5 text-yellow-500" />, text: "Links de Contato Direto" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 group hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all">
                      <div className="p-2 bg-white rounded-lg shadow-sm">{item.icon}</div>
                      <span className="font-bold text-gray-700">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/guia"
                  className="inline-flex items-center justify-center gap-3 bg-gray-900 text-white font-black py-5 px-10 rounded-full hover:bg-yellow-500 hover:text-gray-900 transition-all duration-300 group shadow-xl"
                >
                  ACESSAR O GUIA LOCAL
                  <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            
            <div className="flex-1 w-full lg:max-w-md relative">
              <div className="aspect-[4/5] bg-gray-100 rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
                <div className="absolute inset-0 bg-gray-900">
                    <img 
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80" 
                    alt="Guia Local" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
                
                <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 text-white">
                  <p className="font-black text-2xl uppercase tracking-tighter mb-1 leading-none">Explore a Cidade</p>
                  <p className="text-white/80 text-sm font-medium">Os melhores negócios, serviços e gastronomia de Capão a um só clique de distância.</p>
                </div>
                
                <div className="absolute top-8 right-8 flex gap-2">
                    <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/50">
                        <Search className="w-6 h-6 text-gray-900" />
                    </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-yellow-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-gray-900 rounded-full blur-3xl opacity-10"></div>
            </div>
          </div>
        </div>
      </section>



      {/* CTA Final */}
      <section className="bg-yellow-500 relative overflow-hidden">
        <div className="absolute -bottom-20 -right-20 opacity-10 pointer-events-none">
            <img src="https://iili.io/BsKyitR.png" alt="" className="w-[500px] h-[500px] object-contain" />
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
