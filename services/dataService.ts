
import { collection, getDocs, getDoc, doc, query, orderBy, limit, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError } from '../contexts/AuthContext';
import { Video, Business, BlogPost, OperationType, CommercialRequest, Favorite } from '../types';

export const DataService = {
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

  async getUserCommercialRequests(email: string): Promise<CommercialRequest[]> {
    const path = 'commercialRequests';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const allRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommercialRequest));
      return allRequests.filter(req => req.email === email);
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
