import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Types for Firestore Database
export interface FirestoreBooking {
  id?: string;
  user_id: string;
  company_name: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  venue_id: string;
  event_date: string;
  start_time: string;
  end_time: string;
  event_title: string;
  event_description?: string;
  is_public: boolean;
  is_free: boolean;
  requires_registration: boolean;
  expected_attendees?: number;
  contract_info?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  approved_by?: string;
  approved_at?: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// Database references
const bookingsCollection = collection(db, 'bookings');
const venuesCollection = collection(db, 'venues');

// Booking operations
export const createFirestoreBooking = async (bookingData: Omit<FirestoreBooking, 'id' | 'created_at' | 'updated_at'>): Promise<string> => {
  try {
    const now = Timestamp.now();
    
    const bookingWithTimestamps = {
      ...bookingData,
      created_at: now,
      updated_at: now
    };

    const docRef = await addDoc(bookingsCollection, bookingWithTimestamps);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating booking in Firestore:', error);
    throw error;
  }
};

export const getUserBookings = async (userId: string): Promise<FirestoreBooking[]> => {
  try {
    const userBookingsQuery = query(
      bookingsCollection,
      where('user_id', '==', userId),
      orderBy('created_at', 'desc')
    );
    
    const querySnapshot = await getDocs(userBookingsQuery);
    const bookings: FirestoreBooking[] = [];
    
    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data()
      } as FirestoreBooking);
    });
    
    return bookings;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
};

export const getAllBookings = async (): Promise<FirestoreBooking[]> => {
  try {
    const querySnapshot = await getDocs(bookingsCollection);
    const bookings: FirestoreBooking[] = [];
    
    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data()
      } as FirestoreBooking);
    });
    
    return bookings.sort((a, b) => b.created_at.toMillis() - a.created_at.toMillis());
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    throw error;
  }
};

export const updateBookingStatus = async (
  bookingId: string, 
  status: 'pending' | 'approved' | 'rejected',
  approvedBy?: string,
  rejectionReason?: string
): Promise<void> => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const updates: Partial<FirestoreBooking> = {
      status,
      updated_at: Timestamp.now()
    };

    if (status === 'approved' && approvedBy) {
      updates.approved_by = approvedBy;
      updates.approved_at = Timestamp.now();
    }

    if (status === 'rejected' && rejectionReason) {
      updates.rejection_reason = rejectionReason;
    }

    await updateDoc(bookingRef, updates);
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

export const deleteBooking = async (bookingId: string): Promise<void> => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await deleteDoc(bookingRef);
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
};

// Venue operations
export const createVenue = async (venueData: {
  name: string;
  location: string;
  capacity: number;
  description?: string;
  amenities?: string[];
  is_active?: boolean;
}): Promise<string> => {
  try {
    const venueWithTimestamps = {
      ...venueData,
      is_active: venueData.is_active ?? true,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    };

    const docRef = await addDoc(venuesCollection, venueWithTimestamps);
    return docRef.id;
  } catch (error) {
    console.error('Error creating venue:', error);
    throw error;
  }
};

export const getVenues = async (): Promise<Array<{
  id: string;
  name: string;
  location: string;
  capacity: number;
  description?: string;
  amenities?: string[];
  is_active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}>> => {
  try {
    const querySnapshot = await getDocs(venuesCollection);
    const venues: any[] = [];
    
    querySnapshot.forEach((doc) => {
      venues.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Se não há venues no banco, retorna dados de exemplo
    if (venues.length === 0) {
      return [
        {
          id: "auditorio-principal",
          name: "Auditório Principal",
          location: "Bloco A - 1º Andar",
          capacity: 200,
          description: "Auditório principal da universidade com equipamentos audiovisuais completos",
          amenities: ["Projetor", "Sistema de Som", "Ar Condicionado", "Palco", "Cadeiras Confortáveis"],
          is_active: true,
          created_at: Timestamp.now(),
          updated_at: Timestamp.now()
        },
        {
          id: "sala-conferencias",
          name: "Sala de Conferências",
          location: "Bloco B - 2º Andar",
          capacity: 50,
          description: "Sala ideal para reuniões e apresentações menores",
          amenities: ["Projetor", "Quadro Branco", "Ar Condicionado", "Mesa de Reunião"],
          is_active: true,
          created_at: Timestamp.now(),
          updated_at: Timestamp.now()
        },
        {
          id: "laboratorio-informatica",
          name: "Laboratório de Informática",
          location: "Bloco C - Térreo",
          capacity: 30,
          description: "Laboratório com computadores para cursos e treinamentos",
          amenities: ["Computadores", "Projetor", "Ar Condicionado", "Internet"],
          is_active: true,
          created_at: Timestamp.now(),
          updated_at: Timestamp.now()
        },
        {
          id: "anfiteatro",
          name: "Anfiteatro",
          location: "Bloco D - Térreo",
          capacity: 150,
          description: "Anfiteatro ao ar livre para eventos externos",
          amenities: ["Palco", "Sistema de Som", "Iluminação", "Área de Convivência"],
          is_active: true,
          created_at: Timestamp.now(),
          updated_at: Timestamp.now()
        },
        {
          id: "sala-eventos",
          name: "Sala de Eventos",
          location: "Bloco E - 1º Andar",
          capacity: 80,
          description: "Sala versátil para diversos tipos de eventos",
          amenities: ["Projetor", "Sistema de Som", "Ar Condicionado", "Cozinha"],
          is_active: true,
          created_at: Timestamp.now(),
          updated_at: Timestamp.now()
        }
      ];
    }
    
    return venues.filter(venue => venue.is_active).sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching venues:', error);
    throw error;
  }
};

// Check venue availability
export const checkVenueAvailability = async (
  venueId: string,
  eventDate: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): Promise<boolean> => {
  try {
    const venueBookingsQuery = query(
      bookingsCollection,
      where('venue_id', '==', venueId)
    );
    
    const querySnapshot = await getDocs(venueBookingsQuery);
    
    if (querySnapshot.empty) {
      return true; // No bookings for this venue
    }
    
    // Check for conflicts
    let hasConflict = false;
    querySnapshot.forEach((doc) => {
      const booking = doc.data();
      
      // Skip the booking being updated (if any)
      if (excludeBookingId && doc.id === excludeBookingId) {
        return;
      }
      
      // Check if dates match
      if (booking.event_date === eventDate) {
        // Check if there's time overlap
        if (isTimeOverlap(startTime, endTime, booking.start_time, booking.end_time)) {
          hasConflict = true;
        }
      }
    });
    
    return !hasConflict;
  } catch (error) {
    console.error('Error checking venue availability:', error);
    throw error;
  }
};

// Helper function to check time overlap
const isTimeOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  const start1Time = new Date(`2000-01-01T${start1}`);
  const end1Time = new Date(`2000-01-01T${end1}`);
  const start2Time = new Date(`2000-01-01T${start2}`);
  const end2Time = new Date(`2000-01-01T${end2}`);
  
  return start1Time < end2Time && start2Time < end1Time;
};
