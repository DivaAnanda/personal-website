import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db, ensureSchema } from './db';

// Session duration: 7 days
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

// ============================================
// Admin User Functions
// ============================================

export async function getAdminByEmail(email: string) {
    await ensureSchema();
    const result = await db.execute({ sql: 'SELECT * FROM admin_users WHERE email = ?', args: [email] });
    return result.rows[0] || null;
}

export async function createAdminUser(email: string, password: string) {
    await ensureSchema();
    const passwordHash = bcrypt.hashSync(password, 10);
    await db.execute({
        sql: 'INSERT INTO admin_users (email, password_hash) VALUES (?, ?)',
        args: [email, passwordHash]
    });
}

export function verifyPassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
}

// ============================================
// Session Functions
// ============================================

export async function createSession(userId: number): Promise<string> {
    await ensureSchema();
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
    
    await db.execute({
        sql: 'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
        args: [sessionId, userId, expiresAt]
    });
    
    return sessionId;
}

export async function getSession(sessionId: string) {
    await ensureSchema();
    const result = await db.execute({
        sql: `SELECT s.*, u.email as user_email 
              FROM sessions s 
              JOIN admin_users u ON s.user_id = u.id 
              WHERE s.id = ?`,
        args: [sessionId]
    });
    return result.rows[0] || null;
}

export async function deleteSession(sessionId: string) {
    await ensureSchema();
    await db.execute({ sql: 'DELETE FROM sessions WHERE id = ?', args: [sessionId] });
}

export async function cleanExpiredSessions() {
    await ensureSchema();
    await db.execute({ sql: 'DELETE FROM sessions WHERE expires_at < datetime("now")', args: [] });
}

export async function isSessionValid(sessionId: string): Promise<boolean> {
    const session: any = await getSession(sessionId);
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

export async function validateRequest(request: Request): Promise<{ isAuthenticated: boolean; userId?: number }> {
    const cookieHeader = request.headers.get('cookie');
    const sessionId = getSessionFromCookie(cookieHeader);
    
    if (!sessionId) {
        return { isAuthenticated: false };
    }
    
    const session: any = await getSession(sessionId);
    if (!session) {
        return { isAuthenticated: false };
    }
    
    const isValid = await isSessionValid(sessionId);
    if (!isValid) {
        return { isAuthenticated: false };
    }
    
    return { isAuthenticated: true, userId: session.user_id };
}

// ============================================
// Initialize Default Admin (if none exists)
// ============================================

export async function ensureAdminExists() {
    await ensureSchema();
    const result = await db.execute({ sql: 'SELECT COUNT(*) as count FROM admin_users', args: [] });
    const count = (result.rows[0] as any)?.count || 0;
    
    if (count === 0) {
        await createAdminUser('admin@divaananda.com', 'Narxene2004');
        console.log('Default admin created: admin@divaananda.com');
    }
}
