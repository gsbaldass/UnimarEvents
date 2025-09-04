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
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Types
export interface Venue {
  id: string;
  name: string;
  location: string;
  capacity: number;
  is_active: boolean;
  description?: string;
  amenities?: string[];
}

export interface EventBooking {
  id: string;
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
  created_at: Timestamp;
  updated_at: Timestamp;
  approved_by?: string;
  approved_at?: Timestamp;
}

// Venues Collection
export const venuesCollection = collection(db, 'venues');
export const bookingsCollection = collection(db, 'bookings');

// Venue operations
export const getVenues = async (): Promise<Venue[]> => {
  try {
    const q = query(venuesCollection, where('is_active', '==', true), orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Venue));
  } catch (error) {
    throw error;
  }
};

export const getVenueById = async (id: string): Promise<Venue | null> => {
  try {
    const docRef = doc(db, 'venues', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Venue;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

// Booking operations
export const createBooking = async (bookingData: Omit<EventBooking, 'id' | 'created_at' | 'updated_at'>): Promise<string> => {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(bookingsCollection, {
      ...bookingData,
      created_at: now,
      updated_at: now
    });
    
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getUserBookings = async (userId: string): Promise<EventBooking[]> => {
  try {
    const q = query(
      bookingsCollection, 
      where('user_id', '==', userId),
      orderBy('created_at', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as EventBooking));
  } catch (error) {
    throw error;
  }
};

export const getAllBookings = async (): Promise<EventBooking[]> => {
  try {
    const q = query(bookingsCollection, orderBy('created_at', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as EventBooking));
  } catch (error) {
    throw error;
  }
};

export const updateBookingStatus = async (
  bookingId: string, 
  status: 'approved' | 'rejected', 
  rejectionReason?: string,
  approvedBy?: string
): Promise<void> => {
  try {
    const docRef = doc(db, 'bookings', bookingId);
    const updateData: any = {
      status,
      updated_at: Timestamp.now()
    };
    
    if (status === 'approved') {
      updateData.approved_by = approvedBy || 'admin';
      updateData.approved_at = Timestamp.now();
    } else if (status === 'rejected' && rejectionReason) {
      updateData.rejection_reason = rejectionReason;
    }
    
    await updateDoc(docRef, updateData);
  } catch (error) {
    throw error;
  }
};

export const getPublicEvents = async (): Promise<EventBooking[]> => {
  try {
    const q = query(
      bookingsCollection,
      where('status', '==', 'approved'),
      where('is_public', '==', true),
      orderBy('event_date', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as EventBooking));
  } catch (error) {
    throw error;
  }
};

export const checkVenueAvailability = async (
  venueId: string,
  eventDate: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): Promise<boolean> => {
  try {
    let q = query(
      bookingsCollection,
      where('venue_id', '==', venueId),
      where('event_date', '==', eventDate),
      where('status', '!=', 'rejected')
    );
    
    const querySnapshot = await getDocs(q);
    
    // Check for time conflicts
    for (const doc of querySnapshot.docs) {
      const booking = doc.data() as EventBooking;
      
      // Skip the booking being updated
      if (excludeBookingId && doc.id === excludeBookingId) {
        continue;
      }
      
      // Check for time overlap
      if (isTimeOverlap(startTime, endTime, booking.start_time, booking.end_time)) {
        return false; // Venue is not available
      }
    }
    
    return true; // Venue is available
  } catch (error) {
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
  
  return start1Time < end2Time && end1Time > start2Time;
};
