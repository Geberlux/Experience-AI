import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface HomeContent {
  hero: {
    badge: string;
    title: string;
    highlight: string;
    description: string;
    imageUrl: string;
  };
  trustStats: {
    icon: string;
    title: string;
    desc: string;
  }[];
}

export const DEFAULT_HOME_CONTENT: HomeContent = {
  hero: {
    badge: 'Pro Level Peripherals',
    title: 'DOMINA EL',
    highlight: 'JUEGO',
    description: 'Equípate con la tecnología de los campeones. Personaliza tu setup con periféricos de alto rendimiento diseñados para la élite.',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2000'
  },
  trustStats: [
    { icon: 'ShieldCheck', title: 'Calidad Garantizada', desc: 'Productos testeados por profesionales.' },
    { icon: 'Truck', title: 'Envío Flash', desc: 'Envíos a todo el país en 24/48hs.' },
    { icon: 'Trophy', title: 'Experience Pro', desc: 'Únete al club y obtén beneficios únicos.' },
    { icon: 'Cpu', title: 'Última Tecnología', desc: 'Siempre a la vanguardia del mercado.' }
  ]
};

export const getHomeContent = async (): Promise<HomeContent> => {
  try {
    const docRef = doc(db, 'site_content', 'home');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as HomeContent;
    }
    return DEFAULT_HOME_CONTENT;
  } catch (err) {
    console.error('Error fetching home content:', err);
    return DEFAULT_HOME_CONTENT;
  }
};

export const updateHomeContent = async (content: HomeContent) => {
  const docRef = doc(db, 'site_content', 'home');
  await setDoc(docRef, content);
};
