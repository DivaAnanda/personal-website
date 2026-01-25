import type { APIRoute } from 'astro';
import { deleteSession, getSessionFromCookie } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, redirect, cookies }) => {
    try {
        const cookieHeader = request.headers.get('cookie');
        const sessionId = getSessionFromCookie(cookieHeader);
        
        if (sessionId) {
            await deleteSession(sessionId);
        }
        
        // Clear cookie
        cookies.delete('admin_session', { path: '/' });
        
        return redirect('/admin/login');
    } catch (error) {
        console.error('Logout error:', error);
        return redirect('/admin/login');
    }
};
