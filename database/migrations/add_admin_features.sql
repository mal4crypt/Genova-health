-- Admins Table (extends users with role='admin')
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  permissions TEXT[] DEFAULT ARRAY['view_users', 'manage_verification', 'view_stats']
);

-- Pharmacies Table
CREATE TABLE IF NOT EXISTS pharmacies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  operating_hours VARCHAR(100),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
  id SERIAL PRIMARY KEY,
  doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
  medication VARCHAR(255) NOT NULL,
  dosage VARCHAR(100) NOT NULL,
  frequency VARCHAR(100) NOT NULL,
  duration VARCHAR(100) NOT NULL,
  instructions TEXT,
  diagnosis TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'dispensed', 'delivered')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat Rooms Table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL CHECK (type IN ('doctor-patient', 'nurse-patient')),
  patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
  provider_id INTEGER NOT NULL, -- references doctors(id) or nurses(id)
  provider_type VARCHAR(50) NOT NULL CHECK (provider_type IN ('doctor', 'nurse')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  room_id INTEGER REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  sender_type VARCHAR(50) NOT NULL CHECK (sender_type IN ('patient', 'doctor', 'nurse')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Delivery Orders Table
CREATE TABLE IF NOT EXISTS delivery_orders (
  id SERIAL PRIMARY KEY,
  prescription_id INTEGER REFERENCES prescriptions(id) ON DELETE CASCADE,
  patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
  driver_id INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
  pharmacy_id INTEGER REFERENCES pharmacies(id) ON DELETE SET NULL,
  delivery_address TEXT NOT NULL,
  delivery_phone VARCHAR(20),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled')),
  delivery_fee DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_at TIMESTAMP,
  picked_up_at TIMESTAMP,
  delivered_at TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_patient ON chat_rooms(patient_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_provider ON chat_rooms(provider_id, provider_type);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_patient ON delivery_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_driver ON delivery_orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_status ON delivery_orders(status);
