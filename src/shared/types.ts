import z from "zod";

// Venue schema
export const VenueSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  capacity: z.number().nullable(),
  location: z.string().nullable(),
  amenities: z.string().nullable(), // JSON string
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Venue = z.infer<typeof VenueSchema>;

// Event booking schema
export const EventBookingSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  company_name: z.string(),
  contact_name: z.string(),
  contact_phone: z.string(),
  contact_email: z.string(),
  venue_id: z.number(),
  event_date: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  event_title: z.string(),
  event_description: z.string().nullable(),
  is_public: z.boolean(),
  is_free: z.boolean(),
  requires_registration: z.boolean(),
  expected_attendees: z.number().nullable(),
  contract_info: z.string().nullable(), // JSON string
  status: z.enum(['pending', 'approved', 'rejected']),
  rejection_reason: z.string().nullable(),
  approved_by: z.string().nullable(),
  approved_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type EventBooking = z.infer<typeof EventBookingSchema>;

// Create event booking schema for form validation
export const CreateEventBookingSchema = z.object({
  company_name: z.string().min(1, "Nome da empresa é obrigatório"),
  contact_name: z.string().min(1, "Nome do contato é obrigatório"),
  contact_phone: z.string().min(1, "Telefone é obrigatório"),
  contact_email: z.string().email("Email inválido"),
  venue_id: z.number().min(1, "Selecione um local"),
  event_date: z.string().min(1, "Data do evento é obrigatória"),
  start_time: z.string().min(1, "Horário de início é obrigatório"),
  end_time: z.string().min(1, "Horário de término é obrigatório"),
  event_title: z.string().min(1, "Título do evento é obrigatório"),
  event_description: z.string().optional(),
  is_public: z.boolean(),
  is_free: z.boolean(),
  requires_registration: z.boolean(),
  expected_attendees: z.number().optional(),
  contract_info: z.string().optional(),
});

export type CreateEventBooking = z.infer<typeof CreateEventBookingSchema>;

// Admin user schema
export const AdminUserSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  role: z.string(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type AdminUser = z.infer<typeof AdminUserSchema>;

// API response schemas
export const EventBookingWithVenueSchema = EventBookingSchema.extend({
  venue: VenueSchema,
});

export type EventBookingWithVenue = z.infer<typeof EventBookingWithVenueSchema>;

// Approval/rejection schema
export const BookingActionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  rejection_reason: z.string().optional(),
});

export type BookingAction = z.infer<typeof BookingActionSchema>;
