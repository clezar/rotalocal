
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { DataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import type { BlogPost } from '../types';
import BlogPostModal from '../components/BlogPostModal';

const Blog: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string>('Tudo');
  
  // CRUD State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await DataService.getBlogPosts();
      setPosts(data);
    } catch (error) {
      console.error("Error loading blog posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await DataService.seedBlogPosts();
      loadData();
    };
    init();
  }, []);

  const handleDelete = async (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    if (!window.confirm("Tem certeza que deseja excluir esta postagem?")) return;
    try {
      await DataService.deleteBlogPost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleEdit = (e: React.MouseEvent, post: BlogPost) => {
    e.preventDefault();
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const tags = ['Tudo', ...new Set(posts.flatMap(p => p.tags || []))];

  const filteredPosts = activeTag === 'Tudo' 
    ? posts 
    : posts.filter(post => post.tags?.includes(activeTag));

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="bg-gray-100 py-24 text-center">
        <div className="container mx-auto px-6">
          <h1 className="text-5xl font-black text-gray-900 uppercase tracking-tighter">Conteúdo <span className="text-yellow-500">& Comunidade</span></h1>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto text-lg">Dicas, notícias e o dia a dia de quem faz Capão da Canoa acontecer.</p>
          
          {user?.role === 'admin' && (
            <button
              onClick={() => { setSelectedPost(null); setIsModalOpen(true); }}
              className="mt-8 inline-flex items-center gap-2 bg-yellow-500 text-gray-900 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-yellow-600 transition-all shadow-xl shadow-yellow-500/20"
            >
              <Plus className="w-5 h-5" /> Nova Postagem
            </button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-8">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 ${
                activeTag === tag 
                ? 'bg-yellow-500 text-gray-900 shadow-xl shadow-yellow-500/20' 
                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Blog Post Grid */}
        {loading ? (
          <div className="space-y-12">
            {[1,2,3].map(i => <div key={i} className="bg-gray-100 animate-pulse h-64 rounded-[2rem]"></div>)}
          </div>
        ) : (
          <div className="space-y-24">
              {filteredPosts.map((post, index) => (
                  <div key={post.id} className="group relative">
                      <Link to={`/blog/${post.id}`} className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 items-center`}>
                        <div className="w-full md:w-1/2 relative aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 flex-shrink-0">
                            <img src={post.thumbnailUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                                {post.tags?.slice(0, 2).map(tag => (
                                  <span key={tag} className="bg-yellow-500 text-gray-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                      {tag}
                                  </span>
                                ))}
                            </div>
                            
                            {user?.role === 'admin' && (
                              <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => handleEdit(e, post)}
                                  className="p-3 bg-white/90 backdrop-blur-sm text-blue-600 rounded-full hover:bg-white shadow-xl transition-all"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => handleDelete(e, post.id)}
                                  className="p-3 bg-white/90 backdrop-blur-sm text-red-600 rounded-full hover:bg-white shadow-xl transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                        </div>
                        <div className="w-full md:w-1/2 space-y-4">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            {new Date(post.publishedAt).toLocaleDateString('pt-BR')} • {post.author}
                          </p>
                          <h2 className="text-4xl font-black text-gray-900 group-hover:text-yellow-600 transition-colors leading-tight">{post.title}</h2>
                          <p className="text-gray-500 text-lg leading-relaxed line-clamp-3">{post.content.replace(/[#*`]/g, '').slice(0, 200)}...</p>
                          <div className="pt-4">
                            <span className="inline-flex items-center font-black text-xs uppercase tracking-widest text-gray-900 border-b-2 border-yellow-500 pb-1 group-hover:text-yellow-600 transition-all">
                                Ler post completo
                            </span>
                          </div>
                        </div>
                      </Link>
                  </div>
              ))}
          </div>
        )}
      </div>

      <BlogPostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={loadData}
        post={selectedPost}
      />
    </div>
  );
};

export default Blog;
