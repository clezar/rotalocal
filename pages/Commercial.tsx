
import React, { useState } from 'react';
import { DataService } from '../services/dataService';
import { MOCK_PLANS } from '../constants';

const Commercial: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        businessName: '',
        email: '',
        whatsapp: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await DataService.createCommercialRequest(formData);
            setSuccess(true);
            setFormData({ name: '', businessName: '', email: '', whatsapp: '', message: '' });
        } catch (error) {
            console.error("Error submitting request:", error);
            alert("Ocorreu um erro ao enviar sua solicitação. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white pb-20">
            {/* Commercial Hero */}
            <section className="bg-gray-900 text-white py-24">
                <div className="container mx-auto px-6 text-center">
                    <span className="text-yellow-500 font-black uppercase tracking-widest text-xs mb-4 inline-block">Mídia & Parcerias</span>
                    <h1 className="text-5xl md:text-7xl font-black mb-8 uppercase tracking-tighter">Coloque sua empresa <br/><span className="text-yellow-500">na Rota Local.</span></h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Seu negócio merece uma vitrine profissional. Alcance milhares de moradores e turistas em Capão da Canoa.
                    </p>
                </div>
            </section>

            {/* Mídia Kit Section */}
            <section className="py-24 border-b border-gray-100">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter mb-8 leading-none">Por que anunciar <br/>conosco?</h2>
                            <div className="space-y-8">
                                <div className="flex gap-6">
                                    <div className="text-4xl font-black text-yellow-500 shrink-0">01</div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-2">Público Qualificado</h4>
                                        <p className="text-gray-500">Nossa audiência é 90% composta por moradores e veranistas frequentes de Capão da Canoa.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="text-4xl font-black text-yellow-500 shrink-0">02</div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-2">Conteúdo de Valor</h4>
                                        <p className="text-gray-500">Não fazemos apenas anúncios, contamos histórias que criam conexão emocional com o cliente.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="text-4xl font-black text-yellow-500 shrink-0">03</div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-2">Multiplataforma</h4>
                                        <p className="text-gray-500">Sua marca presente no YouTube, Instagram, Facebook e em nosso Hub exclusivo.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-12 rounded-[3rem] relative">
                            <div className="absolute -top-6 -right-6 bg-yellow-500 p-6 rounded-3xl shadow-xl transform rotate-6">
                                <p className="text-gray-900 font-black text-center">BAIXAR<br/>MÍDIA KIT</p>
                            </div>
                            <h3 className="text-2xl font-black mb-6">Números da Plataforma</h3>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="bg-white p-6 rounded-2xl shadow-sm">
                                    <p className="text-3xl font-black text-yellow-500">+120k</p>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Acessos/Ano</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm">
                                    <p className="text-3xl font-black text-yellow-500">15min</p>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Tempo Médio</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm">
                                    <p className="text-3xl font-black text-yellow-500">+45k</p>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Seguidores</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm">
                                    <p className="text-3xl font-black text-yellow-500">30%</p>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Taxa Engaj.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-6 text-center mb-16">
                    <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Escolha o seu <span className="text-yellow-500">Nível de Exposição</span></h2>
                </div>

                <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {MOCK_PLANS.map(plan => (
                        <div key={plan.name} className={`relative flex flex-col p-8 rounded-[2.5rem] transition-all duration-300 ${plan.isFeatured ? 'bg-gray-900 text-white scale-105 shadow-2xl z-10' : 'bg-white border border-gray-100 shadow-xl'}`}>
                            {plan.isFeatured && (
                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-gray-900 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Recomendado</span>
                            )}
                            <h3 className={`text-2xl font-black uppercase tracking-tighter mb-4 ${plan.isFeatured ? 'text-yellow-500' : 'text-gray-900'}`}>{plan.name}</h3>
                            <div className="mb-8">
                                <span className="text-4xl font-black">{plan.price}</span>
                                <span className="text-sm opacity-50 ml-2">/único</span>
                            </div>
                            <ul className="space-y-4 mb-10 flex-grow">
                                {plan.features.map((f, i) => (
                                    <li key={i} className="flex gap-3 text-sm font-medium">
                                        <span className="text-yellow-500">✔</span> {f}
                                    </li>
                                ))}
                            </ul>
                            <button className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all ${plan.isFeatured ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                                {plan.ctaText}
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Contact Form */}
            <section id="contato" className="py-24">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bg-white border border-gray-100 rounded-[3rem] shadow-2xl p-12 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-2 h-full bg-yellow-500"></div>
                        <h2 className="text-4xl font-black text-gray-900 mb-4 uppercase tracking-tighter">Vamos Conversar?</h2>
                        <p className="text-gray-500 mb-12">Preencha o formulário e nossa equipe entrará em contato em até 24h.</p>
                        
                        {success ? (
                            <div className="bg-green-50 border border-green-100 p-8 rounded-2xl text-center">
                                <h3 className="text-2xl font-black text-green-900 mb-2 uppercase tracking-tighter">Solicitação Enviada!</h3>
                                <p className="text-green-700">Obrigado pelo interesse. Nossa equipe entrará em contato em breve.</p>
                                <button onClick={() => setSuccess(false)} className="mt-6 text-green-900 font-bold underline">Enviar outra solicitação</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <input 
                                        type="text" 
                                        placeholder="Seu Nome" 
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-yellow-500" 
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Nome do Negócio" 
                                        required
                                        value={formData.businessName}
                                        onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                                        className="bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-yellow-500" 
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <input 
                                        type="email" 
                                        placeholder="E-mail" 
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-yellow-500" 
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="WhatsApp" 
                                        required
                                        value={formData.whatsapp}
                                        onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                                        className="bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-yellow-500" 
                                    />
                                </div>
                                <textarea 
                                    placeholder="Fale um pouco sobre sua história..." 
                                    rows={4} 
                                    value={formData.message}
                                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-yellow-500"
                                ></textarea>
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gray-900 text-white font-black py-5 rounded-2xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/20 uppercase tracking-widest disabled:opacity-50"
                                >
                                    {loading ? 'Enviando...' : 'Enviar Solicitação'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Commercial;
