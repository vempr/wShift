import { redirect } from 'react-router';
import type { Route } from './+types/auth';
import { createSupabaseServerClient } from '~/utils/supabase.server.ts';

export async function loader({ request }: Route.LoaderArgs) {
	const requestURL = new URL(request.url);
	const token_hash = requestURL.searchParams.get('token_hash');

	if (!token_hash) {
		throw redirect('/auth');
	}

	const { supabaseClient, headers } = createSupabaseServerClient(
		request,
		request.headers,
	);

	const { data, error } = await supabaseClient.auth.verifyOtp({
		token_hash,
		type: 'email',
	});

	if (error || !data.session || !data.user) {
		console.error('OTP verification error:', error);
		throw redirect('/auth', { headers: new Headers() });
	}

	return redirect('/', { headers });
}
