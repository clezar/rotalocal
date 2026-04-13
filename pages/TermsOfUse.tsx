
import React from 'react';

const TermsOfUse: React.FC = () => {
  return (
    <div className="bg-white min-h-screen py-24">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-5xl font-black text-gray-900 mb-12 uppercase tracking-tighter">Termos de Uso</h1>
        
        <div className="prose prose-lg max-w-none text-gray-600 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e usar a plataforma Rota Local, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Descrição do Serviço</h2>
            <p>
              A Rota Local é um hub de conexão local que visa promover o comércio em Capão da Canoa através de vídeos, perfis exclusivos e histórias de negócios locais.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Cadastro de Usuário</h2>
            <p>
              Para acessar certas funcionalidades, como favoritar episódios ou solicitar participações comerciais, você pode precisar criar uma conta. Você é responsável por manter a confidencialidade de sua conta e senha.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo disponível na Rota Local, incluindo vídeos, textos, gráficos, logotipos e imagens, é de propriedade da Rota Local ou de seus parceiros e está protegido por leis de direitos autorais.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Limitação de Responsabilidade</h2>
            <p>
              A Rota Local não se responsabiliza por quaisquer danos diretos, indiretos, incidentais ou consequentes resultantes do uso ou da incapacidade de usar nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Alterações nos Termos</h2>
            <p>
              Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. O uso continuado da plataforma após tais alterações constitui sua aceitação dos novos termos.
            </p>
          </section>

          <section className="pt-12 border-t border-gray-100">
            <p className="text-sm italic">Última atualização: 19 de Março de 2026.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
