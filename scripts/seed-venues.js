// Script para popular o Firestore com dados iniciais de venues
// Execute com: node scripts/seed-venues.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBesCGFzvzKWHWW-RfNvjTwZPlzESb_EqE",
  authDomain: "unimarevents.firebaseapp.com",
  projectId: "unimarevents",
  storageBucket: "unimarevents.firebasestorage.app",
  messagingSenderId: "805955244979",
  appId: "1:805955244979:web:743d43b2db8039579231c6",
  measurementId: "G-7E4BW96FYC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const venues = [
  {
    name: "Auditório Principal",
    location: "Bloco A - 1º Andar",
    capacity: 200,
    is_active: true,
    description: "Auditório principal da UNIMAR com sistema de som e projeção completo",
    amenities: ["Sistema de som", "Projeção", "Ar condicionado", "Palco", "Microfones"]
  },
  {
    name: "Sala de Conferências",
    location: "Bloco B - 2º Andar",
    capacity: 50,
    is_active: true,
    description: "Sala de conferências equipada para reuniões e apresentações",
    amenities: ["TV 55\"", "Sistema de som", "Ar condicionado", "Mesa de reunião"]
  },
  {
    name: "Anfiteatro",
    location: "Bloco C - Térreo",
    capacity: 150,
    is_active: true,
    description: "Anfiteatro com arquibancadas e palco para eventos maiores",
    amenities: ["Palco", "Arquibancadas", "Sistema de som", "Iluminação cênica", "Ar condicionado"]
  },
  {
    name: "Laboratório de Informática",
    location: "Bloco D - 3º Andar",
    capacity: 30,
    is_active: true,
    description: "Laboratório com computadores para workshops e treinamentos",
    amenities: ["30 computadores", "Projetor", "Ar condicionado", "Internet"]
  },
  {
    name: "Sala de Eventos",
    location: "Bloco E - 1º Andar",
    capacity: 80,
    is_active: true,
    description: "Sala versátil para eventos corporativos e sociais",
    amenities: ["Sistema de som", "Projeção", "Ar condicionado", "Espaço para coffee break"]
  }
];

async function seedVenues() {
  try {
    console.log('Iniciando população do Firestore com venues...');
    
    for (const venue of venues) {
      const docRef = await addDoc(collection(db, 'venues'), venue);
      console.log(`Venue "${venue.name}" adicionado com ID: ${docRef.id}`);
    }
    
    console.log('✅ Todos os venues foram adicionados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao adicionar venues:', error);
  }
}

seedVenues();
