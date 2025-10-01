CREATE TABLE plants (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('tree', 'bush')),
    species TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age > 0),
    crown_diameter NUMERIC(10,2) NOT NULL CHECK (crown_diameter > 0),
    height NUMERIC(10,2) NOT NULL CHECK (height > 0),
    damages TEXT,
    health_status TEXT NOT NULL CHECK (health_status IN ('healthy', 'satisfactory', 'unsatisfactory')),
    position_lat NUMERIC(10,7) NOT NULL,
    position_lng NUMERIC(10,7) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lawns (
    id TEXT PRIMARY KEY,
    area NUMERIC(10,2) NOT NULL CHECK (area > 0),
    grass_type TEXT NOT NULL,
    health_status TEXT NOT NULL CHECK (health_status IN ('healthy', 'satisfactory', 'unsatisfactory')),
    positions JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_plants_health_status ON plants(health_status);
CREATE INDEX idx_lawns_health_status ON lawns(health_status);