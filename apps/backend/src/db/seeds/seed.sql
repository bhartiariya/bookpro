-- Run this after schema.sql to get dev data
-- Passwords are all: "password123" (bcrypt hash below)

INSERT INTO users (id, name, email, password_hash, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Admin User',    'admin@bookpro.dev',    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lex9oGk7P5sHbHlAu', 'admin'),
  ('22222222-2222-2222-2222-222222222222', 'Priya Sharma',  'priya@bookpro.dev',    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lex9oGk7P5sHbHlAu', 'provider'),
  ('33333333-3333-3333-3333-333333333333', 'Rahul Verma',   'rahul@bookpro.dev',    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lex9oGk7P5sHbHlAu', 'customer');

INSERT INTO services (id, provider_id, title, description, price, duration_mins, category) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222',
   'Yoga Session', 'One-on-one yoga for all levels', 800.00, 60, 'Fitness'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222',
   'Meditation Class', 'Guided mindfulness meditation', 500.00, 45, 'Wellness');
