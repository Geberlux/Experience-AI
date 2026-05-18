import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Cpu, MousePointer2, Keyboard, Gamepad2, ShieldCheck, Truck, Trophy, Edit2, Save, X, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../lib/products';
import { useAuth } from '../lib/AuthContext';
import { getHomeContent, updateHomeContent, HomeContent, DEFAULT_HOME_CONTENT } from '../lib/cms';

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
  const { isAdmin } = useAuth();
  const [content, setContent] = useState<HomeContent>(DEFAULT_HOME_CONTENT);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      const data = await getHomeContent();
      setContent(data);
      setLoading(false);
    };
    fetchContent();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateHomeContent(content);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving content:', err);
      alert('Error al guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  const updateHero = (field: keyof HomeContent['hero'], value: string) => {
    setContent(prev => ({
      ...prev,
      hero: { ...prev.hero, [field]: value }
    }));
  };

  const updateStat = (index: number, field: keyof HomeContent['trustStats'][0], value: string) => {
    setContent(prev => {
      const newStats = [...prev.trustStats];
      newStats[index] = { ...newStats[index], [field]: value };
      return { ...prev, trustStats: newStats };
    });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gamer-dark">
        <div className="w-12 h-12 border-4 border-gamer-neon border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Admin Controls */}
      {isAdmin && (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col space-y-4">
          {isEditing ? (
            <>
              <button 
                onClick={() => setIsEditing(false)}
                className="bg-gamer-danger text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center space-x-2 font-bold"
              >
                <X size={24} />
                <span>CANCELAR</span>
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-green-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center space-x-2 font-bold disabled:opacity-50"
              >
                <Save size={24} />
                <span>{saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}</span>
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-gamer-accent text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center space-x-2 font-bold"
            >
              <Edit2 size={24} />
              <span>EDITAR INICIO</span>
            </button>
          )}
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-[90vh] overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src={content.hero.imageUrl} 
            className="w-full h-full object-cover opacity-30"
            alt="Gaming Hero"
          />
          {isEditing && (
            <div className="absolute top-4 right-4 z-20">
              <input 
                type="text" 
                value={content.hero.imageUrl}
                onChange={(e) => updateHero('imageUrl', e.target.value)}
                placeholder="URL de imagen Hero"
                className="bg-black/80 border border-white/20 rounded px-4 py-2 text-xs w-64 focus:border-gamer-neon outline-none"
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gamer-dark via-transparent to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            {isEditing ? (
              <input 
                type="text"
                value={content.hero.badge}
                onChange={(e) => updateHero('badge', e.target.value)}
                className="bg-white/5 border border-gamer-neon/30 text-gamer-neon font-display font-bold tracking-[0.3em] uppercase text-sm mb-6 block w-full px-2 py-1 outline-none focus:border-gamer-neon"
              />
            ) : (
              <span className="text-gamer-neon font-display font-bold tracking-[0.3em] uppercase text-sm mb-6 block">
                {content.hero.badge}
              </span>
            )}

            <div className="mb-8">
              {isEditing ? (
                 <div className="space-y-2">
                   <input 
                    type="text"
                    value={content.hero.title}
                    onChange={(e) => updateHero('title', e.target.value)}
                    className="bg-white/5 border border-white/20 text-4xl md:text-6xl font-display font-bold tracking-tighter leading-none w-full px-2 outline-none focus:border-gamer-neon"
                   />
                   <input 
                    type="text"
                    value={content.hero.highlight}
                    onChange={(e) => updateHero('highlight', e.target.value)}
                    className="bg-white/5 border border-white/20 text-4xl md:text-6xl text-gamer-neon font-display font-bold tracking-tighter leading-none w-full px-2 outline-none focus:border-gamer-neon shadow-neon"
                   />
                 </div>
              ) : (
                <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tighter leading-none">
                  {content.hero.title} <br />
                  <span className="text-gamer-neon shadow-neon">{content.hero.highlight}</span>.
                </h1>
              )}
            </div>

            {isEditing ? (
              <textarea 
                value={content.hero.description}
                onChange={(e) => updateHero('description', e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded h-32 px-4 py-2 text-xl text-white/60 mb-10 leading-relaxed outline-none focus:border-gamer-neon"
              />
            ) : (
              <p className="text-xl text-white/60 mb-10 leading-relaxed">
                {content.hero.description}
              </p>
            )}

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
          {content.trustStats.map((item, i) => {
            const iconsMap: Record<string, any> = { ShieldCheck, Truck, Trophy, Cpu };
            const Icon = iconsMap[item.icon] || Cpu;

            return (
              <div key={i} className="text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-white/5 hover:border-gamer-neon transition-colors relative group">
                  <Icon size={32} className="text-gamer-neon" />
                </div>
                {isEditing ? (
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      value={item.title}
                      onChange={(e) => updateStat(i, 'title', e.target.value)}
                      className="bg-white/5 border border-white/20 rounded px-2 py-1 text-xs font-display font-bold uppercase tracking-tight w-full text-center outline-none focus:border-gamer-neon"
                    />
                    <textarea 
                      value={item.desc}
                      onChange={(e) => updateStat(i, 'desc', e.target.value)}
                      className="bg-white/5 border border-white/20 rounded px-2 py-1 text-[10px] text-white/40 leading-relaxed w-full text-center outline-none focus:border-gamer-neon h-16"
                    />
                  </div>
                ) : (
                  <>
                    <h4 className="font-display font-bold uppercase tracking-tight">{item.title}</h4>
                    <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
