import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DataService } from '../services/dataService';
import type { Business } from '../types';
import BusinessModal from './BusinessModal';

const INITIAL_BUSINESS: Partial<Business> = {
    name: '',
    category: '',
    description: '',
    address: '',
    phone: '',
    whatsapp: '',
    instagram: '',
    website: '',
    gallery: []
};

const MyBusinesses: React.FC = () => {
    const { user } = useAuth();
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);

    useEffect(() => {
        loadBusinesses();
    }, [user]);

    const loadBusinesses = async () => {
        if (!user) return;
        setLoading(true);
        try {
            let data: Business[];
            if (user.role === 'admin') {
                data = await DataService.getBusinesses();
            } else {
                data = await DataService.getUserBusinesses(user.uid);
            }
            // Ensure unique IDs
            const uniqueData = Array.from(new Map(data.map(b => [b.id, b])).values());
            setBusinesses(uniqueData);
        } catch (error) {
            console.error("Error loading businesses:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (business: Business | null) => {
        setEditingBusiness(business);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este negócio?")) return;
        
        try {
            await DataService.deleteBusiness(id);
            await loadBusinesses();
        } catch (error) {
            console.error("Error deleting business:", error);
            alert("Erro ao excluir.");
        }
    };

    if (loading && businesses.length === 0) return <div className="text-center py-10">Carregando...</div>;

    return (
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
                    {user?.role === 'admin' ? 'Gerenciar Negócios' : 'Meus Negócios'}
                </h2>
                <button 
                  onClick={() => handleEdit(null)}
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-[10px] hover:bg-gray-800 transition-all shadow-lg"
                >
                    + Novo Negócio
                </button>
            </div>

            {businesses.length > 0 ? (
                <div className="space-y-4">
                    {businesses.map(b => (
                        <div key={b.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl bg-gray-200 overflow-hidden shrink-0">
                                    {b.coverUrl ? (
                                        <img src={b.coverUrl} alt={b.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl">🏪</div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{b.name}</h3>
                                    <p className="text-sm text-gray-500">{b.category}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <button 
                                    onClick={() => handleEdit(b)}
                                    className="flex-1 md:flex-none px-4 py-2 bg-yellow-100 text-yellow-700 font-bold uppercase tracking-widest text-[10px] rounded-lg hover:bg-yellow-200 transition-colors"
                                >
                                    Editar
                                </button>
                                <button 
                                    onClick={() => handleDelete(b.id)}
                                    className="flex-1 md:flex-none px-4 py-2 bg-red-100 text-red-700 font-bold uppercase tracking-widest text-[10px] rounded-lg hover:bg-red-200 transition-colors"
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-gray-50 rounded-3xl p-8 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center py-16">
                    <p className="text-gray-400 font-medium mb-4">Você ainda não cadastrou nenhum negócio.</p>
                </div>
            )}

            <BusinessModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={loadBusinesses}
                business={editingBusiness}
            />
        </div>
    );
};

export default MyBusinesses;
