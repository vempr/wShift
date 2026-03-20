import {
	createServerClient,
	parseCookieHeader,
	serializeCookieHeader,
} from '@supabase/ssr';
import { type Database } from '~/types/database.ts';

export const createSupabaseServerClient = (
	request: Request,
	headers: Headers,
) => {
	const supabaseClient = createServerClient<Database>(
		process.env.VITE_SUPABASE_URL!,
		process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!,
		{
			cookies: {
				getAll() {
					const parsed = parseCookieHeader(request.headers.get('Cookie') ?? '');
					return parsed.map(({ name, value }) => ({
						name,
						value: value ?? '',
					}));
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value, options }) => {
						const cookieOptions = {
							...options,
							path: '/',
							httpOnly: true,
							secure: process.env.NODE_ENV === 'production',
							sameSite: 'lax' as const,
						};
						headers.append(
							'Set-Cookie',
							serializeCookieHeader(name, value, cookieOptions),
						);
					});
				},
			},
		},
	);

	return { supabaseClient, headers };
};
