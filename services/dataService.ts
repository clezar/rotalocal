
import { collection, getDocs, getDoc, doc, query, orderBy, limit, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError } from '../contexts/AuthContext';
import { Video, Business, BlogPost, OperationType, CommercialRequest, Favorite, Category } from '../types';

export const DataService = {
  // Categories
  async getCategories(): Promise<Category[]> {
    const path = 'categories';
    try {
      const q = query(collection(db, path), orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      // Unique by name (case insensitive)
      const uniqueMap = new Map<string, Category>();
      all.forEach(c => {
        const normalized = c.name.toLowerCase().trim();
        if (!uniqueMap.has(normalized)) {
          uniqueMap.set(normalized, c);
        }
      });
      return Array.from(uniqueMap.values());
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async cleanupDuplicateCategories(): Promise<number> {
    try {
      const snapshot = await getDocs(collection(db, 'categories'));
      const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      
      const seen = new Map<string, string>(); // name -> id
      const duplicatesToDelete: string[] = [];

      all.forEach(c => {
        const normalized = c.name.toLowerCase().trim();
        if (seen.has(normalized)) {
          duplicatesToDelete.push(c.id);
        } else {
          seen.set(normalized, c.id);
        }
      });

      for (const id of duplicatesToDelete) {
        await deleteDoc(doc(db, 'categories', id));
      }
      return duplicatesToDelete.length;
    } catch (error) {
      console.error("Error cleaning up categories:", error);
      return 0;
    }
  },

  async createCategory(name: string): Promise<string> {
    const path = 'categories';
    const normalizedName = name.trim();
    try {
      if (!auth.currentUser) {
        throw new Error("Usuário não autenticado para criar categoria.");
      }
      
      const existing = await this.getCategories();
      const duplicate = existing.find(c => c.name.toLowerCase() === normalizedName.toLowerCase());
      if (duplicate) return duplicate.id;

      const docRef = await addDoc(collection(db, path), { name: normalizedName });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  },

  async seedCategories(): Promise<void> {
    const path = 'categories';
    try {
      const existing = await this.getCategories();
      if (existing.length > 0) return;

      // Only attempt to seed if someone is logged in
      if (!auth.currentUser) {
        console.log("Skipping category seeding: user not authenticated.");
        return;
      }

      console.log("Seeding categories...");
      const { DEFAULT_CATEGORIES } = await import('../constants');
      for (const name of DEFAULT_CATEGORIES) {
        await addDoc(collection(db, path), { name });
      }
      console.log("Categories seeded successfully!");
    } catch (error) {
      console.error("Error during category seeding:", error);
      // We don't throw here to avoid crashing the whole page load
    }
  },

  // Content
  async getVideos(isAdmin: boolean = false): Promise<Video[]> {
    const path = 'episodes';
    try {
      const q = query(collection(db, path), orderBy('publishedAt', 'desc'));
      const snapshot = await getDocs(q);
      const videos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Video));
      
      if (isAdmin) return videos;
      return videos.filter(v => v.isPrivate !== true);
    } catch (error) {
      handleFirestoreError(error, 'list' as any, path);
      return [];
    }
  },

  async getBusinesses(): Promise<Business[]> {
    const path = 'businesses';
    try {
      const q = query(collection(db, path));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
    } catch (error) {
      handleFirestoreError(error, 'list' as any, path);
      return [];
    }
  },

  async getUserBusinesses(userId: string): Promise<Business[]> {
    const path = 'businesses';
    try {
      const { query, where, collection, getDocs } = await import('firebase/firestore');
      const q = query(collection(db, path), where('ownerId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
    } catch (error) {
      handleFirestoreError(error, 'list' as any, path);
      return [];
    }
  },

  async createBusiness(businessData: Omit<Business, 'id'>): Promise<string> {
    const path = 'businesses';
    try {
      const docRef = await addDoc(collection(db, path), businessData);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, 'create' as any, path);
      throw error;
    }
  },

  async updateBusiness(businessId: string, businessData: Partial<Business>): Promise<void> {
    const path = `businesses/${businessId}`;
    try {
      const { id, ...data } = businessData as any;
      await updateDoc(doc(db, 'businesses', businessId), data);
    } catch (error) {
      handleFirestoreError(error, 'update' as any, path);
      throw error;
    }
  },

  async deleteBusiness(businessId: string): Promise<void> {
    const path = `businesses/${businessId}`;
    try {
      await deleteDoc(doc(db, 'businesses', businessId));
    } catch (error) {
      handleFirestoreError(error, 'delete' as any, path);
      throw error;
    }
  },

  async deleteAllUserBusinesses(userId: string): Promise<number> {
    try {
      const businesses = await this.getUserBusinesses(userId);
      let count = 0;
      for (const b of businesses) {
        await this.deleteBusiness(b.id);
        count++;
      }
      return count;
    } catch (error) {
      console.error("Error deleting all user businesses:", error);
      throw error;
    }
  },

  async clearAllBusinesses(): Promise<number> {
    try {
      const businesses = await this.getBusinesses();
      let count = 0;
      for (const b of businesses) {
        await this.deleteBusiness(b.id);
        count++;
      }
      return count;
    } catch (error) {
      console.error("Error clearing all businesses:", error);
      throw error;
    }
  },

  async clearAllContent(): Promise<string> {
    try {
      if (!auth.currentUser) {
        return "Erro: Usuário não autenticado. Faça login como administrador.";
      }
      
      console.log("Iniciando limpeza total de negócios e episódios...");
      
      // 1. Clear Episodes
      const episodes = await this.getVideos(true);
      let episodesCount = 0;
      for (const v of episodes) {
        await this.deleteVideo(v.id);
        episodesCount++;
      }
      
      // 2. Clear Businesses
      const businesses = await this.getBusinesses();
      let businessesCount = 0;
      for (const b of businesses) {
        await this.deleteBusiness(b.id);
        businessesCount++;
      }

      // 3. Clear Blog Posts
      const blogPosts = await this.getBlogPosts();
      let blogCount = 0;
      for (const p of blogPosts) {
        await this.deleteBlogPost(p.id);
        blogCount++;
      }

      // 4. Clear Commercial Requests
      const requests = await this.getAllCommercialRequests();
      let requestsCount = 0;
      for (const r of requests) {
        await deleteDoc(doc(db, 'commercialRequests', r.id));
        requestsCount++;
      }

      return `Sucesso: ${businessesCount} negócios, ${episodesCount} episódios, ${blogCount} posts e ${requestsCount} solicitações foram removidos.`;
    } catch (error) {
      console.error("Error clearing all content:", error);
      return "Erro ao limpar banco de dados: " + (error instanceof Error ? error.message : String(error));
    }
  },

  async getBusinessById(id: string): Promise<Business | null> {
    const path = `businesses/${id}`;
    try {
      const docRef = doc(db, 'businesses', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Business;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, 'get' as any, path);
      return null;
    }
  },

  async getVideoById(id: string): Promise<Video | null> {
    const path = `episodes/${id}`;
    try {
      const docRef = doc(db, 'episodes', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Video;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, 'get' as any, path);
      return null;
    }
  },

  async cleanupDuplicateBusinesses(): Promise<number> {
    try {
      const businesses = await this.getBusinesses();
      const seenNames = new Map<string, string>(); // normalized name -> id of the first one found
      const duplicatesToDelete: string[] = [];

      businesses.forEach(business => {
        // More aggressive normalization (trim, lowercase, remove extra interior spaces)
        const normalizedName = business.name.trim().toLowerCase().replace(/\s+/g, ' ');
        if (seenNames.has(normalizedName)) {
          duplicatesToDelete.push(business.id);
          console.log(`Duplicate found: "${business.name}" (ID: ${business.id}), keeping ID: ${seenNames.get(normalizedName)}`);
        } else {
          seenNames.set(normalizedName, business.id);
        }
      });

      console.log(`Found ${duplicatesToDelete.length} duplicates to remove.`);
      
      let deletedCount = 0;
      for (const id of duplicatesToDelete) {
        try {
            await this.deleteBusiness(id);
            deletedCount++;
        } catch (err) {
            console.error(`Failed to delete business ${id}:`, err);
        }
      }
      return deletedCount;
    } catch (error) {
      console.error("Error cleaning up duplicate businesses:", error);
      throw error;
    }
  },

  async emergencyCorrection(): Promise<string> {
    try {
      const businesses = await this.getBusinesses();
      const targets = businesses.filter(b => 
        (b.name?.toLowerCase().includes('ariel') && b.name?.toLowerCase().includes('barber')) ||
        (b.id === 'virtual-PDfr49oBoQDN4EKBoGVT') ||
        (b.id === 'PDfr49oBoQDN4EKBoGVT')
      );

      if (targets.length === 0) return "Nenhum negócio 'Ariel Barber' encontrado para remoção no momento.";

      let count = 0;
      for (const b of targets) {
        // 1. Delete associated videos
        const episodes = await this.getVideos(true);
        const relatedVideos = episodes.filter(v => 
          v.businessId === b.id || 
          v.id === `virtual-${b.id}` ||
          (v.title.toLowerCase().includes('ariel') && v.title.toLowerCase().includes('barber'))
        );
        for (const v of relatedVideos) {
          await this.deleteVideo(v.id);
        }

        // 2. Delete commercial requests
        const requests = await this.getAllCommercialRequests();
        const relatedRequests = requests.filter(r => 
          r.businessName.toLowerCase().includes('ariel') && 
          r.businessName.toLowerCase().includes('barber')
        );
        for (const r of relatedRequests) {
          await deleteDoc(doc(db, 'commercialRequests', r.id));
        }

        // 3. Delete the business itself
        await this.deleteBusiness(b.id);
        count++;
      }

      return `Sucesso: ${count} instâncias de 'Ariel Barber' e todos os dados vinculados foram completamente excluídos.`;
    } catch (error) {
      console.error("Error during emergency correction:", error);
      return "Erro ao realizar correção: " + (error instanceof Error ? error.message : String(error));
    }
  },

  async getVideoByBusinessId(businessId: string): Promise<Video | null> {
    const path = 'episodes';
    try {
      const { query, where, collection, getDocs } = await import('firebase/firestore');
      const q = query(collection(db, path), where('businessId', '==', businessId), limit(1));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Video;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, 'list' as any, path);
      return null;
    }
  },

  async getBlogPosts(): Promise<BlogPost[]> {
    const path = 'blogPosts';
    try {
      const q = query(collection(db, path), orderBy('publishedAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
    } catch (error) {
      handleFirestoreError(error, 'list' as any, path);
      return [];
    }
  },

  async createBlogPost(postData: Omit<BlogPost, 'id' | 'publishedAt'>): Promise<string> {
    const path = 'blogPosts';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...postData,
        publishedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, 'create' as any, path);
      throw error;
    }
  },

  async updateBlogPost(postId: string, postData: Partial<BlogPost>): Promise<void> {
    const path = `blogPosts/${postId}`;
    try {
      const { id, ...data } = postData as any;
      await updateDoc(doc(db, 'blogPosts', postId), data);
    } catch (error) {
      handleFirestoreError(error, 'update' as any, path);
      throw error;
    }
  },

  async deleteBlogPost(postId: string): Promise<void> {
    const path = `blogPosts/${postId}`;
    try {
      await deleteDoc(doc(db, 'blogPosts', postId));
    } catch (error) {
      handleFirestoreError(error, 'delete' as any, path);
      throw error;
    }
  },

  async getFeaturedVideos(count: number = 3, isAdmin: boolean = false): Promise<Video[]> {
    const path = 'episodes';
    try {
      const q = query(collection(db, path), orderBy('publishedAt', 'desc'));
      const snapshot = await getDocs(q);
      const videos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Video));
      
      const filtered = isAdmin ? videos : videos.filter(v => v.isPrivate !== true);
      return filtered.slice(0, count);
    } catch (error) {
      handleFirestoreError(error, 'list' as any, path);
      return [];
    }
  },

  // Commercial Requests
  async createCommercialRequest(requestData: Omit<CommercialRequest, 'id' | 'status' | 'createdAt'>): Promise<void> {
    const path = 'commercialRequests';
    try {
      await addDoc(collection(db, path), {
        ...requestData,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, 'create' as any, path);
    }
  },

  // Favorites
  async getFavorites(userId: string): Promise<Favorite[]> {
    const path = `users/${userId}/favorites`;
    try {
      const snapshot = await getDocs(collection(db, path));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Favorite));
    } catch (error) {
      handleFirestoreError(error, 'list' as any, path);
      return [];
    }
  },

  async addFavorite(userId: string, videoId: string): Promise<string> {
    const path = `users/${userId}/favorites`;
    try {
      const docRef = await addDoc(collection(db, path), {
        userId,
        videoId,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, 'create' as any, path);
      throw error;
    }
  },

  async removeFavorite(userId: string, favoriteId: string): Promise<void> {
    const path = `users/${userId}/favorites/${favoriteId}`;
    try {
      await deleteDoc(doc(db, `users/${userId}/favorites`, favoriteId));
    } catch (error) {
      handleFirestoreError(error, 'delete' as any, path);
    }
  },

  async toggleVideoPrivacy(videoId: string, isPrivate: boolean): Promise<void> {
    const path = `episodes/${videoId}`;
    try {
      await updateDoc(doc(db, 'episodes', videoId), { isPrivate });
    } catch (error) {
      handleFirestoreError(error, 'update' as any, path);
    }
  },

  async addVideo(videoData: Omit<Video, 'id'>): Promise<string> {
    const path = 'episodes';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...videoData,
        publishedAt: videoData.publishedAt || new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, 'create' as any, path);
      throw error;
    }
  },

  async updateVideo(videoId: string, videoData: Partial<Video>): Promise<void> {
    const path = `episodes/${videoId}`;
    try {
      const { id, ...data } = videoData as any;
      await updateDoc(doc(db, 'episodes', videoId), data);
    } catch (error) {
      handleFirestoreError(error, 'update' as any, path);
      throw error;
    }
  },

  async deleteVideo(videoId: string): Promise<void> {
    const path = `episodes/${videoId}`;
    try {
      await deleteDoc(doc(db, 'episodes', videoId));
    } catch (error) {
      handleFirestoreError(error, 'delete' as any, path);
      throw error;
    }
  },

  async cleanupDuplicates(): Promise<number> {
    const path = 'episodes';
    try {
      const snapshot = await getDocs(collection(db, path));
      const videos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Video));
      
      const seen = new Set<string>();
      const duplicates: string[] = [];
      
      for (const video of videos) {
        const identifier = `${video.title}-${video.businessId}`;
        if (seen.has(identifier)) {
          duplicates.push(video.id);
        } else {
          seen.add(identifier);
        }
      }
      
      for (const id of duplicates) {
        await deleteDoc(doc(db, path, id));
      }
      
      return duplicates.length;
    } catch (error) {
      handleFirestoreError(error, 'delete' as any, path);
      return 0;
    }
  },

  async seedBlogPosts(): Promise<void> {
    const path = 'blogPosts';
    try {
      const existing = await this.getBlogPosts();
      if (existing.length > 0) return;

      const posts = [
        {
          title: 'A Origem do Nome: Por que Capão da Canoa?',
          content: `Você já se perguntou de onde vem o nome da nossa cidade? A história é fascinante e remonta aos tempos em que a região era apenas um ponto de parada para viajantes.

O termo "Capão" refere-se a uma porção de mato isolada no meio do campo. Segundo os relatos históricos, existia um capão de árvores específico que, quando visto de longe ou de certos ângulos por quem navegava ou passava pela trilha, tinha o formato perfeito de uma canoa.

Esse marco visual natural tornou-se uma referência geográfica tão forte que acabou batizando a localidade. Imagine só: o que hoje é uma cidade pulsante, com arranha-céus e avenidas movimentadas, começou como uma simples referência a um desenho formado pela natureza!`,
          author: 'Equipe Rota Local',
          thumbnailUrl: 'https://images.unsplash.com/photo-1549463599-24769f69cbd1?auto=format&fit=crop&q=80&w=800',
          publishedAt: new Date().toISOString(),
          tags: ['História', 'Origens', 'Curiosidades']
        },
        {
          title: 'De Arroio da Pescaria a Gigante do Litoral',
          content: `Antes de ser o destino favorito de milhares de gaúchos no verão, Capão da Canoa tinha um nome bem diferente: Arroio da Pescaria.

No início do século XX, a região era frequentada principalmente por pescadores e por famílias de fazendeiros da região de Osório que vinham passar os meses de calor à beira-mar. As casas eram simples, muitas feitas de madeira e palha, e o acesso era extremamente difícil, feito por estradas de areia que muitas vezes exigiam carros de boi.

A emancipação só veio em 1982, desmembrando-se de Osório. Desde então, o crescimento foi vertiginoso, transformando a antiga vila de pescadores em um dos centros urbanos mais importantes do Rio Grande do Sul, sem perder o charme de suas praias.`,
          author: 'Equipe Rota Local',
          thumbnailUrl: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&q=80&w=800',
          publishedAt: new Date(Date.now() - 86400000).toISOString(),
          tags: ['História', 'Evolução', 'Turismo']
        },
        {
          title: '5 Curiosidades que você (provavelmente) não sabia',
          content: `Capão da Canoa é cheia de segredos e fatos interessantes. Separamos 5 curiosidades para você compartilhar na próxima roda de amigos:

1. **O Primeiro Hotel**: O primeiro hotel oficial da cidade foi o Hotel da Praia, que ajudou a consolidar o turismo na região ainda na primeira metade do século XX.
2. **Avenida Paraguassú**: A principal avenida da cidade segue o traçado de uma antiga trilha indígena e de tropeiros que percorria todo o litoral.
3. **Água Doce**: Antigamente, a água potável era obtida em "cacimbas" cavadas na própria areia da praia ou nas dunas, onde a água da chuva ficava filtrada.
4. **População Flutuante**: A cidade passa de cerca de 50 mil habitantes fixos para mais de 600 mil durante o auge do veraneio, uma das maiores variações do Brasil.
5. **Farol do Capão**: O farol original era uma estrutura vital para a navegação de cabotagem, evitando que navios encalhassem nos bancos de areia traiçoeiros da nossa costa.`,
          author: 'Equipe Rota Local',
          thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
          publishedAt: new Date(Date.now() - 172800000).toISOString(),
          tags: ['Curiosidades', 'Lifestyle', 'Fatos']
        }
      ];

      for (const p of posts) {
        await addDoc(collection(db, path), p);
      }
      console.log("Blog posts seeded!");
    } catch (error) {
      console.error("Error seeding blog posts:", error);
    }
  },

  async getAllCommercialRequests(): Promise<CommercialRequest[]> {
    const path = 'commercialRequests';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommercialRequest));
    } catch (error) {
      handleFirestoreError(error, 'list' as any, path);
      return [];
    }
  },

  async updateCommercialRequestStatus(requestId: string, status: 'pending' | 'contacted' | 'completed'): Promise<void> {
    const path = `commercialRequests/${requestId}`;
    try {
      await updateDoc(doc(db, 'commercialRequests', requestId), { status });
    } catch (error) {
      handleFirestoreError(error, 'update' as any, path);
      throw error;
    }
  },

  async getUserCommercialRequests(email: string, userId?: string): Promise<CommercialRequest[]> {
    const path = 'commercialRequests';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const allRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommercialRequest));
      return allRequests.filter(req => req.userId === userId || req.email === email);
    } catch (error) {
      handleFirestoreError(error, 'list' as any, path);
      return [];
    }
  },

  async seedData(): Promise<void> {
    try {
      // Check if we already have data to avoid duplicates
      const existingVideos = await this.getVideos(true);
      if (existingVideos.length > 5) {
        console.log("Data already seeded, skipping...");
        return;
      }

      // Seed Businesses
      const businesses = [
        {
          name: 'Pizzaria do Porto',
          category: 'Alimentação',
          description: 'A melhor pizza artesanal de Capão da Canoa, com ingredientes frescos e massa de fermentação lenta.',
          address: 'Av. Beira Mar, 1500, Capão da Canoa',
          phone: '(51) 3625-2020',
          whatsapp: '555199887766',
          instagram: 'pizzariadoporto',
          gallery: ['https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800']
        },
        {
          name: 'Academia FitLife',
          category: 'Saúde & Bem-estar',
          description: 'Treinamento personalizado e equipamentos de última geração para você alcançar seus objetivos.',
          address: 'Rua Sepé, 450, Centro',
          phone: '(51) 3625-3030',
          whatsapp: '555199112233',
          instagram: 'fitlifecapao',
          gallery: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800']
        },
        {
          name: 'Surf Shop Paradise',
          category: 'Esportes',
          description: 'Tudo o que você precisa para pegar as melhores ondas do litoral gaúcho.',
          address: 'Av. Paraguassú, 2000, Navegantes',
          phone: '(51) 3625-4040',
          whatsapp: '555199223344',
          instagram: 'surfshopparadise',
          gallery: ['https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&q=80&w=800']
        },
        {
          name: 'Café da Praça',
          category: 'Alimentação',
          description: 'O café mais charmoso da cidade, perfeito para um lanche da tarde.',
          address: 'Praça do Farol, 10, Centro',
          phone: '(51) 3625-5050',
          whatsapp: '555199334455',
          instagram: 'cafedapraca',
          gallery: ['https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800']
        }
      ];

      const businessIds: string[] = [];
      for (const b of businesses) {
        // Check if business exists
        const q = query(collection(db, 'businesses'), orderBy('name'));
        const snap = await getDocs(q);
        const existing = snap.docs.find(doc => doc.data().name === b.name);
        
        if (existing) {
          businessIds.push(existing.id);
        } else {
          const docRef = await addDoc(collection(db, 'businesses'), b);
          businessIds.push(docRef.id);
        }
      }

      // Seed Episodes (Videos)
      const episodes = [
        {
          title: 'Sabores do Litoral: Pizzaria do Porto',
          description: 'Conheça a história e os sabores da Pizzaria do Porto.',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          thumbnailUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800',
          category: 'Alimentação',
          businessId: businessIds[0],
          publishedAt: new Date().toISOString(),
          isPrivate: false
        },
        {
          title: 'Energia Total na FitLife',
          description: 'Um tour completo pela melhor academia da cidade.',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800',
          category: 'Saúde & Bem-estar',
          businessId: businessIds[1],
          publishedAt: new Date().toISOString(),
          isPrivate: false
        },
        {
          title: 'Ondas Perfeitas: Surf Shop Paradise',
          description: 'Equipamentos e dicas para surfar em Capão da Canoa.',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          thumbnailUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&q=80&w=800',
          category: 'Esportes',
          businessId: businessIds[2],
          publishedAt: new Date().toISOString(),
          isPrivate: false
        },
        {
          title: 'Café e Prosa no Centro',
          description: 'O ambiente acolhedor do Café da Praça.',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          thumbnailUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800',
          category: 'Alimentação',
          businessId: businessIds[3],
          publishedAt: new Date().toISOString(),
          isPrivate: false
        }
      ];

      for (const e of episodes) {
        if (!existingVideos.some(v => v.title === e.title)) {
          await addDoc(collection(db, 'episodes'), e);
        }
      }

      console.log("Seed data created successfully!");
    } catch (error) {
      console.error("Error seeding data:", error);
      throw error;
    }
  }
};
