
import React from 'react';

const About: React.FC = () => {
    return (
        <div className="bg-white py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                            Nossa História
                        </h1>
                        <p className="mt-4 text-xl text-gray-600">
                            Conectando corações, negócios e a comunidade de Capão da Canoa.
                        </p>
                    </div>

                    <div className="prose prose-lg prose-yellow mx-auto text-gray-600">
                        <p>
                            A <strong>Rota Local</strong> nasceu de uma ideia simples, mas poderosa: dar voz e rosto aos empreendedores que são a alma da nossa cidade. Em cada esquina de Capão da Canoa, existe uma história de dedicação, superação e paixão. Vimos a necessidade de criar uma ponte entre esses comerciantes talentosos e a comunidade que, muitas vezes, não conhece a riqueza que a rodeia.
                        </p>
                        <p>
                            Nossa missão é mais do que apenas criar vídeos. É sobre construir conexões, fortalecer a economia local e celebrar a cultura única da nossa região. Acreditamos que, ao compartilhar essas histórias autênticas, inspiramos não apenas o consumo consciente, mas também um sentimento de orgulho e pertencimento em todos os moradores.
                        </p>
                        <blockquote>
                            <p>"Cada negócio tem uma batida, um ritmo próprio. Nós apenas ajustamos a câmera para que todos possam ouvir a música."</p>
                        </blockquote>
                        <p>
                            Começamos com uma câmera na mão e um sonho no coração, percorrendo as ruas, conversando com donos de lojas, restaurantes, e prestadores de serviços. Cada entrevista é um aprendizado, cada vídeo é um tributo ao trabalho árduo que movimenta Capão.
                        </p>
                        <p>
                            Junte-se a nós nesta jornada. Explore, descubra e apoie o comércio local. Porque quando um negócio da nossa cidade cresce, todos nós crescemos juntos.
                        </p>
                    </div>

                     <div className="mt-16 bg-gray-50 p-8 rounded-lg">
                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Entre em Contato</h2>
                        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
                            <div className="text-center">
                                <h3 className="font-semibold text-lg text-gray-700 mb-4">Contato Comercial</h3>
                                <a 
                                    href="mailto:comercial@rotalocal.com.br" 
                                    className="inline-block bg-yellow-500 text-gray-900 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20"
                                >
                                    Enviar E-mail
                                </a>
                            </div>
                             <div className="text-center">
                                <h3 className="font-semibold text-lg text-gray-700 mb-4">WhatsApp</h3>
                                <a 
                                    href="https://wa.me/5551992888705" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="inline-block bg-[#25D366] text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#128C7E] transition-all shadow-lg shadow-green-500/20"
                                >
                                    Falar no WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
