
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DataService } from '../services/dataService';
import type { BlogPost } from '../types';

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string>('Tudo');
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await DataService.getBlogPosts();
        setPosts(data);
      } catch (error) {
        console.error("Error loading blog posts:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1,2,3].map(i => <div key={i} className="bg-gray-100 animate-pulse aspect-[4/3] rounded-[2rem]"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {filteredPosts.map(post => (
                  <div key={post.id} className="group cursor-pointer">
                      <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden mb-6 shadow-xl border border-gray-100">
                          <img src={post.thumbnailUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                              {post.tags?.slice(0, 2).map(tag => (
                                <span key={tag} className="bg-yellow-500 text-gray-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                    {tag}
                                </span>
                              ))}
                          </div>
                      </div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                        {new Date(post.publishedAt).toLocaleDateString('pt-BR')} • {post.author}
                      </p>
                      <h2 className="text-2xl font-black text-gray-900 group-hover:text-yellow-600 transition-colors mb-3 leading-tight">{post.title}</h2>
                      <p className="text-gray-500 leading-relaxed mb-6 line-clamp-3">{post.content.replace(/[#*`]/g, '').slice(0, 150)}...</p>
                      <Link to={`/blog/${post.id}`} className="inline-flex items-center font-black text-sm uppercase tracking-widest text-gray-900 border-b-2 border-yellow-500 pb-1 hover:text-yellow-600 transition-all">
                          Ler post completo
                      </Link>
                  </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
