-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: users
-- Central identity table. All roles live here.
-- ============================================================
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(100) NOT NULL,
  email           VARCHAR(255) NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  role            VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'provider', 'customer')),
  is_blocked      BOOLEAN NOT NULL DEFAULT false,
  is_deleted      BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes: most queries filter by email (login) or role (admin filters)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);

-- ============================================================
-- TABLE: services
-- A provider's offered service (e.g. "Haircut", "Yoga Session")
-- ============================================================
CREATE TABLE services (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           VARCHAR(200) NOT NULL,
  description     TEXT,
  price           NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  duration_mins   INTEGER NOT NULL CHECK (duration_mins > 0),
  category        VARCHAR(100),
  is_active       BOOLEAN NOT NULL DEFAULT true,
  is_deleted      BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Providers look up their own services constantly
CREATE INDEX idx_services_provider_id ON services(provider_id);
-- Customers browse active services
CREATE INDEX idx_services_is_active    ON services(is_active) WHERE is_deleted = false;

-- ============================================================
-- TABLE: slots
-- A provider's availability window tied to a service.
-- One slot = one bookable time block.
-- ============================================================
CREATE TABLE slots (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id      UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  start_time      TIMESTAMPTZ NOT NULL,
  end_time        TIMESTAMPTZ NOT NULL,
  is_booked       BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- A provider cannot have two slots starting at the same time
  CONSTRAINT uq_slot_provider_start UNIQUE (provider_id, start_time),

  -- end must be after start — enforced at DB level
  CONSTRAINT chk_slot_times CHECK (end_time > start_time)
);

CREATE INDEX idx_slots_provider_id ON slots(provider_id);
CREATE INDEX idx_slots_service_id  ON slots(service_id);
-- Fast lookup of available slots
CREATE INDEX idx_slots_available   ON slots(provider_id, is_booked) WHERE is_booked = false;

-- ============================================================
-- TABLE: bookings
-- The core transaction. Customer claims a slot for a service.
-- ============================================================
CREATE TABLE bookings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id      UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  slot_id         UUID NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','confirmed','rejected','cancelled','completed')),
  notes           TEXT,                      -- customer's optional message
  cancelled_by    VARCHAR(20),               -- 'customer' | 'provider'
  cancel_reason   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_customer_id  ON bookings(customer_id);
CREATE INDEX idx_bookings_provider_id  ON bookings(provider_id);
CREATE INDEX idx_bookings_slot_id      ON bookings(slot_id);
CREATE INDEX idx_bookings_status       ON bookings(status);

-- ============================================================
-- TABLE: notifications
-- Auto-generated on booking events. Never manually created.
-- ============================================================
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id      UUID REFERENCES bookings(id) ON DELETE SET NULL,
  type            VARCHAR(50) NOT NULL,
                  -- 'booking_created' | 'booking_confirmed' | 'booking_rejected'
                  -- 'booking_cancelled' | 'booking_completed' | 'review_received'
  message         TEXT NOT NULL,
  is_read         BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id   ON notifications(user_id);
-- Fast unread count badge query
CREATE INDEX idx_notifications_unread    ON notifications(user_id, is_read) WHERE is_read = false;

-- ============================================================
-- TABLE: reviews
-- Only for completed bookings. One per booking — enforced by UNIQUE.
-- ============================================================
CREATE TABLE reviews (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id      UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id      UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_provider_id ON reviews(provider_id);
CREATE INDEX idx_reviews_service_id  ON reviews(service_id);

-- ============================================================
-- TABLE: audit_logs
-- Append-only. Every mutating API action writes a row here.
-- Never updated, never deleted.
-- ============================================================
CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  action          VARCHAR(100) NOT NULL,  -- 'CREATE_BOOKING', 'CANCEL_BOOKING', etc.
  entity          VARCHAR(50) NOT NULL,   -- 'bookings', 'services', 'slots', etc.
  entity_id       UUID,
  meta            JSONB,                  -- any extra context (old values, request IP, etc.)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id   ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity    ON audit_logs(entity, entity_id);
CREATE INDEX idx_audit_logs_created   ON audit_logs(created_at DESC);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- Applies to tables that have an updated_at column
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
