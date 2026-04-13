
import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-white min-h-screen py-24">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-5xl font-black text-gray-900 mb-12 uppercase tracking-tighter">Política de Privacidade</h1>
        
        <div className="prose prose-lg max-w-none text-gray-600 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introdução</h2>
            <p>
              A Rota Local valoriza a sua privacidade. Esta Política de Privacidade descreve como coletamos, usamos e protegemos suas informações pessoais ao utilizar nossa plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Informações que Coletamos</h2>
            <p>
              Coletamos informações que você nos fornece diretamente, como nome, e-mail e dados de contato ao criar uma conta ou preencher formulários de solicitação comercial.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Uso das Informações</h2>
            <p>
              As informações coletadas são utilizadas para:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fornecer e melhorar nossos serviços;</li>
              <li>Personalizar sua experiência na plataforma;</li>
              <li>Processar solicitações comerciais e entrar em contato com você;</li>
              <li>Enviar comunicações relacionadas ao serviço.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Compartilhamento de Dados</h2>
            <p>
              Não vendemos ou alugamos suas informações pessoais para terceiros. Podemos compartilhar dados com prestadores de serviços que nos auxiliam na operação da plataforma, sempre sob obrigações de confidencialidade.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Segurança</h2>
            <p>
              Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Seus Direitos</h2>
            <p>
              Você tem o direito de acessar, corrigir ou excluir suas informações pessoais a qualquer momento através das configurações de sua conta ou entrando em contato conosco.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies</h2>
            <p>
              Utilizamos cookies para melhorar a funcionalidade da plataforma e entender como os usuários interagem com nossos serviços. Você pode gerenciar as preferências de cookies em seu navegador.
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

export default PrivacyPolicy;
