-- LIKAS PostgreSQL Schema

CREATE TABLE districts (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE cities (
  id VARCHAR(50) PRIMARY KEY,
  district_id VARCHAR(50) REFERENCES districts(id),
  name VARCHAR(100) NOT NULL
);

CREATE TABLE barangays (
  id VARCHAR(50) PRIMARY KEY,
  city_id VARCHAR(50) REFERENCES cities(id),
  name VARCHAR(100) NOT NULL,
  population INT NOT NULL,
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL
);

CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  office_name VARCHAR(100) NOT NULL,
  city_municipality VARCHAR(100) NOT NULL,
  zone VARCHAR(20),
  region VARCHAR(50),
  office_contact VARCHAR(50) NOT NULL,
  office_reference_no VARCHAR(100) NOT NULL,
  registered_email VARCHAR(100) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'barangay' | 'admin'
  password_hash VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'Active',
  last_login TIMESTAMP
);

CREATE TABLE flood_incidents (
  id VARCHAR(50) PRIMARY KEY,
  barangay_id VARCHAR(50) REFERENCES barangays(id),
  incident_date DATE NOT NULL,
  incident_time TIME NOT NULL,
  street VARCHAR(255) NOT NULL,
  depth_inches FLOAT NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'PATV', 'NPLV', 'NPATV', 'MPATV', 'CLR'
  cause VARCHAR(100) NOT NULL,
  priority VARCHAR(20) NOT NULL, -- 'Low', 'Medium', 'High', 'Very High'
  logged_by_role VARCHAR(20) NOT NULL DEFAULT 'barangay',
  approval_status VARCHAR(20) DEFAULT 'Pending' -- 'Pending', 'Approved', 'Rejected'
);

CREATE TABLE street_vulnerabilities (
  id VARCHAR(50) PRIMARY KEY,
  barangay_id VARCHAR(50) REFERENCES barangays(id),
  street_name VARCHAR(255) NOT NULL,
  pwd INT DEFAULT 0,
  elderly INT DEFAULT 0,
  children INT DEFAULT 0,
  pregnant INT DEFAULT 0,
  last_updated DATE NOT NULL
);

CREATE TABLE street_registry (
  id VARCHAR(50) PRIMARY KEY,
  barangay_id VARCHAR(50) REFERENCES barangays(id),
  street_name VARCHAR(255) NOT NULL,
  priority_score FLOAT,
  vulnerability_score FLOAT,
  priority VARCHAR(20),
  flood_count INT,
  last_updated DATE,
  lat FLOAT,
  lng FLOAT
);