-- QA-ONLY SEED. Never execute against production.
-- Throwaway credentials for the Replit QA workspace. Passwords are bcrypt hashes.
-- (QA test admin: admin-qa / QuizAdmin!2026)
INSERT INTO users (username, email, password_hash, role, verification_status, verified_at)
VALUES ('admin-qa', 'admin-qa@nflquizcentral.local',
        '$2b$10$Kix8YxOA7B1f0kGyBBPP3uJQbTfYaECkaGqSBbT8rP9k3nVgSC.', 'admin', 'verified', NOW())
ON CONFLICT (email) DO NOTHING;

-- QA educator key for testing teacher registration: TEACH-QA-2026
INSERT INTO educator_keys (key_code, created_by)
SELECT 'TEACH-QA-2026', id FROM users WHERE role = 'admin' LIMIT 1
ON CONFLICT (key_code) DO NOTHING;
