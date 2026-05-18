import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, ChevronRight, Zap } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useCartStore } from '../store/useCartStore';
import { motion, AnimatePresence } from 'motion/react';
import { AuthModal } from './AuthModal';
import { useAuth } from '../lib/AuthContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const cartTotal = useCartStore((state) => state.total);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const navigate = useNavigate();

  const logout = () => signOut(auth);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-gamer-dark/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gamer-accent rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(112,0,255,0.5)]">
                <Zap className="text-white fill-current" size={24} />
              </div>
              <span className="text-2xl font-display font-bold tracking-tighter">EXPERIENCE</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8 text-sm font-medium uppercase tracking-widest">
              <Link to="/catalog" className="text-white/70 hover:text-gamer-neon transition-colors">Catálogo</Link>
              <Link to="/about" className="text-white/70 hover:text-gamer-neon transition-colors">Quiénes Somos</Link>
              <Link to="/contact" className="text-white/70 hover:text-gamer-neon transition-colors">Contacto</Link>
              {isAdmin && (
                 <Link to="/catalog" className="text-gamer-accent hover:text-white transition-colors">Gestión Stock</Link>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-white/70 hover:text-gamer-neon transition-colors"
                id="cart-button"
              >
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-gamer-danger text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                    {cartCount}
                  </span>
                )}
              </button>

              {user ? (
                <div className="flex items-center space-x-4">
                  <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}`} className="w-8 h-8 rounded-full border border-gamer-accent" alt="Profile" />
                  <button onClick={logout} className="p-2 text-white/70 hover:text-gamer-danger transition-colors">
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAuthOpen(true)}
                  className="hidden md:flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-md font-bold text-sm uppercase tracking-tighter hover:bg-gamer-neon transition-colors"
                >
                  <User size={18} />
                  <span>Ingresar</span>
                </button>
              )}

              <button className="md:hidden p-2 text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-gamer-card border-l border-white/10 z-[101] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-display font-bold">Tu Carrito</h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:text-gamer-danger">
                  <X />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 text-white/40">
                    <ShoppingCart size={64} strokeWidth={1} />
                    <p>Tu carrito está vacío</p>
                    <button 
                      onClick={() => { setIsCartOpen(false); navigate('/catalog'); }}
                      className="bg-gamer-accent text-white px-6 py-3 rounded-full font-bold hover:bg-gamer-neon hover:text-black transition-all"
                    >
                      Explorar Productos
                    </button>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="flex space-x-4 bg-white/5 p-4 rounded-xl border border-white/5">
                      <img src={item.imageUrl} className="w-20 h-20 object-cover rounded-lg" alt={item.name} />
                      <div className="flex-1">
                        <h4 className="font-bold text-sm">{item.name}</h4>
                        <div className="flex items-center justify-between mt-2">
                           <div className="flex items-center space-x-2">
                             <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center bg-white/10 rounded">-</button>
                             <span className="text-sm">{item.quantity}</span>
                             <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center bg-white/10 rounded">+</button>
                           </div>
                           <p className="text-gamer-neon font-bold">${item.price * item.quantity}</p>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-[10px] text-white/30 hover:text-gamer-danger mt-2 uppercase tracking-widest font-bold">Quitar</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="p-6 border-t border-white/10 bg-black/20">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-white/60">Total estimado</span>
                    <span className="text-2xl font-display font-bold text-gamer-neon">${cartTotal}</span>
                  </div>
                  <button 
                    disabled={true} 
                    className="w-full py-4 bg-gamer-accent rounded-xl font-bold flex items-center justify-center space-x-2 group hover:shadow-[0_0_20px_rgba(112,0,255,0.4)] transition-all"
                  >
                    <span>Finalizar Compra (MP)</span>
                    <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <p className="text-center text-[10px] text-white/30 mt-4 uppercase tracking-tighter">Pagos seguros vía MercadoPago</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gamer-card border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <Zap className="text-gamer-accent fill-current" size={20} />
              <span className="text-xl font-display font-bold">EXPERIENCE</span>
            </Link>
            <p className="text-sm text-white/40">Llevamos tu setup al siguiente nivel con los periféricos más exclusivos del mercado.</p>
          </div>
          <div>
            <h5 className="font-display font-bold mb-4 uppercase text-xs tracking-widest">Navegación</h5>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link to="/catalog">Catálogo</Link></li>
              <li><Link to="/about">Quiénes Somos</Link></li>
              <li><Link to="/contact">Contacto</Link></li>
            </ul>
          </div>
          <div>
             <h5 className="font-display font-bold mb-4 uppercase text-xs tracking-widest">Legal</h5>
             <ul className="space-y-2 text-sm text-white/60">
              <li>Términos y condiciones</li>
              <li>Política de privacidad</li>
              <li>Defensa del consumidor</li>
            </ul>
          </div>
          <div>
            <h5 className="font-display font-bold mb-4 uppercase text-xs tracking-widest">Newsletter</h5>
            <div className="flex space-x-2">
              <input type="email" placeholder="Email" className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-gamer-neon flex-1" />
              <button className="bg-gamer-neon text-black font-bold p-2 rounded"><ChevronRight /></button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-white/5 text-center text-[10px] text-white/20 uppercase tracking-widest">
          © 2026 Experience Store. Built for the elite.
        </div>
      </footer>
    </div>
  );
};
