PRAGMA foreign_keys = ON;

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT,
  role TEXT,    -- ADMIN / DRIVER
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- VEHICLES
CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_no TEXT UNIQUE,
  model TEXT,
  type TEXT,
  driver_id INTEGER,
  status TEXT, -- Active / Repair / Offline
  lat REAL,
  lng REAL,
  health_status TEXT,
  FOREIGN KEY (driver_id) REFERENCES users(id)
);

-- VEHICLE HEALTH LOGS
CREATE TABLE IF NOT EXISTS vehicle_health_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id INTEGER,
  engine_temp REAL,
  battery_level REAL,
  tire_pressure REAL,
  health_score REAL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- MAINTENANCE LOGS
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id INTEGER,
  issue TEXT,
  severity TEXT,
  recommended_action TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT,
  pickup_lat REAL,
  pickup_lng REAL,
  drop_lat REAL,
  drop_lng REAL,
  driver_id INTEGER,
  vehicle_id INTEGER,
  status TEXT,     -- Scheduled / Completed / Cancelled
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES users(id),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- RIDE REQUESTS
CREATE TABLE IF NOT EXISTS ride_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  pickup_location TEXT NOT NULL,
  drop_location TEXT NOT NULL,
  pickup_lat REAL NOT NULL,
  pickup_lng REAL NOT NULL,
  drop_lat REAL NOT NULL,
  drop_lng REAL NOT NULL,
  distance_km REAL DEFAULT NULL,
  duration_min REAL DEFAULT NULL,
  route_polyline TEXT DEFAULT NULL,
  fare INTEGER DEFAULT NULL,
  status TEXT DEFAULT 'pending', -- pending / accepted / completed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- DRIVERS (note: this table may overlap conceptually with users+role=DRIVER, but it exists in seed.sql)
CREATE TABLE IF NOT EXISTS drivers (
  driver_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  license_number TEXT UNIQUE NOT NULL,
  vehicle_number TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  is_available INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional: index helpers (safe no-ops if not needed)
CREATE INDEX IF NOT EXISTS idx_vehicles_driver_id ON vehicles(driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_health_logs_vehicle_id ON vehicle_health_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_vehicle_id ON maintenance_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_bookings_driver_id ON bookings(driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_id ON bookings(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_ride_requests_user_id ON ride_requests(user_id);
