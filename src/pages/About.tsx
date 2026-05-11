import React from 'react';
import { Layout } from '../components/Layout';
import { Target, Users, Zap, Shield, Trophy } from 'lucide-react';

export const About = () => {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-24">
           <span className="text-gamer-neon font-display font-bold uppercase tracking-[0.4em] text-xs mb-4 block">Manifesto</span>
           <h1 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter mb-8">EL SETUP LO <br /> ES <span className="text-white/20 italic">TODO</span>.</h1>
           <p className="text-xl text-white/40 max-w-2xl mx-auto leading-relaxed">
             No somos solo una tienda. Somos una comunidad de gamers apasionados por la perfección técnica y el rendimiento sin concesiones.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center mb-32">
           <div className="relative group">
              <div className="absolute -inset-4 bg-gamer-neon/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <img src="https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=1200" className="rounded-3xl border border-white/10 relative z-10" alt="Gamer Setup" />
           </div>
           <div className="space-y-8">
              <div className="flex space-x-6">
                 <div className="w-14 h-14 bg-gamer-accent rounded-full flex items-center justify-center shrink-0">
                    <Target size={28} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-display font-bold uppercase mb-2">Misión</h3>
                    <p className="text-white/40 leading-relaxed text-sm">Proveer a cada jugador en Latinoamérica con las herramientas necesarias para competir al más alto nivel, trayendo lo último en tecnología de periféricos.</p>
                 </div>
              </div>
              <div className="flex space-x-6">
                 <div className="w-14 h-14 bg-gamer-neon text-black rounded-full flex items-center justify-center shrink-0">
                    <Shield size={28} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-display font-bold uppercase mb-2">Seguridad</h3>
                    <p className="text-white/40 leading-relaxed text-sm">Garantizamos autenticidad y calidad en cada producto. No vendemos solo periféricos, vendemos confianza.</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { title: '+10k', desc: 'Gamers equipados', icon: Users },
             { title: '24/7', desc: 'Soporte especializado', icon: Zap },
             { title: 'PRO', desc: 'Setup curado', icon: Trophy },
           ].map((stat, i) => (
             <div key={i} className="bg-white/5 border border-white/5 rounded-3xl p-12 text-center group hover:border-gamer-neon transition-all">
                <stat.icon className="mx-auto mb-6 text-white/20 group-hover:text-gamer-neon transition-colors" size={48} />
                <h4 className="text-4xl font-display font-bold mb-2">{stat.title}</h4>
                <p className="text-xs uppercase tracking-widest text-white/40 font-bold">{stat.desc}</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};
