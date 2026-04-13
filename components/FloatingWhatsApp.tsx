
import React from 'react';

const FloatingWhatsApp: React.FC = () => {
    return (
        <a 
            href="https://wa.me/5551982888705" 
            target="_blank" 
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
            aria-label="Contato via WhatsApp"
        >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.38 1.25 4.81L2 22l5.44-1.42c1.38.74 2.95 1.18 4.6 1.18h.01c5.46 0 9.91-4.45 9.91-9.91s-4.45-9.91-9.92-9.91zM17.48 15.58c-.18-.09-.98-.48-1.13-.54-.15-.05-.26-.09-.37.09-.11.18-.43.54-.53.65-.1.11-.2.12-.37.04-.18-.09-.76-.28-1.44-.88-.53-.47-.89-.84-1-1.18-.11-.34 0-.52.08-.68.08-.13.18-.23.27-.34.09-.11.12-.18.18-.3.06-.12.03-.23-.01-.32-.05-.09-.37-1.13-.48-1.31-.11-.18-.23-.16-.32-.16-.09 0-.18 0-.27 0-.09 0-.23.05-.37.23-.14.18-.53.52-.53 1.28 0 .76.54 1.48.62 1.58.08.1.98 1.58 2.42 2.14.34.13.59.2.8.26.42.12.78.1.1.06.33-.04.98-.4.1.2-.76.09-.23.18-.26.11-.26.2-.18.23h-.01c-.1.05-.23.09-.37.09-.14 0-.46-.05-.65-.23z"/>
            </svg>
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 whitespace-nowrap font-medium">
                Fale Conosco
            </span>
        </a>
    );
};

export default FloatingWhatsApp;
