import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import type { Business, Video } from '../types';
import { Edit2, Plus, Trash2, MapPin, Phone, MessageCircle, Globe, ExternalLink, Search } from 'lucide-react';
import BusinessModal from '../components/BusinessModal';

const LocalGuide: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categories, setCategories] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [bizData, catData, videoData] = await Promise.all([
                DataService.getBusinesses(),
                DataService.getCategories(),
                DataService.getVideos(true) // Get all videos to match thumbnails
            ]);
            setBusinesses(bizData);
            setCategories(catData.map(c => c.name));
            setVideos(videoData);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAddBusiness = () => {
        setSelectedBusiness(null);
        setIsModalOpen(true);
    };

    const filtered = businesses.filter(b => {
        if (!b || !b.name) return false;
        const name = b.name || '';
        const description = b.description || '';
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? b.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

    // Ensure unique businesses by ID for rendering
    const uniqueFiltered = Array.from(new Map(filtered.map(b => [b.id, b])).values());

    return (
        <div className="bg-gray-50 min-h-screen py-10 md:py-20">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 md:mb-6 uppercase tracking-tighter">
                        Guia <span className="text-yellow-500">Local</span>
                    </h1>
                    <p className="text-gray-600 mt-4 max-w-xl mx-auto leading-relaxed">
                        Encontre os melhores negócios, serviços e gastronomia em Capão da Canoa.
                    </p>

                    {user?.role === 'admin' && (
                        <div className="flex flex-wrap justify-center gap-4 mt-6 md:mt-8">
                            <button 
                                onClick={handleAddBusiness}
                                className="inline-flex items-center gap-2 bg-yellow-500 text-gray-900 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-yellow-600 transition-all shadow-xl shadow-yellow-500/20"
                            >
                                <Plus className="w-5 h-5" /> Novo Negócio
                            </button>
                        </div>
                    )}
                </div>

                {/* Seção de Busca e Filtros */}
                <div className="max-w-5xl mx-auto mb-10 md:mb-16">
                    <div className="bg-gray-100/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-gray-200 flex flex-col md:flex-row gap-4 md:gap-6 items-center">
                        <div className="flex-1 w-full relative">
                            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                                <Search className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Pesquisar por nome ou bairro..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500 outline-none transition-all font-bold text-gray-800 placeholder:text-gray-400"
                            />
                        </div>
                        <div className="w-full md:w-72 relative">
                             <select 
                                value={selectedCategory} 
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500 outline-none transition-all font-bold text-gray-700 cursor-pointer appearance-none"
                                style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'/%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1em' }}
                            >
                                <option value="">Todas as Categorias</option>
                                {categories.map((c, i) => (
                                    <option key={i} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-xl font-bold text-gray-400">Carregando negócios...</div>
                ) : uniqueFiltered.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {uniqueFiltered.map(business => (
                            <div 
                                key={business.id} 
                                onClick={() => navigate(`/negocio/${business.id}`)}
                                className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col h-full transform hover:-translate-y-2 cursor-pointer"
                            >
                                {/* Imagem de Capa */}
                                <div className="relative aspect-[2.4/1] overflow-hidden">
                                    <img 
                                        src={videos.find(v => v.businessId === business.id)?.thumbnailUrl || business.coverUrl || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80"} 
                                        alt={business.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent opacity-80" />
                                    
                                    <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                                        <span className="bg-yellow-500 text-gray-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-yellow-500/20">
                                            {business.category}
                                        </span>
                                        {user?.role === 'admin' && (
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedBusiness(business);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-2 bg-white/20 backdrop-blur-md hover:bg-yellow-500 text-white hover:text-gray-900 rounded-full transition-all border border-white/10"
                                                    title="Editar Negócio"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (!window.confirm(`Tem certeza que deseja excluir "${business.name}"?`)) return;
                                                        try {
                                                            await DataService.deleteBusiness(business.id);
                                                            alert("Negócio excluído com sucesso!");
                                                            loadData();
                                                        } catch (error) {
                                                            console.error(error);
                                                            alert("Erro ao excluir negócio.");
                                                        }
                                                    }}
                                                    className="p-2 bg-white/20 backdrop-blur-md hover:bg-red-500 text-white rounded-full transition-all border border-white/10"
                                                    title="Excluir Negócio"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="absolute bottom-6 left-6 right-6">
                                        <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-tight group-hover:text-yellow-400 transition-colors drop-shadow-xl">
                                            {business.name}
                                        </h3>
                                    </div>
                                </div>

                                <div className="p-6 md:p-8 flex-1 flex flex-col">
                                    <div className="space-y-4">
                                        {business.address && business.address !== 'Informação não disponível' && (
                                            <a 
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address + ', Capão da Canoa, RS')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex items-start gap-4 text-sm font-semibold text-gray-500 hover:text-yellow-600 transition-colors"
                                            >
                                                <MapPin className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
                                                <span className="line-clamp-2">{business.address}</span>
                                            </a>
                                        )}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {business.phone && (
                                                <a 
                                                    href={`tel:${business.phone.replace(/\D/g, '')}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex items-center gap-4 text-sm font-semibold text-gray-500 hover:text-yellow-600 transition-colors"
                                                >
                                                    <Phone className="w-5 h-5 text-yellow-500 shrink-0" />
                                                    <span className="truncate">{business.phone}</span>
                                                </a>
                                            )}

                                            {business.whatsapp && (
                                                <a 
                                                    href={`https://wa.me/55${business.whatsapp.replace(/\D/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex items-center gap-4 text-sm font-semibold text-gray-500 hover:text-green-600 transition-colors"
                                                >
                                                    <MessageCircle className="w-5 h-5 text-green-500 shrink-0" />
                                                    <span>WhatsApp</span>
                                                </a>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between pt-2">
                                            {business.website ? (
                                                <a 
                                                    href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex items-center gap-4 text-sm font-semibold text-gray-500 hover:text-blue-500 transition-colors"
                                                >
                                                    <Globe className="w-5 h-5 text-blue-500 shrink-0" />
                                                    <span className="truncate">{business.website.replace(/^https?:\/\//, '')}</span>
                                                </a>
                                            ) : (
                                                <div />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 px-6 bg-white rounded-[3rem] shadow-sm border border-gray-100 max-w-4xl mx-auto">
                        <div className="text-6xl mb-6">🏪</div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Nenhum negócio encontrado</h3>
                        <p className="text-gray-600 font-medium">Tente buscar com outros termos ou limpe os filtros para ver todos os resultados.</p>
                        <button 
                            onClick={() => { setSearchTerm(''); setSelectedCategory(''); }}
                            className="mt-8 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition-all"
                        >
                            Ver Todos os Negócios
                        </button>
                    </div>
                )}
            </div>

            <BusinessModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={loadData} 
                business={selectedBusiness} 
            />
        </div>
    );
};

export default LocalGuide;
