-- Users Table (Base table for all roles)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('patient', 'doctor', 'nurse', 'driver', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients Table
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  age INTEGER,
  blood_group VARCHAR(10),
  genotype VARCHAR(10),
  height DECIMAL(5,2),
  weight DECIMAL(5,2),
  allergies TEXT,
  phone VARCHAR(20)
);

-- Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  specialty VARCHAR(100) NOT NULL,
  hospital VARCHAR(255),
  experience_years INTEGER,
  license_number VARCHAR(100) UNIQUE NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE
);

-- Nurses Table
CREATE TABLE IF NOT EXISTS nurses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  registration_number VARCHAR(100) UNIQUE NOT NULL,
  facility VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE
);

-- Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  driver_id VARCHAR(100) UNIQUE NOT NULL,
  plate_number VARCHAR(50) NOT NULL,
  is_online BOOLEAN DEFAULT FALSE,
  current_location VARCHAR(255)
);
