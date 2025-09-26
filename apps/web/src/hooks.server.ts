import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';
import { auth } from './lib/auth-client';

export const handle: Handle = async ({ event, resolve }) => {
	// Ask NestJS Better Auth server for the session
	const session = await auth.getSession({
		fetchOptions: {
			headers: event.request.headers // forwards cookies
		}
	});

	if (session) {
		event.locals.session = session.data?.session;
		event.locals.user = session.data?.user;
	}

	// Protect routes
	const protectedRoutes = ['/dashboard', '/profile'];
	if (
		protectedRoutes.some((route) => event.url.pathname.startsWith(route)) &&
		!event.locals.session
	) {
		throw redirect(302, '/signin');
	}

	return resolve(event);
};
