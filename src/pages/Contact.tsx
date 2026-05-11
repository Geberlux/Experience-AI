import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Mail, Phone, MapPin, Send, Zap } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'contacts'), {
        ...formData,
        createdAt: new Date().toISOString()
      });
      setSent(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <h1 className="text-5xl font-display font-bold uppercase tracking-tighter mb-8 italic">Conecta con la <span className="text-gamer-neon">Elite</span>.</h1>
          <p className="text-white/60 mb-12 max-w-md leading-relaxed text-lg">
            ¿Tienes dudas sobre un periférico? ¿Necesitas asesoramiento para tu setup pro? Estamos listos para ayudarte.
          </p>

          <div className="space-y-8">
            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                <MapPin className="text-gamer-neon" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm uppercase tracking-widest mb-1">Base de Operaciones</h4>
                <p className="text-white/40 text-sm">Av. Tech 1337, Silicon Sector, AR</p>
              </div>
            </div>
            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                <Mail className="text-gamer-neon" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm uppercase tracking-widest mb-1">Email Directo</h4>
                <p className="text-white/40 text-sm">support@experience.store</p>
              </div>
            </div>
            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                <Phone className="text-gamer-neon" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm uppercase tracking-widest mb-1">Comms Line</h4>
                <p className="text-white/40 text-sm">+54 11 1234-5678</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gamer-card border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
             <Zap size={120} className="text-gamer-neon" />
          </div>
          
          {sent ? (
             <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in">
                <div className="w-16 h-16 bg-gamer-neon rounded-full flex items-center justify-center mb-6">
                   <Send className="text-black" />
                </div>
                <h3 className="text-2xl font-display font-bold mb-2 uppercase">Mensaje Recibido</h3>
                <p className="text-white/40">Nuestros analistas te responderán en breve.</p>
                <button onClick={() => setSent(false)} className="mt-8 text-gamer-neon font-bold uppercase tracking-widest text-xs hover:underline">Enviar otro</button>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-4">Tu Nombre</label>
                  <input 
                    required
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-gamer-neon transition-colors"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-4">Tu Email</label>
                  <input 
                    required
                    type="email" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-gamer-neon transition-colors"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-4">Tu Inquietud</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-gamer-neon transition-colors resize-none"
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                ></textarea>
              </div>
              <button 
                type="submit"
                className="w-full bg-white text-black font-bold py-5 rounded-2xl flex items-center justify-center space-x-3 group hover:bg-gamer-neon transition-all"
              >
                <span>TRANSMITIR MENSAJE</span>
                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="mt-24">
         <div className="h-96 w-full bg-gamer-card rounded-3xl border border-white/10 overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-700">
            {/* 
               In a real app, here goes the Google Maps component.
               Since we need the API key, we show a themed placeholder.
            */}
            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1600" className="w-full h-full object-cover opacity-20" alt="Map Placeholder" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center bg-black/80 p-8 rounded-2xl border border-gamer-neon backdrop-blur-md">
                 <MapPin className="text-gamer-neon mx-auto mb-4" size={48} />
                 <h3 className="text-xl font-display font-bold uppercase mb-2">Google Maps Elite</h3>
                 <p className="text-white/40 text-xs">Ubicación protegida por seguridad de nivel militar.</p>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
};
