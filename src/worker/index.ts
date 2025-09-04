import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { setCookie, getCookie } from "hono/cookie";
import {
  CreateEventBookingSchema,
  BookingActionSchema,
} from "@/shared/types";

const app = new Hono();

// Enable CORS
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

// Mock data for venues (temporary until we implement proper Firestore integration)
const mockVenues = [
  {
    id: "pjNEtNbyKymvvUZqCwxF",
    name: "Auditório Principal",
    location: "Bloco A - 1º Andar",
    capacity: 200,
    is_active: true,
    description: "Auditório principal da UNIMAR com sistema de som e projeção completo",
    amenities: ["Sistema de som", "Projeção", "Ar condicionado", "Palco", "Microfones"]
  },
  {
    id: "ZOdtBrNgZ1uWZeLe6Ly2",
    name: "Sala de Conferências",
    location: "Bloco B - 2º Andar",
    capacity: 50,
    is_active: true,
    description: "Sala de conferências equipada para reuniões e apresentações",
    amenities: ["TV 55\"", "Sistema de som", "Ar condicionado", "Mesa de reunião"]
  },
  {
    id: "u4bhhzpunh5h8OEjH4q6",
    name: "Anfiteatro",
    location: "Bloco C - Térreo",
    capacity: 150,
    is_active: true,
    description: "Anfiteatro com arquibancadas e palco para eventos maiores",
    amenities: ["Palco", "Arquibancadas", "Sistema de som", "Iluminação cênica", "Ar condicionado"]
  },
  {
    id: "Q75TiEWyuzNbDs7mXtjZ",
    name: "Laboratório de Informática",
    location: "Bloco D - 3º Andar",
    capacity: 30,
    is_active: true,
    description: "Laboratório com computadores para workshops e treinamentos",
    amenities: ["30 computadores", "Projetor", "Ar condicionado", "Internet"]
  },
  {
    id: "ZAwuLDy7bS4dHB7rwdkQ",
    name: "Sala de Eventos",
    location: "Bloco E - 1º Andar",
    capacity: 80,
    is_active: true,
    description: "Sala versátil para eventos corporativos e sociais",
    amenities: ["Sistema de som", "Projeção", "Ar condicionado", "Espaço para coffee break"]
  }
];

// Mock bookings storage (in production, this would be Firestore)
let mockBookings: any[] = [];

// Firebase Auth middleware (simplified for now)
const firebaseAuthMiddleware = async (_c: any, next: any) => {
  // For now, just allow all requests
  // In production, implement proper Firebase token verification
  await next();
};

// Auth endpoints
app.get("/api/users/me", firebaseAuthMiddleware, async (c) => {
  return c.json({ id: "mock-user", email: "user@example.com" });
});

app.get('/api/logout', async (c) => {
  // Firebase handles logout on the client side
  return c.json({ success: true }, 200);
});

// Admin login endpoint
app.post('/api/admin/login', async (c) => {
  const body = await c.req.json();
  const { cpf, password } = body;

  // Validate credentials
  if (password !== "loG#123") {
    return c.json({ error: "Credenciais inválidas" }, 401);
  }

  // Validate CPF format (basic validation)
  if (!cpf || cpf.length !== 11 || !/^\d{11}$/.test(cpf)) {
    return c.json({ error: "CPF inválido" }, 400);
  }

  // Create admin session
  setCookie(c, 'admin_session', 'authenticated', {
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true,
    maxAge: 60 * 60 * 8, // 8 hours
  });

  return c.json({ success: true }, 200);
});

// Admin logout
app.post('/api/admin/logout', async (c) => {
  setCookie(c, 'admin_session', '', {
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// Venues endpoints
app.get('/api/venues', async (c) => {
  try {
    return c.json(mockVenues);
  } catch (error) {
    return c.json({ error: 'Erro ao buscar locais' }, 500);
  }
});

// Event booking endpoints
app.post('/api/bookings', firebaseAuthMiddleware, zValidator('json', CreateEventBookingSchema), async (c) => {
  try {
    const data = c.req.valid('json');
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Token de autorização não fornecido' }, 401);
    }

    // For now, use a mock user ID. In production, properly decode the JWT token
    const userId = 'firebase-user-id';

    // Check venue availability (simplified)
    const existingBooking = mockBookings.find(booking => 
      booking.venue_id === data.venue_id.toString() &&
      booking.event_date === data.event_date &&
      booking.status !== 'rejected' &&
      isTimeOverlap(
        data.start_time, data.end_time,
        booking.start_time, booking.end_time
      )
    );

    if (existingBooking) {
      return c.json({ error: "Local não disponível no horário solicitado" }, 400);
    }

    // Create booking
    const bookingData = {
      id: `booking_${Date.now()}`,
      user_id: userId,
      company_name: data.company_name,
      contact_name: data.contact_name,
      contact_phone: data.contact_phone,
      contact_email: data.contact_email,
      venue_id: data.venue_id.toString(),
      event_date: data.event_date,
      start_time: data.start_time,
      end_time: data.end_time,
      event_title: data.event_title,
      event_description: data.event_description || '',
      is_public: data.is_public,
      is_free: data.is_free,
      requires_registration: data.requires_registration,
      expected_attendees: data.expected_attendees,
      contract_info: data.contract_info || '',
      status: 'pending' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockBookings.push(bookingData);
    
    return c.json({ id: bookingData.id, message: "Agendamento criado com sucesso" }, 201);
  } catch (error) {
    return c.json({ error: 'Erro ao criar agendamento' }, 500);
  }
});

app.get('/api/bookings/my', firebaseAuthMiddleware, async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Token de autorização não fornecido' }, 401);
    }

    // For now, use a mock user ID. In production, properly decode the JWT token
    const userId = 'firebase-user-id';
    
    const userBookings = mockBookings.filter(booking => booking.user_id === userId);
    
    // Get venue information for each booking
    const bookingsWithVenues = userBookings.map(booking => {
      const venue = mockVenues.find(v => v.id === booking.venue_id);
      return {
        ...booking,
        venue_name: venue?.name || 'Local não encontrado',
        venue_location: venue?.location || 'Localização não disponível'
      };
    });

    return c.json(bookingsWithVenues);
  } catch (error) {
    return c.json({ error: 'Erro ao buscar agendamentos' }, 500);
  }
});

// Check if user is admin
const adminMiddleware = async (c: any, next: any) => {
  const adminSession = getCookie(c, 'admin_session');
  
  if (adminSession !== 'authenticated') {
    return c.json({ error: "Acesso negado" }, 403);
  }

  await next();
};

// Check admin session status
app.get('/api/admin/status', async (c) => {
  const adminSession = getCookie(c, 'admin_session');
  return c.json({ isAuthenticated: adminSession === 'authenticated' });
});

// Admin endpoints
app.get('/api/admin/bookings', adminMiddleware, async (c) => {
  try {
    // Get venue information for each booking
    const bookingsWithVenues = mockBookings.map(booking => {
      const venue = mockVenues.find(v => v.id === booking.venue_id);
      return {
        ...booking,
        venue_name: venue?.name || 'Local não encontrado',
        venue_location: venue?.location || 'Localização não disponível'
      };
    });

    return c.json(bookingsWithVenues);
  } catch (error) {
    return c.json({ error: 'Erro ao buscar agendamentos' }, 500);
  }
});

app.post('/api/admin/bookings/:id/action', adminMiddleware, zValidator('json', BookingActionSchema), async (c) => {
  try {
    const bookingId = c.req.param('id');
    const data = c.req.valid('json');

    const bookingIndex = mockBookings.findIndex(booking => booking.id === bookingId);
    if (bookingIndex === -1) {
      return c.json({ error: 'Agendamento não encontrado' }, 404);
    }

    const newStatus = data.action === 'approve' ? 'approved' : 'rejected';
    mockBookings[bookingIndex] = {
      ...mockBookings[bookingIndex],
      status: newStatus,
      rejection_reason: data.action === 'reject' ? data.rejection_reason : undefined,
      approved_by: data.action === 'approve' ? 'admin' : undefined,
      approved_at: data.action === 'approve' ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString()
    };

    return c.json({ message: `Agendamento ${data.action === 'approve' ? 'aprovado' : 'rejeitado'} com sucesso` });
  } catch (error) {
    return c.json({ error: 'Erro ao atualizar status do agendamento' }, 500);
  }
});

// Public events endpoint
app.get('/api/events/public', async (c) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const publicEvents = mockBookings.filter(booking => 
      booking.status === 'approved' && 
      booking.is_public && 
      booking.event_date >= today
    );
    
    // Get venue information for each event
    const eventsWithVenues = publicEvents.map(event => {
      const venue = mockVenues.find(v => v.id === event.venue_id);
      return {
        ...event,
        venue_name: venue?.name || 'Local não encontrado',
        venue_location: venue?.location || 'Localização não disponível'
      };
    });

    return c.json(eventsWithVenues);
  } catch (error) {
    return c.json({ error: 'Erro ao buscar eventos públicos' }, 500);
  }
});

// Helper function to check time overlap
const isTimeOverlap = (
  newStart: string, newEnd: string, 
  existingStart: string, existingEnd: string
): boolean => {
  // Convert times to a comparable format (e.g., minutes from midnight)
  const newStartMinutes = parseInt(newStart.split(':')[0]) * 60 + parseInt(newStart.split(':')[1]);
  const newEndMinutes = parseInt(newEnd.split(':')[0]) * 60 + parseInt(newEnd.split(':')[1]);
  const existingStartMinutes = parseInt(existingStart.split(':')[0]) * 60 + parseInt(existingStart.split(':')[1]);
  const existingEndMinutes = parseInt(existingEnd.split(':')[0]) * 60 + parseInt(existingEnd.split(':')[1]);

  return (newStartMinutes < existingEndMinutes && existingStartMinutes < newEndMinutes);
};

export default app;