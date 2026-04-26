import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import type { Business } from '../types';
import { Trash2 } from 'lucide-react';

const LocalGuide: React.FC = () => {
    const { user } = useAuth();
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isCleaning, setIsCleaning] = useState(false);

    const loadBusinesses = async () => {
        setLoading(true);
        const data = await DataService.getBusinesses();
        setBusinesses(data);
        setLoading(false);
    };

    useEffect(() => {
        loadBusinesses();
    }, []);

    const handleCleanup = async () => {
        if (!window.confirm("Deseja excluir negócios com nomes repetidos? Esta ação é irreversível.")) return;
        
        setIsCleaning(true);
        try {
            const count = await DataService.cleanupDuplicateBusinesses();
            await loadBusinesses();
            alert(`Limpeza concluída! ${count} negócios duplicados foram removidos.`);
        } catch (error) {
            console.error(error);
            alert("Erro ao realizar limpeza.");
        } finally {
            setIsCleaning(false);
        }
    };

    const categories = Array.from(new Set(businesses.map(b => b.category))).filter(Boolean);

    const filtered = businesses.filter(b => {
        const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              b.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? b.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

    // Ensure unique businesses by ID for rendering
    const uniqueFiltered = Array.from(new Map(filtered.map(b => [b.id, b])).values());

    return (
        <div className="bg-gray-50 min-h-screen py-20">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-5xl font-black text-gray-900 mb-6 uppercase tracking-tighter">
                        Guia <span className="text-yellow-500">Local</span>
                    </h1>
                    <p className="text-xl text-gray-600 font-medium leading-relaxed">
                        Encontre os melhores negócios, serviços e gastronomia em Capão da Canoa.
                    </p>

                    {user?.role === 'admin' && (
                        <button 
                            onClick={handleCleanup}
                            disabled={isCleaning}
                            className="mt-8 inline-flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-600 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4" /> 
                            {isCleaning ? 'Limpando...' : 'Remover Negócios Repetidos'}
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-[2rem] shadow-xl p-8 max-w-5xl mx-auto mb-16 border border-gray-100 flex flex-col md:flex-row gap-6 items-center z-10 relative">
                    <div className="flex-1 w-full relative">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                            <span className="text-2xl">🔍</span>
                        </div>
                        <input
                            type="text"
                            placeholder="O que você está procurando?"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-16 pr-6 py-6 bg-gray-50 border border-transparent rounded-[1.5rem] focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all font-medium text-lg placeholder:text-gray-400"
                        />
                    </div>
                    <div className="w-full md:w-64">
                         <select 
                            value={selectedCategory} 
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-6 py-6 bg-gray-50 border border-transparent rounded-[1.5rem] focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all font-medium text-gray-700 cursor-pointer appearance-none"
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
                            <Link key={business.id} to={`/negocio/${business.id}`} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col h-full transform hover:-translate-y-2">
                                <div className="h-48 overflow-hidden relative">
                                    <img 
                                        src={business.coverUrl || business.gallery?.[0] || 'https://images.unsplash.com/photo-1556761175-5973dc0f32b7?auto=format&fit=crop&q=80&w=800'} 
                                        alt={business.name} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest text-gray-900 shadow-xl">
                                            {business.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-black text-gray-900 mb-3 uppercase tracking-tighter leading-tight group-hover:text-yellow-600 transition-colors">
                                        {business.name}
                                    </h3>
                                    <p className="text-gray-500 font-medium mb-6 line-clamp-2">
                                        {business.description}
                                    </p>
                                    <div className="mt-auto space-y-3">
                                        {business.address && business.address !== 'Informação não disponível' && (
                                            <div className="flex items-center text-sm font-medium text-gray-400">
                                                <span className="mr-2">📍</span> <span className="truncate">{business.address}</span>
                                            </div>
                                        )}
                                        {business.phone && (
                                            <div className="flex items-center text-sm font-medium text-gray-400">
                                                <span className="mr-2">📞</span> {business.phone}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-6">🏪</div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Nenhum negócio encontrado</h3>
                        <p className="text-gray-500">Tente buscar com outros termos ou limpe os filtros.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LocalGuide;
