-- NFL Quiz Central — Phase 1 schema: user system only.
-- Later phases extend this file; migrations are previewed before applying.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('player', 'teacher', 'admin');
CREATE TYPE verification_state AS ENUM ('unverified', 'pending_approval', 'verified', 'rejected');

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role DEFAULT 'player',
    requested_role user_role DEFAULT NULL,
    verification_status verification_state DEFAULT 'unverified',
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. EDUCATOR KEYS (registration-time teacher verification)
CREATE TABLE IF NOT EXISTS educator_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_code VARCHAR(32) UNIQUE NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    max_uses INT DEFAULT 50,
    times_used INT DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
