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

export interface AboutContent {
  manifesto: string;
  hero: {
    title: string;
    highlight: string;
    imageUrl: string;
  };
  mission: {
    title: string;
    desc: string;
  };
  security: {
    title: string;
    desc: string;
  };
  stats: {
    title: string;
    desc: string;
    icon: string;
  }[];
}

export interface ContactContent {
  title: string;
  highlight: string;
  description: string;
  address: {
    title: string;
    value: string;
  };
  email: {
    title: string;
    value: string;
  };
  phone: {
    title: string;
    value: string;
  };
  mapImageUrl: string;
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

export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  manifesto: 'Manifesto',
  hero: {
    title: 'EL SETUP LO ES',
    highlight: 'TODO',
    imageUrl: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=1200'
  },
  mission: {
    title: 'Misión',
    desc: 'Proveer a cada jugador en Latinoamérica con las herramientas necesarias para competir al más alto nivel, trayendo lo último en tecnología de periféricos.'
  },
  security: {
    title: 'Seguridad',
    desc: 'Garantizamos autenticidad y calidad en cada producto. No vendemos solo periféricos, vendemos confianza.'
  },
  stats: [
    { title: '+10k', desc: 'Gamers equipados', icon: 'Users' },
    { title: '24/7', desc: 'Soporte especializado', icon: 'Zap' },
    { title: 'PRO', desc: 'Setup curado', icon: 'Trophy' }
  ]
};

export const DEFAULT_CONTACT_CONTENT: ContactContent = {
  title: 'Conecta con la',
  highlight: 'Elite',
  description: '¿Tienes dudas sobre un periférico? ¿Necesitas asesoramiento para tu setup pro? Estamos listos para ayudarte.',
  address: {
    title: 'Base de Operaciones',
    value: 'Av. Tech 1337, Silicon Sector, AR'
  },
  email: {
    title: 'Email Directo',
    value: 'support@experience.store'
  },
  phone: {
    title: 'Comms Line',
    value: '+54 11 1234-5678'
  },
  mapImageUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1600'
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

export const getAboutContent = async (): Promise<AboutContent> => {
  try {
    const docRef = doc(db, 'site_content', 'about');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return docSnap.data() as AboutContent;
    return DEFAULT_ABOUT_CONTENT;
  } catch (err) {
    console.error('Error fetching about content:', err);
    return DEFAULT_ABOUT_CONTENT;
  }
};

export const updateAboutContent = async (content: AboutContent) => {
  const docRef = doc(db, 'site_content', 'about');
  await setDoc(docRef, content);
};

export const getContactContent = async (): Promise<ContactContent> => {
  try {
    const docRef = doc(db, 'site_content', 'contact');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return docSnap.data() as ContactContent;
    return DEFAULT_CONTACT_CONTENT;
  } catch (err) {
    console.error('Error fetching contact content:', err);
    return DEFAULT_CONTACT_CONTENT;
  }
};

export const updateContactContent = async (content: ContactContent) => {
  const docRef = doc(db, 'site_content', 'contact');
  await setDoc(docRef, content);
};
