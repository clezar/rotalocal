import React, { useState, useEffect } from 'react';
import type { Business } from '../types';
import { DataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import { X } from 'lucide-react';

interface BusinessModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    business: Business | null;
}

const BusinessModal: React.FC<BusinessModalProps> = ({ isOpen, onClose, onSave, business }) => {
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<Business>>({});

    useEffect(() => {
        if (isOpen) {
            setFormData(business || {
                name: '',
                category: '',
                description: '',
                address: '',
                phone: '',
                whatsapp: '',
                instagram: '',
                coverUrl: '',
                gallery: []
            });
        }
    }, [isOpen, business]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        setIsSaving(true);
        try {
            const data = {
                ...formData,
                ownerId: business?.ownerId || user.uid
            } as Omit<Business, 'id'>;

            if (business?.id && !business.id.startsWith('virtual-')) {
                await DataService.updateBusiness(business.id, data);
            } else {
                const newBusinessId = await DataService.createBusiness(data);
                // If this was a virtual business created from a video, link them
                if (business?.id?.startsWith('virtual-')) {
                    const videoId = business.id.replace('virtual-', '');
                    await DataService.updateVideo(videoId, { businessId: newBusinessId });
                }
            }
            onSave();
            onClose();
        } catch (error) {
            console.error("Error saving business:", error);
            alert("Erro ao salvar informações do negócio.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-10">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">
                            {business?.id && !business.id.startsWith('virtual-') ? 'Editar Negócio' : 'Cadastrar Negócio'}
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-6 h-6 text-gray-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Nome do Negócio *</label>
                                <input 
                                    required 
                                    type="text" 
                                    value={formData.name || ''} 
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Categoria *</label>
                                <input 
                                    required 
                                    type="text" 
                                    placeholder="Ex: Gastronomia, Serviços"
                                    value={formData.category || ''} 
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all font-medium"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Descrição Curta *</label>
                                <textarea 
                                    required 
                                    value={formData.description || ''} 
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all font-medium min-h-[100px]"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Endereço Completo</label>
                                <input 
                                    type="text" 
                                    value={formData.address || ''} 
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">WhatsApp</label>
                                <input 
                                    type="text" 
                                    placeholder="Ex: 5551988887777"
                                    value={formData.whatsapp || ''} 
                                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Instagram (@)</label>
                                <input 
                                    type="text" 
                                    placeholder="Ex: rotalocal"
                                    value={formData.instagram || ''} 
                                    onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all font-medium"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Imagem de Capa (URL)</label>
                                <input 
                                    type="url" 
                                    placeholder="https://..."
                                    value={formData.coverUrl || ''} 
                                    onChange={e => setFormData({ ...formData, coverUrl: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all font-medium"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="w-full bg-yellow-500 text-gray-900 font-black py-5 rounded-2xl hover:bg-yellow-600 transition-all shadow-xl shadow-yellow-500/20 uppercase tracking-widest text-sm disabled:opacity-50"
                        >
                            {isSaving ? 'Salvando...' : 'Salvar Informações'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BusinessModal;
