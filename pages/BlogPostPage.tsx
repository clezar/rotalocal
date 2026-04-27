
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DataService } from '../services/dataService';
import type { BlogPost as BlogPostType } from '../types';
import Markdown from 'react-markdown';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';

const BlogPostPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<BlogPostType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPost = async () => {
            if (!id) return;
            try {
                const posts = await DataService.getBlogPosts();
                const found = posts.find(p => p.id === id);
                setPost(found || null);
            } catch (error) {
                console.error("Error loading post:", error);
            } finally {
                setLoading(false);
            }
        };
        loadPost();
    }, [id]);

    if (loading) {
        return (
            <div className="container mx-auto px-6 py-32 animate-pulse">
                <div className="h-10 bg-gray-200 rounded-full w-48 mb-8"></div>
                <div className="h-[400px] bg-gray-200 rounded-[3rem] mb-12"></div>
                <div className="max-w-3xl mx-auto space-y-4">
                    <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                    <div className="h-6 bg-gray-200 rounded-lg w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded-lg w-full"></div>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="container mx-auto px-6 py-32 text-center">
                <h1 className="text-4xl font-black text-gray-900 mb-6">POSTAGEM NÃO ENCONTRADA</h1>
                <Link to="/blog" className="text-yellow-600 font-bold hover:underline">Voltar para o Blog</Link>
            </div>
        );
    }

    return (
        <article className="bg-white min-h-screen pb-20">
            {/* Header / Hero */}
            <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
                <img src={post.thumbnailUrl} alt={post.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                
                <div className="absolute inset-0 flex flex-col justify-end">
                    <div className="container mx-auto px-6 pb-12">
                        <Link to="/blog" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors font-bold uppercase tracking-widest text-xs">
                            <ArrowLeft className="w-4 h-4" /> Voltar ao Blog
                        </Link>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {post.tags?.map(tag => (
                                <span key={tag} className="bg-yellow-500 text-gray-900 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-tight max-w-4xl shadow-sm">
                            {post.title}
                        </h1>
                        
                        <div className="flex flex-wrap items-center gap-6 mt-8 text-white/80 font-bold uppercase tracking-widest text-[10px]">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-yellow-500" />
                                {new Date(post.publishedAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-yellow-500" />
                                {post.author}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 py-20">
                <div className="max-w-3xl mx-auto">
                    <div className="markdown-body prose prose-lg prose-yellow max-w-none">
                        <Markdown>{post.content}</Markdown>
                    </div>

                    <div className="mt-20 pt-10 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Tag className="w-5 h-5 text-yellow-500" />
                                <div className="flex flex-wrap gap-2">
                                    {post.tags?.map(tag => (
                                        <span key={tag} className="text-gray-400 font-bold hover:text-yellow-600 transition-colors cursor-pointer capitalize">#{tag.toLowerCase()}</span>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="flex gap-4">
                                {/* Social Share buttons could go here */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default BlogPostPage;
