import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const { url, cookies } = event;
  const pathname = url.pathname;

  // Protected routes - equivalent to Next.js matcher
  const protectedRoutes = ['/dashboard', '/profile'];

  // Check if current route is protected
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    // Just check if session cookie exists (no server validation)
    const sessionCookie = cookies.get('better-auth.session_token');
    
    if (!sessionCookie) {
      // Redirect to home/login if no session cookie
      throw redirect(302, '/login');
    }
  }

  // Continue with the request
  return await resolve(event);
};