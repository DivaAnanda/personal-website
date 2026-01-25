// Script to update admin password without deleting database
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../db/website.db');
const db = new Database(dbPath);

const NEW_PASSWORD = 'Narxene2004';
const ADMIN_EMAIL = 'admin@divaananda.com';

const passwordHash = bcrypt.hashSync(NEW_PASSWORD, 10);

// Update existing admin password
const updateStmt = db.prepare('UPDATE admin_users SET password_hash = ? WHERE email = ?');
const result = updateStmt.run(passwordHash, ADMIN_EMAIL);

if (result.changes > 0) {
    console.log('✅ Password updated successfully for:', ADMIN_EMAIL);
} else {
    // If no admin exists, create one
    const insertStmt = db.prepare('INSERT INTO admin_users (email, password_hash) VALUES (?, ?)');
    insertStmt.run(ADMIN_EMAIL, passwordHash);
    console.log('✅ Admin user created:', ADMIN_EMAIL);
}

// Clear all sessions to force re-login
const clearSessions = db.prepare('DELETE FROM sessions');
clearSessions.run();
console.log('✅ All sessions cleared - admin must re-login');

db.close();
console.log('Done!');
