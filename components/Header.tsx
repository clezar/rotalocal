
import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NavItem: React.FC<{ to: string; children: React.ReactNode; onClick?: () => void }> = ({ to, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `block py-2 px-3 rounded md:p-0 transition-colors duration-200 ${
        isActive
          ? 'text-yellow-500 font-bold'
          : 'text-gray-700 hover:text-yellow-600'
      }`
    }
  >
    {children}
  </NavLink>
);

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <nav className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 group">
              <img src="/favicon.png?v=1" alt="Rota Local Logo" className="w-8 h-8 object-contain" />
              <span className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
                Rota<span className="text-yellow-500">Local</span>
              </span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8 font-bold uppercase tracking-widest text-[10px]">
              <NavItem to="/">Início</NavItem>
              <NavItem to="/guia">Guia Local</NavItem>
              <NavItem to="/episodios">Episódios</NavItem>
              <NavItem to="/blog">Blog</NavItem>
              <NavItem to="/comercial">Anuncie</NavItem>
              <NavItem to="/sobre">Sobre</NavItem>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
                <Link to="/perfil" className="flex items-center gap-3 group">
                    <span className="text-xs font-black uppercase text-gray-500 group-hover:text-yellow-600 transition-colors">{user?.displayName.split(' ')[0]}</span>
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full border-2 border-white shadow-lg transition-transform group-hover:scale-110 object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-gray-900 font-black border-2 border-white shadow-lg transition-transform group-hover:scale-110">
                          {user?.displayName.charAt(0)}
                      </div>
                    )}
                </Link>
            ) : (
                <>
                    <Link to="/login" className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors">Entrar</Link>
                    <Link to="/comercial" className="bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-full hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10">
                        Seja Entrevistado
                    </Link>
                </>
            )}
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M12 12h8M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-6 pt-6 pb-8 space-y-4 font-black uppercase tracking-widest text-[10px]">
              <NavItem to="/" onClick={closeMenu}>Início</NavItem>
              <NavItem to="/guia" onClick={closeMenu}>Guia Local</NavItem>
              <NavItem to="/episodios" onClick={closeMenu}>Episódios</NavItem>
              <NavItem to="/blog" onClick={closeMenu}>Blog</NavItem>
              <NavItem to="/comercial" onClick={closeMenu}>Comercial</NavItem>
              <NavItem to="/perfil" onClick={closeMenu}>Minha Conta</NavItem>
              {!isAuthenticated && (
                  <Link to="/login" onClick={closeMenu} className="block py-4 text-yellow-600 border-t border-gray-100">Login / Cadastro</Link>
              )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
