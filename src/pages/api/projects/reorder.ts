import type { APIRoute } from 'astro';
import { validateRequest } from '../../../lib/auth';
import { db } from '../../../lib/db';

export const POST: APIRoute = async ({ request }) => {
    try {
        // Auth check
        const { isAuthenticated } = await validateRequest(request);
        if (!isAuthenticated) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const body = await request.json();
        const { items } = body; // Array of { id: number, sort_order: number, featured: boolean }
        
        if (!Array.isArray(items)) {
            return new Response(JSON.stringify({ error: 'Invalid items array' }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Update each project's sort_order and featured status
        for (const item of items) {
            await db.execute({
                sql: 'UPDATE projects SET sort_order = ?, featured = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                args: [item.sort_order, item.featured ? 1 : 0, item.id]
            });
        }
        
        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error('Reorder error:', error);
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
