-- Seed admin user
-- Password: thetaskmaster17 (hashed with bcrypt)
INSERT INTO users (email, password_hash, role) 
VALUES ('mal4crypt404@gmail.com', '$2a$10$Shp3hZgE20lNcGjv2V6u..weDUEqNQDQ5etD7J7VqcgWZ76sqP6uu', 'admin')
ON CONFLICT (email) DO UPDATE 
SET password_hash = '$2a$10$Shp3hZgE20lNcGjv2V6u..weDUEqNQDQ5etD7J7VqcgWZ76sqP6uu';

-- Create admin profile
INSERT INTO admins (user_id, full_name, permissions)
SELECT id, 'System Administrator', ARRAY['view_users', 'manage_verification', 'view_stats', 'manage_system']
FROM users WHERE email = 'mal4crypt404@gmail.com'
ON CONFLICT DO NOTHING;

-- Second admin user
-- Password: Admin@123 (hashed with bcrypt)
INSERT INTO users (email, password_hash, role) 
VALUES ('nelsonshinaayomi209@gmail.com', '$2a$10$YQfE6jZvJ0qZxC3vBY8qFe8xH6HrP9K5L3wMNp7Q1rX8t9C0x2vVW', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Create second admin profile
INSERT INTO admins (user_id, full_name, permissions)
SELECT id, 'Nelson Administrator', ARRAY['view_users', 'manage_verification', 'view_stats', 'manage_system']
FROM users WHERE email = 'nelsonshinaayomi209@gmail.com'
ON CONFLICT DO NOTHING;

-- Seed sample pharmacies
INSERT INTO pharmacies (name, address, phone, email, operating_hours, latitude, longitude) VALUES
('HealthPlus Pharmacy', '123 Main Street, Lagos', '+234-801-234-5678', 'contact@healthplus.com', 'Mon-Sat: 8AM-8PM', 6.5244, 3.3792),
('MediCare Pharmacy', '45 Allen Avenue, Ikeja', '+234-802-345-6789', 'info@medicare.com', 'Mon-Sun: 24/7', 6.6018, 3.3515),
('Wellness Pharmacy', '78 Victoria Island, Lagos', '+234-803-456-7890', 'support@wellness.com', 'Mon-Fri: 9AM-6PM', 6.4281, 3.4219)
ON CONFLICT DO NOTHING;
