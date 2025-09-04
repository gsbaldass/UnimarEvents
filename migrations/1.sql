
-- Venues table (halls/blocks available for booking)
CREATE TABLE venues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  capacity INTEGER,
  location TEXT,
  amenities TEXT, -- JSON string of available amenities
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Event bookings table
CREATE TABLE event_bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL, -- From Mocha auth system
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  venue_id INTEGER NOT NULL,
  event_date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  event_title TEXT NOT NULL,
  event_description TEXT,
  is_public BOOLEAN DEFAULT 0,
  is_free BOOLEAN DEFAULT 1,
  requires_registration BOOLEAN DEFAULT 0,
  expected_attendees INTEGER,
  contract_info TEXT, -- Additional contract fields as JSON
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  rejection_reason TEXT,
  approved_by TEXT, -- user_id of admin who approved
  approved_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Admin users table (to track who can approve events)
CREATE TABLE admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE, -- From Mocha auth system
  role TEXT DEFAULT 'admin', -- admin, super_admin
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_event_bookings_user_id ON event_bookings(user_id);
CREATE INDEX idx_event_bookings_venue_id ON event_bookings(venue_id);
CREATE INDEX idx_event_bookings_date ON event_bookings(event_date);
CREATE INDEX idx_event_bookings_status ON event_bookings(status);
CREATE INDEX idx_admin_users_user_id ON admin_users(user_id);
