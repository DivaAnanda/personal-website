import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from './db';

// Session duration: 7 days
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

// ============================================
// Admin User Functions
// ============================================

export function getAdminByEmail(email: string) {
    const stmt = db.prepare('SELECT * FROM admin_users WHERE email = ?');
    return stmt.get(email);
}

export function createAdminUser(email: string, password: string) {
    const passwordHash = bcrypt.hashSync(password, 10);
    const stmt = db.prepare('INSERT INTO admin_users (email, password_hash) VALUES (?, ?)');
    return stmt.run(email, passwordHash);
}

export function verifyPassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
}

// ============================================
// Session Functions
// ============================================

export function createSession(userId: number): string {
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
    
    const stmt = db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)');
    stmt.run(sessionId, userId, expiresAt);
    
    return sessionId;
}

export function getSession(sessionId: string) {
    const stmt = db.prepare(`
        SELECT s.*, u.email as user_email 
        FROM sessions s 
        JOIN admin_users u ON s.user_id = u.id 
        WHERE s.id = ?
    `);
    return stmt.get(sessionId);
}

export function deleteSession(sessionId: string) {
    const stmt = db.prepare('DELETE FROM sessions WHERE id = ?');
    return stmt.run(sessionId);
}

export function cleanExpiredSessions() {
    const stmt = db.prepare('DELETE FROM sessions WHERE expires_at < datetime("now")');
    return stmt.run();
}

export function isSessionValid(sessionId: string): boolean {
    const session: any = getSession(sessionId);
    if (!session) return false;
    
    const expiresAt = new Date(session.expires_at);
    return expiresAt > new Date();
}

// ============================================
// Auth Middleware Helper
// ============================================

export function getSessionFromCookie(cookieHeader: string | null): string | null {
    if (!cookieHeader) return null;
    
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {} as Record<string, string>);
    
    return cookies['admin_session'] || null;
}

export function validateRequest(request: Request): { isAuthenticated: boolean; userId?: number } {
    const cookieHeader = request.headers.get('cookie');
    const sessionId = getSessionFromCookie(cookieHeader);
    
    if (!sessionId) {
        return { isAuthenticated: false };
    }
    
    const session: any = getSession(sessionId);
    if (!session || !isSessionValid(sessionId)) {
        return { isAuthenticated: false };
    }
    
    return { isAuthenticated: true, userId: session.user_id };
}

// ============================================
// Initialize Default Admin (if none exists)
// ============================================

export function ensureAdminExists() {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM admin_users');
    const result: any = stmt.get();
    
    if (result.count === 0) {
        // Create default admin - CHANGE THESE CREDENTIALS!
        createAdminUser('admin@divaananda.com', 'Narxene2004');
        console.log('Default admin created: admin@divaananda.com');
    }
}

// Run on import
ensureAdminExists();
