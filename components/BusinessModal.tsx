import React, { useState, useEffect } from 'react';
import type { Business, Category } from '../types';
import { DataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import { X, Plus } from 'lucide-react';

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
    const [categories, setCategories] = useState<Category[]>([]);
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newGalleryPhoto, setNewGalleryPhoto] = useState('');

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
                website: '',
                coverUrl: '',
                gallery: []
            });
            fetchCategories();
        }
    }, [isOpen, business]);

    const addToGallery = () => {
        if (!newGalleryPhoto.trim()) return;
        const currentGallery = formData.gallery || [];
        setFormData({ ...formData, gallery: [...currentGallery, newGalleryPhoto.trim()] });
        setNewGalleryPhoto('');
    };

    const removeFromGallery = (index: number) => {
        const currentGallery = formData.gallery || [];
        setFormData({ ...formData, gallery: currentGallery.filter((_, i) => i !== index) });
    };

    const fetchCategories = async () => {
        const cats = await DataService.getCategories();
        setCategories(cats);
    };

    const handleAddNewCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            const id = await DataService.createCategory(newCategoryName.trim());
            await fetchCategories();
            setFormData({ ...formData, category: newCategoryName.trim() });
            setNewCategoryName('');
            setShowNewCategoryInput(false);
        } catch (error) {
            console.error("Error creating category:", error);
            alert("Erro ao criar categoria.");
        }
    };

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
            <div className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                <div className="p-10 flex justify-between items-center bg-white z-10 border-b border-gray-50 shrink-0">
                    <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">
                        {business?.id && !business.id.startsWith('virtual-') ? 'Editar Negócio' : 'Cadastrar Negócio'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <div className="p-10 overflow-y-auto flex-1">
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
                                {!showNewCategoryInput ? (
                                    <div className="relative">
                                        <select 
                                            required 
                                            value={formData.category || ''} 
                                            onChange={e => {
                                                if (e.target.value === 'NEW') {
                                                    setShowNewCategoryInput(true);
                                                } else {
                                                    setFormData({ ...formData, category: e.target.value });
                                                }
                                            }}
                                            className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all font-medium appearance-none"
                                        >
                                            <option value="">Selecione uma categoria</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                                            ))}
                                            <option value="NEW" className="text-yellow-600 font-bold">+ Criar Nova Categoria</option>
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input 
                                            autoFocus
                                            type="text" 
                                            placeholder="Nome da categoria"
                                            value={newCategoryName} 
                                            onChange={e => setNewCategoryName(e.target.value)}
                                            className="flex-1 px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all font-medium"
                                        />
                                        <button 
                                            type="button"
                                            onClick={handleAddNewCategory}
                                            className="px-6 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all uppercase text-xs tracking-widest"
                                        >
                                            Add
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setShowNewCategoryInput(false);
                                                setNewCategoryName('');
                                            }}
                                            className="px-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
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

                            {/* Move Gallery here for better visibility */}
                            <div className="md:col-span-2 space-y-4 pt-4 border-t border-gray-50 mt-4">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Galeria do Local</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="url" 
                                        placeholder="URL da foto (https://...)"
                                        value={newGalleryPhoto} 
                                        onChange={e => setNewGalleryPhoto(e.target.value)}
                                        className="flex-1 px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all font-medium"
                                    />
                                    <button 
                                        type="button"
                                        onClick={addToGallery}
                                        className="px-6 bg-yellow-500 text-gray-900 rounded-2xl font-black hover:bg-yellow-600 transition-all uppercase text-xs tracking-widest"
                                    >
                                        Adicionar
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                                    {formData.gallery?.map((photo, index) => (
                                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                                            <img src={photo} alt="" className="w-full h-full object-cover" />
                                            <button 
                                                type="button"
                                                onClick={() => removeFromGallery(index)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
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
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Telefone</label>
                                <input 
                                    type="text" 
                                    placeholder="Ex: (51) 3625-0000"
                                    value={formData.phone || ''} 
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
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
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Site / Link Externo</label>
                                <input 
                                    type="url" 
                                    placeholder="Ex: https://meusite.com.br"
                                    value={formData.website || ''} 
                                    onChange={e => setFormData({ ...formData, website: e.target.value })}
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
