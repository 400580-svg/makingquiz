-- QA-ONLY SEED. Never execute against production.
-- Throwaway credentials for the Replit QA workspace.
-- The bcrypt hash is generated at seed time with pgcrypto (bcrypt-compatible,
-- verified at login by the bcrypt npm library).
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- QA test admin: admin-qa@nflquizcentral.local / QuizAdmin!2026
INSERT INTO users (username, email, password_hash, role, verification_status, verified_at)
VALUES ('admin-qa', 'admin-qa@nflquizcentral.local',
        crypt('QuizAdmin!2026', gen_salt('bf', 10)), 'admin', 'verified', NOW())
ON CONFLICT (email) DO NOTHING;

-- QA educator key for testing teacher registration: TEACH-QA-2026
INSERT INTO educator_keys (key_code, created_by)
SELECT 'TEACH-QA-2026', id FROM users WHERE role = 'admin' LIMIT 1
ON CONFLICT (key_code) DO NOTHING;
