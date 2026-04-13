
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, EyeOff, Edit2, Trash2 } from 'lucide-react';
import type { Video } from '../types';

interface VideoCardProps {
  video: Video;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  isAdmin?: boolean;
  onTogglePrivacy?: (e: React.MouseEvent) => void;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, isFavorite, onToggleFavorite, isAdmin, onTogglePrivacy, onEdit, onDelete }) => {
  return (
    <div className={`group relative block bg-white rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${video.isPrivate ? 'opacity-75 grayscale-[0.5]' : ''}`}>
      <Link to={`/negocio/${video.businessId || video.id}`} className="block">
        <div className="relative aspect-[9/16] overflow-hidden">
          <img 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              src={video.thumbnailUrl} 
              alt={video.title} 
          />
          {/* Play Overlay */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
               <div className="w-16 h-16 bg-yellow-500 text-gray-900 rounded-full flex items-center justify-center shadow-2xl transform scale-50 group-hover:scale-100 transition-transform duration-500">
                  <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                  </svg>
               </div>
          </div>
          {/* Category Badge */}
          <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                  {video.category}
              </span>
              {video.isPrivate && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                  <EyeOff className="w-3 h-3" /> Privado
                </span>
              )}
          </div>
        </div>
      </Link>

      {/* Action Buttons */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        {onToggleFavorite && (
          <button 
            onClick={onToggleFavorite}
            className={`p-2 rounded-full backdrop-blur-sm transition-all ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-400 hover:text-red-500'}`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}
        
        {isAdmin && (
          <>
            {onTogglePrivacy && (
              <button 
                onClick={onTogglePrivacy}
                className={`p-2 rounded-full backdrop-blur-sm transition-all ${video.isPrivate ? 'bg-gray-800 text-white' : 'bg-white/90 text-gray-400 hover:text-gray-900'}`}
                title={video.isPrivate ? "Tornar Público" : "Tornar Privado"}
              >
                {video.isPrivate ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            )}
            {onEdit && (
              <button 
                onClick={onEdit}
                className="p-2 bg-white/90 text-gray-400 hover:text-blue-500 rounded-full backdrop-blur-sm transition-all"
                title="Editar Episódio"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            )}
            {onDelete && (
              <button 
                onClick={onDelete}
                className="p-2 bg-white/90 text-gray-400 hover:text-red-600 rounded-full backdrop-blur-sm transition-all"
                title="Excluir Episódio"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </>
        )}
      </div>
      
      <div className="p-6">
        <Link to={`/negocio/${video.businessId || video.id}`} className="block">
          <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-black text-gray-900 leading-tight uppercase tracking-tighter group-hover:text-yellow-600 transition-colors">
                  {video.title}
              </h3>
          </div>
          <p className="text-gray-500 text-sm line-clamp-2 italic font-light">"{video.description}"</p>
          
          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {new Date(video.publishedAt).toLocaleDateString('pt-BR')}
              </span>
              <span className="text-yellow-600 font-black text-xs uppercase tracking-widest group-hover:mr-2 transition-all">Assistir →</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default VideoCard;
