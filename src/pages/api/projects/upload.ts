import type { APIRoute } from 'astro';
import { handleUpload } from '@vercel/blob/client';
import { validateRequest } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const token = import.meta.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
        console.log('--- Blob Token Debug ---');
        console.log('Token Length:', token ? token.length : 0);
        console.log('Token Type:', typeof token);
        console.log('Token Starts With:', token ? token.substring(0, 8) : 'undefined');
        console.log('------------------------');
        
        const jsonResponse = await handleUpload({
            body,
            request,
            token,
            onBeforeGenerateToken: async (pathname, clientPayload) => {
                // Check authorization
                const { isAuthenticated } = await validateRequest(request);
                if (!isAuthenticated) {
                    throw new Error('Unauthorized');
                }
                
                return {
                    allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
                    addRandomSuffix: true,
                    tokenPayload: JSON.stringify({
                        // optional client payload
                    }),
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                console.log('Blob upload completed:', blob);
            },
        });
        
        return new Response(JSON.stringify(jsonResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error('Blob upload signature error:', error);
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
