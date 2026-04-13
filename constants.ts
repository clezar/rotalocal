
import type { Video, Business, BlogPost, Plan } from './types';

// Altere para a URL real do seu domínio na Hostgator (ex: https://rotalocal.com.br/api)
export const API_BASE_URL = 'https://seu-dominio.com.br/api';

export const MOCK_VIDEOS: Video[] = [
  {
    id: '1',
    title: 'A Arte da Panificação na Padaria Pão Quente',
    description: 'Descubra os segredos por trás do pão mais famoso de Capão da Canoa.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800',
    category: 'Alimentação',
    businessId: '1',
    publishedAt: '2024-07-15T10:00:00Z',
  }
];

export const MOCK_BUSINESSES: Business[] = [
  {
    id: '1',
    name: 'Padaria Pão Quente',
    category: 'Alimentação',
    description: 'A melhor padaria da cidade com pães frescos e artesanais.',
    address: 'Rua das Flores, 123, Centro, Capão da Canoa, RS',
    phone: '(51) 3625-1111',
    whatsapp: '5551912345678',
    instagram: 'padariapaoquente',
    gallery: [
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800'
    ]
  }
];

export const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: '5 Dicas de Marketing para Negócios Locais',
    content: 'O marketing local é essencial...',
    author: 'Equipe Rota Local',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
    publishedAt: '2024-07-25T14:00:00Z',
    tags: ['Marketing', 'Dicas']
  }
];

export const MOCK_PLANS: Plan[] = [
    {
        name: "Plano Comunidade",
        price: "Gratuito",
        features: ["Vídeo no YouTube", "Perfil básico", "Menção Social"],
        isFeatured: false,
        ctaText: "Começar Agora"
    }
];
