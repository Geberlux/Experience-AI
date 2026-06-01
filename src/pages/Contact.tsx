import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, Zap, Edit2, Save, X } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, doc, runTransaction } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { getContactContent, updateContactContent, ContactContent, DEFAULT_CONTACT_CONTENT } from '../lib/cms';
import { getDirectImageUrl } from '../lib/utils';

export const Contact = () => {
  const { isAdmin, user } = useAuth();
  const [content, setContent] = useState<ContactContent>(DEFAULT_CONTACT_CONTENT);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.displayName || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchContent = async () => {
      const data = await getContactContent();
      setContent(data);
      setLoading(false);
    };
    fetchContent();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateContactContent(content);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving contact content:', err);
      alert('Error al guardar cambios.');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (path: string, value: string) => {
    setContent(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let current: any = next;
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);

      // Increment contacts counter using a Firestore transaction
      const counterRef = doc(db, 'counters', 'contacts');
      const nextNum = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        let currentCount = 0;
        if (counterDoc.exists()) {
          currentCount = counterDoc.data().count || 0;
        }
        const nextCount = currentCount + 1;
        transaction.set(counterRef, { count: nextCount });
        return nextCount;
      });

      const paddedNumber = String(nextNum).padStart(5, '0');

      // 1. Record in Firestore
      await addDoc(collection(db, 'contacts'), {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        number: paddedNumber,
        createdAt: new Date().toISOString()
      });

      // 2. Automatically send email through the backend API
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          number: paddedNumber
        })
      });

      setSent(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (err: any) {
      console.error('Error sending message:', err);
      // Fallback is also smooth and alert-free
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gamer-dark">
        <div className="w-12 h-12 border-4 border-gamer-neon border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 relative">
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
              <span>EDITAR DATOS</span>
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          {isEditing ? (
            <div className="space-y-4 mb-8">
              <input 
                type="text"
                value={content.title}
                onChange={e => updateField('title', e.target.value)}
                className="bg-white/5 border border-white/20 text-4xl font-display font-bold uppercase tracking-tighter w-full outline-none focus:border-gamer-neon"
              />
              <input 
                type="text"
                value={content.highlight}
                onChange={e => updateField('highlight', e.target.value)}
                className="bg-white/5 border border-white/20 text-4xl text-gamer-neon font-display font-bold uppercase tracking-tighter w-full outline-none focus:border-gamer-neon"
              />
              <textarea 
                value={content.description}
                onChange={e => updateField('description', e.target.value)}
                className="bg-white/5 border border-white/20 rounded w-full h-24 p-2 text-white/60 outline-none focus:border-gamer-neon"
              />
            </div>
          ) : (
            <>
              <h1 className="text-5xl font-display font-bold uppercase tracking-tighter mb-8 italic">
                {content.title} <span className="text-gamer-neon">{content.highlight}</span>.
              </h1>
              <p className="text-white/60 mb-12 max-w-md leading-relaxed text-lg">
                {content.description}
              </p>
            </>
          )}

          <div className="space-y-8">
            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 shrink-0">
                <MapPin className="text-gamer-neon" />
              </div>
              <div className="flex-1">
                {isEditing ? (
                   <div className="space-y-1">
                      <input 
                        type="text"
                        value={content.address.title}
                        onChange={e => updateField('address.title', e.target.value)}
                        className="bg-white/5 border border-white/20 text-xs font-display font-bold uppercase tracking-widest w-full outline-none focus:border-gamer-neon"
                      />
                      <input 
                        type="text"
                        value={content.address.value}
                        onChange={e => updateField('address.value', e.target.value)}
                        className="bg-white/5 border border-white/20 text-sm text-white/40 w-full outline-none focus:border-gamer-neon"
                      />
                   </div>
                ) : (
                  <>
                    <h4 className="font-display font-bold text-sm uppercase tracking-widest mb-1">{content.address.title}</h4>
                    <p className="text-white/40 text-sm">{content.address.value}</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 shrink-0">
                <Mail className="text-gamer-neon" />
              </div>
              <div className="flex-1">
                {isEditing ? (
                   <div className="space-y-1">
                      <input 
                        type="text"
                        value={content.email.title}
                        onChange={e => updateField('email.title', e.target.value)}
                        className="bg-white/5 border border-white/20 text-xs font-display font-bold uppercase tracking-widest w-full outline-none focus:border-gamer-neon"
                      />
                      <input 
                        type="text"
                        value={content.email.value}
                        onChange={e => updateField('email.value', e.target.value)}
                        className="bg-white/5 border border-white/20 text-sm text-white/40 w-full outline-none focus:border-gamer-neon"
                      />
                   </div>
                ) : (
                  <>
                    <h4 className="font-display font-bold text-sm uppercase tracking-widest mb-1">{content.email.title}</h4>
                    <p className="text-white/40 text-sm">{content.email.value}</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 shrink-0">
                <Phone className="text-gamer-neon" />
              </div>
              <div className="flex-1">
                {isEditing ? (
                   <div className="space-y-1">
                      <input 
                        type="text"
                        value={content.phone.title}
                        onChange={e => updateField('phone.title', e.target.value)}
                        className="bg-white/5 border border-white/20 text-xs font-display font-bold uppercase tracking-widest w-full outline-none focus:border-gamer-neon"
                      />
                      <input 
                        type="text"
                        value={content.phone.value}
                        onChange={e => updateField('phone.value', e.target.value)}
                        className="bg-white/5 border border-white/20 text-sm text-white/40 w-full outline-none focus:border-gamer-neon"
                      />
                   </div>
                ) : (
                  <>
                    <h4 className="font-display font-bold text-sm uppercase tracking-widest mb-1">{content.phone.title}</h4>
                    <p className="text-white/40 text-sm">{content.phone.value}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gamer-card border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
             <Zap size={120} className="text-gamer-neon" />
          </div>
          
          {sent ? (
             <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in min-h-[350px]">
                <div className="w-16 h-16 bg-gamer-neon/15 border border-gamer-neon/30 text-gamer-neon rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,255,136,0.15)] animate-bounce">
                   <Send size={28} />
                </div>
                <h3 className="text-2xl font-display font-bold mb-2 uppercase tracking-tighter">¡Mensaje Transmitido!</h3>
                <p className="text-white/60 mb-6 text-sm max-w-sm">Nuestros asesores técnicos responderán de manera directa a tu correo electrónico.</p>
                <button 
                  onClick={() => setSent(false)} 
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-widest text-gamer-neon transition-colors cursor-pointer"
                >
                  Enviar otro
                </button>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <h3 className="text-2xl font-display font-bold uppercase tracking-tighter mb-4 text-gamer-neon">
                Soporte y Consultas
              </h3>
              <p className="text-white/60 text-sm mb-6 leading-relaxed">
                Escribinos de forma inmediata. Al completar el formulario se enviará un reporte asincrónico directo a nuestro equipo de atención al cliente.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-4">Tu Nombre</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Gamer"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-gamer-neon transition-colors text-white placeholder-white/20"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-4">Tu Email</label>
                  <input 
                    required
                    type="email" 
                    placeholder="ejemplo@correo.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-gamer-neon transition-colors text-white placeholder-white/20"
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
                  placeholder="Detallá tu consulta aquí..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-gamer-neon transition-colors resize-none text-white placeholder-white/20 leading-relaxed"
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-white text-black font-bold py-5 rounded-2xl flex items-center justify-center space-x-3 group hover:bg-gamer-neon transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{submitting ? 'TRANSMITIENDO...' : 'TRANSMITIR MENSAJE'}</span>
                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="mt-24">
         <div className="h-96 w-full bg-gamer-card rounded-3xl border border-white/10 overflow-hidden relative group">
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(content.address.value)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full grayscale invert opacity-70 contrast-125 group-hover:grayscale-0 group-hover:invert-0 group-hover:opacity-100 transition-all duration-700"
            />
         </div>
      </div>
    </div>
  );
};
