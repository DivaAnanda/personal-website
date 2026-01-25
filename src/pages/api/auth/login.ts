import type { APIRoute } from 'astro';
import { getAdminByEmail, verifyPassword, createSession } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, redirect, cookies }) => {
    try {
        const formData = await request.formData();
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        
        if (!email || !password) {
            return redirect('/admin/login?error=invalid');
        }
        
        // Find user
        const user: any = getAdminByEmail(email);
        if (!user) {
            return redirect('/admin/login?error=invalid');
        }
        
        // Verify password
        const isValid = verifyPassword(password, user.password_hash);
        if (!isValid) {
            return redirect('/admin/login?error=invalid');
        }
        
        // Create session
        const sessionId = createSession(user.id);
        
        // Set cookie
        cookies.set('admin_session', sessionId, {
            path: '/',
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });
        
        return redirect('/admin');
    } catch (error) {
        console.error('Login error:', error);
        return redirect('/admin/login?error=server');
    }
};
