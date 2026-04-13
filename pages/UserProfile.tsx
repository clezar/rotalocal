
import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DataService } from '../services/dataService';
import VideoCard from '../components/VideoCard';
import type { Video, Favorite, CommercialRequest } from '../types';

const UserProfile: React.FC = () => {
  const { user, isAuthenticated, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'favorites' | 'requests'>('profile');
  const [favorites, setFavorites] = useState<Video[]>([]);
  const [requests, setRequests] = useState<CommercialRequest[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      setLoadingData(true);
      try {
        const isAdmin = user?.role === 'admin';
        if (activeTab === 'favorites') {
          const favDocs = await DataService.getFavorites(user.uid);
          const allVideos = await DataService.getVideos(isAdmin);
          const favVideos = allVideos.filter(v => favDocs.some(f => f.videoId === v.id));
          setFavorites(favVideos);
        } else if (activeTab === 'requests') {
          const userRequests = await DataService.getUserCommercialRequests(user.email);
          setRequests(userRequests);
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
      } finally {
        setLoadingData(false);
      }
    };
    if (activeTab !== 'profile') {
      loadData();
    }
  }, [user, activeTab]);

  if (authLoading) return <div className="p-20 text-center">Carregando...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSeedData = async () => {
    if (!user || user.role !== 'admin') return;
    setLoadingData(true);
    try {
      await DataService.seedData();
      alert("Dados de exemplo criados com sucesso!");
      if (activeTab === 'favorites') {
        // Refresh if needed
      }
    } catch (error) {
      alert("Erro ao criar dados de exemplo.");
    } finally {
      setLoadingData(false);
    }
  };

  const handleToggleFavorite = async (videoId: string) => {
    if (!user) return;
    try {
      const favDocs = await DataService.getFavorites(user.uid);
      const existingFav = favDocs.find(f => f.videoId === videoId);
      if (existingFav) {
        await DataService.removeFavorite(user.uid, existingFav.id);
        setFavorites(prev => prev.filter(v => v.id !== videoId));
      } else {
        await DataService.addFavorite(user.uid, videoId);
        const isAdmin = user?.role === 'admin';
        const allVideos = await DataService.getVideos(isAdmin);
        const videoToAdd = allVideos.find(v => v.id === videoId);
        if (videoToAdd) {
          setFavorites(prev => [...prev, videoToAdd]);
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleTogglePrivacy = async (videoId: string, currentStatus: boolean) => {
    if (user?.role !== 'admin') return;
    try {
      await DataService.toggleVideoPrivacy(videoId, !currentStatus);
      setFavorites(prev => prev.map(v => v.id === videoId ? { ...v, isPrivate: !currentStatus } : v));
    } catch (error) {
      console.error("Error toggling privacy:", error);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gray-900 py-20">
        <div className="container mx-auto px-6 flex flex-col items-center">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} className="w-24 h-24 rounded-full border-4 border-white shadow-2xl mb-4 object-cover" />
            ) : (
              <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center text-3xl font-black text-gray-900 mb-4 border-4 border-white shadow-2xl">
                  {user?.displayName.charAt(0)}
              </div>
            )}
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">{user?.displayName}</h1>
            <p className="text-gray-400">{user?.email}</p>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1 space-y-4">
                <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 sticky top-24">
                    <nav className="space-y-2">
                        <button 
                          onClick={() => setActiveTab('profile')}
                          className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'profile' ? 'bg-yellow-50 text-yellow-700' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            👤 Meu Perfil
                        </button>
                        <button 
                          onClick={() => setActiveTab('favorites')}
                          className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'favorites' ? 'bg-yellow-50 text-yellow-700' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            ❤ Meus Favoritos
                        </button>
                        <button 
                          onClick={() => setActiveTab('requests')}
                          className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'requests' ? 'bg-yellow-50 text-yellow-700' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            📩 Solicitações
                        </button>
                        <button 
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold transition-colors mt-6 border-t border-gray-100 pt-6"
                        >
                            🚪 Sair da Conta
                        </button>
                    </nav>
                </div>
            </div>

            <div className="md:col-span-3 space-y-6">
                 {activeTab === 'profile' && (
                   <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                      <h2 className="text-2xl font-black text-gray-900 mb-6 uppercase tracking-tighter">Dados da Conta</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nome</label>
                              <p className="font-bold text-gray-700">{user?.displayName}</p>
                          </div>
                          <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">E-mail</label>
                              <p className="font-bold text-gray-700">{user?.email}</p>
                          </div>
                          <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Membro Desde</label>
                              <p className="font-bold text-gray-700">{new Date(user?.createdAt || '').toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tipo de Conta</label>
                              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold uppercase">{user?.role}</span>
                          </div>
                      </div>
                      
                      {user?.role === 'admin' && (
                        <div className="mt-10 pt-10 border-t border-gray-100">
                          <h3 className="text-lg font-black text-gray-900 mb-4 uppercase tracking-tighter">Painel Administrativo</h3>
                          <button 
                            onClick={handleSeedData}
                            disabled={loadingData}
                            className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-gray-800 transition-all disabled:opacity-50"
                          >
                            {loadingData ? 'Criando...' : '🚀 Criar Episódios de Exemplo'}
                          </button>
                        </div>
                      )}
                   </div>
                 )}

                 {activeTab === 'favorites' && (
                   <div className="space-y-6">
                      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                        <h2 className="text-2xl font-black text-gray-900 mb-6 uppercase tracking-tighter">Meus Favoritos</h2>
                        {loadingData ? (
                          <div className="py-12 text-center text-gray-400">Carregando seus favoritos...</div>
                        ) : favorites.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {favorites.map(video => (
                              <VideoCard 
                                key={video.id} 
                                video={video} 
                                isFavorite={true}
                                onToggleFavorite={(e) => {
                                  e.preventDefault();
                                  handleToggleFavorite(video.id);
                                }}
                                isAdmin={user?.role === 'admin'}
                                onTogglePrivacy={(e) => {
                                  e.preventDefault();
                                  handleTogglePrivacy(video.id, !!video.isPrivate);
                                }}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="bg-gray-50 rounded-3xl p-8 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center py-16">
                            <p className="text-gray-400 font-medium mb-4">Você ainda não favoritou nenhum negócio local.</p>
                            <Link to="/episodios" className="text-yellow-600 font-bold hover:underline uppercase tracking-widest text-sm">Explorar Episódios →</Link>
                          </div>
                        )}
                      </div>
                   </div>
                 )}

                 {activeTab === 'requests' && (
                   <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                      <h2 className="text-2xl font-black text-gray-900 mb-6 uppercase tracking-tighter">Minhas Solicitações</h2>
                      {loadingData ? (
                        <div className="py-12 text-center text-gray-400">Carregando suas solicitações...</div>
                      ) : requests.length > 0 ? (
                        <div className="space-y-4">
                          {requests.map(req => (
                            <div key={req.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div>
                                <h3 className="font-bold text-gray-900">{req.businessName}</h3>
                                <p className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleDateString('pt-BR')} às {new Date(req.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                  req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                                  req.status === 'contacted' ? 'bg-blue-100 text-blue-700' : 
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {req.status === 'pending' ? 'Pendente' : req.status === 'contacted' ? 'Em Contato' : 'Concluído'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-3xl p-8 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center py-16">
                          <p className="text-gray-400 font-medium mb-4">Nenhuma solicitação comercial encontrada.</p>
                          <Link to="/comercial" className="text-yellow-600 font-bold hover:underline uppercase tracking-widest text-sm">Seja um Parceiro →</Link>
                        </div>
                      )}
                   </div>
                 )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
