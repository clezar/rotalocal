import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DataService } from '../services/dataService';
import type { Business } from '../types';

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
    const [editing, setEditing] = useState<Partial<Business> | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadBusinesses();
    }, [user]);

    const loadBusinesses = async () => {
        if (!user) return;
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

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !editing) return;
        
        setIsSaving(true);
        try {
            const businessData = {
                ...editing,
                ownerId: user.uid
            } as Omit<Business, 'id'>;

            if (editing.id) {
                await DataService.updateBusiness(editing.id, businessData);
            } else {
                await DataService.createBusiness(businessData);
            }
            
            await loadBusinesses();
            setEditing(null);
        } catch (error) {
            console.error("Error saving business:", error);
            alert("Erro ao salvar negócio. Verifique os dados.");
        } finally {
            setIsSaving(false);
        }
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

    if (loading) return <div className="text-center py-10">Carregando...</div>;

    if (editing) {
        return (
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
                        {editing.id ? 'Editar Negócio' : 'Novo Negócio'}
                    </h2>
                    <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-900 font-bold uppercase tracking-widest text-[10px]">
                        Voltar
                    </button>
                </div>
                
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Nome do Negócio *</label>
                            <input required type="text" value={editing.name || ''} onChange={e => setEditing({...editing, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none transition-all font-medium" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Categoria *</label>
                            <input required type="text" placeholder="Ex: Gastronomia, Serviços" value={editing.category || ''} onChange={e => setEditing({...editing, category: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none transition-all font-medium" />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Descrição Curta *</label>
                            <textarea required value={editing.description || ''} onChange={e => setEditing({...editing, description: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none transition-all font-medium min-h-[100px]" />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Endereço Completo</label>
                            <input type="text" value={editing.address || ''} onChange={e => setEditing({...editing, address: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none transition-all font-medium" />
                        </div>
                         <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Telefone Fixo</label>
                            <input type="text" value={editing.phone || ''} onChange={e => setEditing({...editing, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none transition-all font-medium" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">WhatsApp</label>
                            <input type="text" placeholder="Apenas números, ex: 5551988887777" value={editing.whatsapp || ''} onChange={e => setEditing({...editing, whatsapp: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none transition-all font-medium" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Instagram (@)</label>
                            <input type="text" placeholder="Sem o @, ex: rotalocal" value={editing.instagram || ''} onChange={e => setEditing({...editing, instagram: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none transition-all font-medium" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Imagem Principal (URL)</label>
                            <input type="url" placeholder="URL da foto" value={editing.coverUrl || ''} onChange={e => setEditing({...editing, coverUrl: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none transition-all font-medium" />
                        </div>
                    </div>
                    
                    <button type="submit" disabled={isSaving} className="w-full bg-yellow-500 text-gray-900 font-black py-4 rounded-xl hover:bg-yellow-600 transition-all uppercase tracking-widest text-sm disabled:opacity-50 mt-6 shadow-xl shadow-yellow-500/20">
                        {isSaving ? 'Salvando...' : 'Salvar Negócio'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
                    {user?.role === 'admin' ? 'Gerenciar Negócios' : 'Meus Negócios'}
                </h2>
                <button 
                  onClick={() => setEditing(INITIAL_BUSINESS)}
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
                                    onClick={() => setEditing(b)}
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
        </div>
    );
};

export default MyBusinesses;
