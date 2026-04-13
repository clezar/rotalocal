
import React, { useEffect, useState } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { DataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import type { Business, Video } from '../types';
import { Edit2, Trash2 } from 'lucide-react';
import EpisodeModal from '../components/EpisodeModal';

const BusinessProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [business, setBusiness] = useState<Business | null>(null);
    const [video, setVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState(true);
    
    // CRUD State
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadData = async () => {
        if (!id) return;
        try {
            const b = await DataService.getBusinessById(id);
            if (b) {
                setBusiness(b);
                const isAdmin = user?.role === 'admin';
                const allVideos = await DataService.getVideos(isAdmin);
                const v = allVideos.find(vid => vid.businessId === b.id);
                setVideo(v || null);
            } else {
                // If business not found, check if ID is a video ID or a businessId for a video
                let v = await DataService.getVideoById(id);
                if (!v) {
                    v = await DataService.getVideoByBusinessId(id);
                }
                
                if (v) {
                    setVideo(v);
                    // Create a virtual business from video data
                    setBusiness({
                        id: 'virtual-' + v.id,
                        name: v.title,
                        category: v.category,
                        description: v.description,
                        address: 'Informação não disponível',
                        phone: '',
                        whatsapp: '',
                        instagram: '',
                        gallery: [v.thumbnailUrl],
                        coverUrl: v.thumbnailUrl
                    });
                }
            }
        } catch (error) {
            console.error("Error loading business profile:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id, user]);

    const handleTogglePrivacy = async (videoId: string, currentStatus: boolean) => {
        if (user?.role !== 'admin') return;
        try {
            await DataService.toggleVideoPrivacy(videoId, !currentStatus);
            if (video && video.id === videoId) {
                setVideo({ ...video, isPrivate: !currentStatus });
            }
        } catch (error) {
            console.error("Error toggling privacy:", error);
        }
    };

    const handleDeleteVideo = async (videoId: string) => {
        if (!window.confirm("Tem certeza que deseja excluir este episódio?")) return;
        try {
            await DataService.deleteVideo(videoId);
            setVideo(null);
        } catch (error) {
            console.error("Error deleting video:", error);
        }
    };

    const handleEditVideo = () => {
        setIsModalOpen(true);
    };

    if (loading) return <div className="p-20 text-center">Carregando...</div>;
    if (!business) return <Navigate to="/episodios" replace />;

    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    return (
        <div className="bg-white pb-20">
            {/* Business Header / Cover */}
            <div className="bg-gray-900 text-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <img src={business.coverUrl || business.gallery[0]} alt="" className="w-full h-full object-cover blur-sm" />
                </div>
                <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
                    <span className="bg-yellow-500 text-gray-900 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                        {business.category}
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black mb-4 uppercase tracking-tighter">{business.name}</h1>
                    <p className="text-xl text-gray-400 max-w-2xl italic font-light">"{business.description}"</p>
                </div>
            </div>

            <div className="container mx-auto px-6 -mt-10 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Video Player Section */}
                        {video && (
                            <div className="relative mb-12 flex justify-center">
                                <div className="bg-black rounded-[2rem] overflow-hidden shadow-2xl aspect-[9/16] w-full max-w-[400px] border-4 border-white relative">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${getYoutubeId(video.videoUrl)}`}
                                        title={video.title}
                                        className="w-full h-full"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                                
                                {user?.role === 'admin' && (
                                    <div className="absolute top-6 right-6 flex flex-col gap-3 z-30">
                                        <button 
                                            onClick={() => handleTogglePrivacy(video.id, !!video.isPrivate)}
                                            className={`p-3 rounded-full backdrop-blur-md shadow-2xl transition-all ${video.isPrivate ? 'bg-gray-900 text-white' : 'bg-white/90 text-gray-500 hover:text-gray-900'}`}
                                            title={video.isPrivate ? "Tornar Público" : "Tornar Privado"}
                                        >
                                            <div className="flex items-center gap-2 px-2">
                                                {video.isPrivate ? (
                                                    <>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Público</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path></svg>
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Privado</span>
                                                    </>
                                                )}
                                            </div>
                                        </button>

                                        <button 
                                            onClick={handleEditVideo}
                                            className="p-3 rounded-full bg-white/90 text-gray-500 hover:text-yellow-600 backdrop-blur-md shadow-2xl transition-all"
                                            title="Editar Episódio"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>

                                        <button 
                                            onClick={() => handleDeleteVideo(video.id)}
                                            className="p-3 rounded-full bg-white/90 text-gray-500 hover:text-red-600 backdrop-blur-md shadow-2xl transition-all"
                                            title="Excluir Episódio"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                                
                                {video.isPrivate && (
                                    <div className="absolute bottom-6 left-6 bg-red-500 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl z-30 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                        Vídeo Privado (Apenas Admins)
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Description */}
                        <div className="prose prose-lg max-w-none mb-16">
                            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-6 flex items-center">
                                <span className="w-8 h-1 bg-yellow-500 mr-4"></span>
                                Nossa História
                            </h2>
                            <p className="text-gray-600 leading-relaxed text-lg">{business.description}</p>
                        </div>
                        
                        {/* Photo Gallery */}
                        {business.gallery && business.gallery.length > 0 && (
                            <div className="mb-16">
                                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-8">Galeria do <span className="text-yellow-500">Local</span></h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {business.gallery.map((img, index) => (
                                        <div key={index} className="group relative aspect-square overflow-hidden rounded-3xl shadow-lg border border-gray-100">
                                            <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar / Conversion */}
                    <aside className="lg:col-span-1">
                         <div className="sticky top-28 space-y-8">
                            {/* Contact Card */}
                            {(business.whatsapp || business.phone || business.instagram || business.address !== 'Informação não disponível') && (
                                <div className="bg-gray-50 border border-gray-100 p-8 rounded-[2rem] shadow-sm">
                                    <h3 className="text-2xl font-black text-gray-900 mb-6 uppercase tracking-tighter">Informações</h3>
                                    <div className="space-y-6">
                                        {business.whatsapp && (
                                            <a 
                                                href={`https://wa.me/${business.whatsapp}`} 
                                                className="flex items-center justify-center gap-3 w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-green-500/20 uppercase tracking-widest text-sm"
                                            >
                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.38 1.25 4.81L2 22l5.44-1.42c1.38.74 2.95 1.18 4.6 1.18h.01c5.46 0 9.91-4.45 9.91-9.91s-4.45-9.91-9.92-9.91z"/></svg>
                                                WhatsApp Direto
                                            </a>
                                        )}
                                        
                                        <div className="space-y-4">
                                            {business.address !== 'Informação não disponível' && (
                                                <div className="flex gap-4">
                                                    <div className="w-10 h-10 bg-yellow-100 flex items-center justify-center rounded-full text-yellow-600 shrink-0">📍</div>
                                                    <p className="text-gray-600 text-sm font-medium">{business.address}</p>
                                                </div>
                                            )}
                                            {business.phone && (
                                                <div className="flex gap-4">
                                                    <div className="w-10 h-10 bg-yellow-100 flex items-center justify-center rounded-full text-yellow-600 shrink-0">📞</div>
                                                    <p className="text-gray-600 text-sm font-medium">{business.phone}</p>
                                                </div>
                                            )}
                                            {business.instagram && (
                                                <a href={`https://instagram.com/${business.instagram}`} target="_blank" className="flex gap-4 group">
                                                    <div className="w-10 h-10 bg-pink-100 group-hover:bg-pink-200 flex items-center justify-center rounded-full text-pink-600 shrink-0 transition-colors">📷</div>
                                                    <p className="text-gray-600 text-sm font-bold self-center">@{business.instagram}</p>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                         </div>
                    </aside>
                </div>
            </div>
            
            <EpisodeModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={loadData} 
                video={video} 
            />
        </div>
    );
};

export default BusinessProfile;
