import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import type { Business } from '../types';
import { Trash2, MapPin, Phone, MessageCircle, Globe, ExternalLink } from 'lucide-react';

const LocalGuide: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categories, setCategories] = useState<string[]>([]);
    const [isCleaning, setIsCleaning] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            await DataService.seedCategories();
            const [bizData, catData] = await Promise.all([
                DataService.getBusinesses(),
                DataService.getCategories()
            ]);
            setBusinesses(bizData);
            setCategories(catData.map(c => c.name));
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCleanup = async () => {
        if (!window.confirm("Deseja realizar uma limpeza no banco de dados? Isso removerá negócios e categorias duplicadas.")) return;
        
        setIsCleaning(true);
        try {
            const bizCount = await DataService.cleanupDuplicateBusinesses();
            const catCount = await DataService.cleanupDuplicateCategories();
            await loadData();
            alert(`Limpeza concluída! ${bizCount} negócios e ${catCount} categorias duplicadas foram removidos.`);
        } catch (error) {
            console.error(error);
            alert("Erro ao realizar limpeza.");
        } finally {
            setIsCleaning(false);
        }
    };

    const filtered = businesses.filter(b => {
        const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              b.description.toLowerCase().includes(searchTerm.toLowerCase());
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
                    <p className="text-lg md:text-xl text-gray-600 font-medium leading-relaxed">
                        Encontre os melhores negócios, serviços e gastronomia em Capão da Canoa.
                    </p>

                    {user?.role === 'admin' && (
                        <div className="flex flex-wrap justify-center gap-4 mt-6 md:mt-8">
                            <button 
                                onClick={handleCleanup}
                                disabled={isCleaning}
                                className="inline-flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-600 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                            >
                                <Trash2 className="w-4 h-4" /> 
                                {isCleaning ? 'Limpando...' : 'Remover Negócios Repetidos'}
                            </button>

                            <button 
                                onClick={async () => {
                                    if (!window.confirm("Executar correção emergencial (Ariel Barber)?")) return;
                                    setIsCleaning(true);
                                    try {
                                        const result = await DataService.emergencyCorrection();
                                        await loadData();
                                        alert(result);
                                    } catch (err) {
                                        console.error(err);
                                        alert("Erro na correção.");
                                    } finally {
                                        setIsCleaning(false);
                                    }
                                }}
                                disabled={isCleaning}
                                className="inline-flex items-center gap-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                            >
                                ⚡️ Correção Emergencial
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-3xl md:rounded-[2rem] shadow-xl p-6 md:p-8 max-w-5xl mx-auto mb-10 md:mb-16 border border-gray-100 flex flex-col md:flex-row gap-4 md:gap-6 items-center z-10 relative">
                    <div className="flex-1 w-full relative">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                            <span className="text-xl">🔍</span>
                        </div>
                        <input
                            type="text"
                            placeholder="O que você está procurando?"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 md:py-6 bg-gray-50 border border-transparent rounded-2xl md:rounded-[1.5rem] focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all font-medium text-base md:text-lg placeholder:text-gray-400"
                        />
                    </div>
                    <div className="w-full md:w-64">
                         <select 
                            value={selectedCategory} 
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-6 py-4 md:py-6 bg-gray-50 border border-transparent rounded-2xl md:rounded-[1.5rem] focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all font-medium text-gray-700 cursor-pointer appearance-none"
                            style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'/%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1em' }}
                        >
                            <option value="">Todas as Categorias</option>
                            {categories.map((c, i) => (
                                <option key={i} value={c}>{c}</option>
                            ))}
                        </select>
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
                                <div className="p-6 md:p-10 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-6">
                                        <span className="bg-yellow-500 text-gray-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-yellow-500/20">
                                            {business.category}
                                        </span>
                                    </div>

                                    <h3 className="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tighter leading-tight group-hover:text-yellow-600 transition-colors">
                                        {business.name}
                                    </h3>

                                    <div className="mt-auto space-y-5 pt-6 border-t border-gray-50">
                                        {business.address && business.address !== 'Informação não disponível' && (
                                            <a 
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address + ', Capão da Canoa, RS')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex items-start gap-4 text-sm font-semibold text-gray-500 hover:text-yellow-600 transition-colors group/link"
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
        </div>
    );
};

export default LocalGuide;
