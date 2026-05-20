import React, { useState, useEffect } from 'react';
import { Target, Users, Zap, Shield, Trophy, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { getAboutContent, updateAboutContent, AboutContent, DEFAULT_ABOUT_CONTENT } from '../lib/cms';
import { getDirectImageUrl } from '../lib/utils';

export const About = () => {
  const { isAdmin } = useAuth();
  const [content, setContent] = useState<AboutContent>(DEFAULT_ABOUT_CONTENT);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      const data = await getAboutContent();
      setContent(data);
      setLoading(false);
    };
    fetchContent();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAboutContent(content);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving about content:', err);
      alert('Error al guardar cambios.');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (path: string, value: string) => {
    setContent(prev => {
      const next = { ...prev };
      const parts = path.split('.');
      let current: any = next;
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const updateStat = (index: number, field: 'title' | 'desc', value: string) => {
    setContent(prev => {
      const next = { ...prev };
      next.stats[index] = { ...next.stats[index], [field]: value };
      return next;
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
    <div className="pt-32 pb-24 relative">
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
              <span>EDITAR CONTENIDO</span>
            </button>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-24">
           {isEditing ? (
             <input 
               type="text"
               value={content.manifesto}
               onChange={(e) => updateField('manifesto', e.target.value)}
               className="bg-white/5 border border-gamer-neon/30 text-gamer-neon font-display font-bold uppercase tracking-[0.4em] text-xs mb-4 block mx-auto text-center w-64 outline-none focus:border-gamer-neon"
             />
           ) : (
             <span className="text-gamer-neon font-display font-bold uppercase tracking-[0.4em] text-xs mb-4 block">{content.manifesto}</span>
           )}

           <div className="mb-8">
             {isEditing ? (
               <div className="space-y-4">
                 <input 
                  type="text"
                  value={content.hero.title}
                  onChange={(e) => updateField('hero.title', e.target.value)}
                  className="bg-white/5 border border-white/20 text-4xl md:text-6xl font-display font-bold uppercase tracking-tighter w-full text-center outline-none focus:border-gamer-neon"
                 />
                 <input 
                  type="text"
                  value={content.hero.highlight}
                  onChange={(e) => updateField('hero.highlight', e.target.value)}
                  className="bg-white/5 border border-white/20 text-4xl md:text-6xl text-white/20 italic font-display font-bold uppercase tracking-tighter w-full text-center outline-none focus:border-gamer-neon"
                 />
               </div>
             ) : (
               <h1 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter">
                 {content.hero.title} <br />
                 ES <span className="text-white/20 italic">{content.hero.highlight}</span>.
               </h1>
             )}
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center mb-32">
           <div className="relative group">
              <div className="absolute -inset-4 bg-gamer-neon/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <img referrerPolicy="no-referrer" src={getDirectImageUrl(content.hero.imageUrl)} className="rounded-3xl border border-white/10 relative z-10 w-full" alt="Gamer Setup" />
              {isEditing && (
                <div className="mt-4">
                  <input 
                    type="text"
                    value={content.hero.imageUrl}
                    onChange={(e) => updateField('hero.imageUrl', e.target.value)}
                    placeholder="URL Imagen"
                    className="w-full bg-white/5 border border-white/20 rounded px-4 py-2 text-xs outline-none focus:border-gamer-neon"
                  />
                </div>
              )}
           </div>
           <div className="space-y-8">
              <div className="flex space-x-6">
                 <div className="w-14 h-14 bg-gamer-accent rounded-full flex items-center justify-center shrink-0">
                    <Target size={28} />
                 </div>
                 <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input 
                          type="text"
                          value={content.mission.title}
                          onChange={(e) => updateField('mission.title', e.target.value)}
                          className="bg-white/5 border border-white/20 text-2xl font-display font-bold uppercase w-full outline-none focus:border-gamer-neon"
                        />
                        <textarea 
                          value={content.mission.desc}
                          onChange={(e) => updateField('mission.desc', e.target.value)}
                          className="bg-white/5 border border-white/20 rounded w-full h-24 p-2 text-white/40 text-sm outline-none focus:border-gamer-neon"
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="text-2xl font-display font-bold uppercase mb-2">{content.mission.title}</h3>
                        <p className="text-white/40 leading-relaxed text-sm">{content.mission.desc}</p>
                      </>
                    )}
                 </div>
              </div>
              <div className="flex space-x-6">
                 <div className="w-14 h-14 bg-gamer-neon text-black rounded-full flex items-center justify-center shrink-0">
                    <Shield size={28} />
                 </div>
                 <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input 
                          type="text"
                          value={content.security.title}
                          onChange={(e) => updateField('security.title', e.target.value)}
                          className="bg-white/5 border border-white/20 text-2xl font-display font-bold uppercase w-full outline-none focus:border-gamer-neon"
                        />
                        <textarea 
                          value={content.security.desc}
                          onChange={(e) => updateField('security.desc', e.target.value)}
                          className="bg-white/5 border border-white/20 rounded w-full h-24 p-2 text-white/40 text-sm outline-none focus:border-gamer-neon"
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="text-2xl font-display font-bold uppercase mb-2">{content.security.title}</h3>
                        <p className="text-white/40 leading-relaxed text-sm">{content.security.desc}</p>
                      </>
                    )}
                 </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {content.stats.map((stat, i) => {
             const IconMap: Record<string, any> = { Users, Zap, Trophy };
             const Icon = IconMap[stat.icon] || Trophy;

             return (
              <div key={i} className="bg-white/5 border border-white/5 rounded-3xl p-12 text-center group hover:border-gamer-neon transition-all">
                 <Icon className="mx-auto mb-6 text-white/20 group-hover:text-gamer-neon transition-colors" size={48} />
                 {isEditing ? (
                   <div className="space-y-2">
                      <input 
                        type="text"
                        value={stat.title}
                        onChange={(e) => updateStat(i, 'title', e.target.value)}
                        className="bg-white/5 border border-white/20 text-4xl font-display font-bold w-full text-center outline-none focus:border-gamer-neon"
                      />
                      <input 
                        type="text"
                        value={stat.desc}
                        onChange={(e) => updateStat(i, 'desc', e.target.value)}
                        className="bg-white/5 border border-white/20 text-xs uppercase tracking-widest text-white/40 font-bold w-full text-center outline-none focus:border-gamer-neon"
                      />
                   </div>
                 ) : (
                   <>
                    <h4 className="text-4xl font-display font-bold mb-2">{stat.title}</h4>
                    <p className="text-xs uppercase tracking-widest text-white/40 font-bold">{stat.desc}</p>
                   </>
                 )}
              </div>
             );
           })}
        </div>
      </div>
    </div>
  );
};
