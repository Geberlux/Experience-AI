import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Cpu, MousePointer2, Keyboard, Gamepad2, ShieldCheck, Truck, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../lib/products';

const MOCK_FEATURED: Product[] = [
  {
    id: '1',
    name: 'Apex Pro TKL',
    description: 'El teclado más rápido del mundo con interruptores OmniPoint 2.0 ajustables.',
    price: 199.99,
    stock: 10,
    imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800',
    category: 'keyboards',
    active: true,
    featured: true
  },
  {
    id: '2',
    name: 'Logitech G Pro X Superlight',
    description: 'Menos de 63 g. Tecnología inalámbrica LIGHTSPEED. Sensor HERO 25K.',
    price: 159.00,
    stock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800',
    category: 'mice',
    active: true,
    featured: true
  },
  {
    id: '3',
    name: 'DualSense Edge',
    description: 'Control ultra personalizable para PS5 y PC. Gatillos adaptables.',
    price: 199.99,
    stock: 5,
    imageUrl: 'https://images.unsplash.com/photo-1600080972464-8e5f3580211e?auto=format&fit=crop&q=80&w=800',
    category: 'controllers',
    active: true,
    featured: true
  }
];

export const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[90vh] overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-30"
            alt="Gaming Hero"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gamer-dark via-transparent to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <span className="text-gamer-neon font-display font-bold tracking-[0.3em] uppercase text-sm mb-6 block">
              Pro Level Peripherals
            </span>
            <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tighter leading-none mb-8">
              DOMINA EL <br />
              <span className="text-gamer-neon shadow-neon">JUEGO</span>.
            </h1>
            <p className="text-xl text-white/60 mb-10 leading-relaxed">
              Equípate con la tecnología de los campeones. <br />
              Personaliza tu setup con periféricos de alto rendimiento diseñados para la élite.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
              <Link 
                to="/catalog" 
                className="bg-gamer-neon text-black font-bold px-10 py-5 rounded-full flex items-center justify-center space-x-2 hover:bg-white transition-all transform hover:scale-105"
              >
                <span>EXPLORAR CATÁLOGO</span>
                <ChevronRight size={20} />
              </Link>
              <button className="border border-white/20 text-white font-bold px-10 py-5 rounded-full hover:bg-white/5 transition-all">
                VER NOVEDADES
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-24 bg-gamer-dark relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { name: 'Teclados', icon: Keyboard, link: '/catalog?cat=keyboards', color: 'from-blue-500/20' },
             { name: 'Mouses', icon: MousePointer2, link: '/catalog?cat=mice', color: 'from-purple-500/20' },
             { name: 'Controles', icon: Gamepad2, link: '/catalog?cat=controllers', color: 'from-pink-500/20' }
           ].map((cat, i) => (
             <Link key={i} to={cat.link} className="group relative overflow-hidden rounded-3xl bg-gamer-card border border-white/5 p-12 hover:border-gamer-neon transition-all">
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                <cat.icon size={48} className="text-white mb-6" />
                <h3 className="text-3xl font-display font-bold mb-4">{cat.name}</h3>
                <span className="text-sm font-bold text-gamer-neon group-hover:translate-x-2 transition-transform inline-flex items-center space-x-2">
                   <span>VER TODOS</span>
                   <ChevronRight size={14} />
                </span>
             </Link>
           ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-black/40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-display font-bold mb-4 uppercase tracking-tighter">Destacados</h2>
              <div className="w-20 h-1 bg-gamer-neon rounded-full" />
            </div>
            <Link to="/catalog" className="text-gamer-neon font-bold flex items-center space-x-2 hover:underline">
              <span>VER TODO</span>
              <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {MOCK_FEATURED.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Stats Section */}
      <section className="py-24 bg-gamer-dark border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          {[
            { icon: ShieldCheck, title: 'Calidad Garantizada', desc: 'Productos testeados por profesionales.' },
            { icon: Truck, title: 'Envío Flash', desc: 'Envíos a todo el país en 24/48hs.' },
            { icon: Trophy, title: 'Experience Pro', desc: 'Únete al club y obtén beneficios únicos.' },
            { icon: Cpu, title: 'Última Tecnología', desc: 'Siempre a la vanguardia del mercado.' }
          ].map((item, i) => (
            <div key={i} className="text-center space-y-4">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-white/5 group-hover:border-gamer-neon transition-colors">
                <item.icon size={32} className="text-gamer-neon" />
              </div>
              <h4 className="font-display font-bold uppercase tracking-tight">{item.title}</h4>
              <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
