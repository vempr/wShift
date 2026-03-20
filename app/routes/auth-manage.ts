import { createSupabaseServerClient } from '~/utils/supabase.server';
import type { Route } from './+types/auth';
import { redirect } from 'react-router';

export async function action({ request }: Route.ActionArgs) {
	const method = request.method;

	const { supabaseClient, headers } = createSupabaseServerClient(
		request,
		request.headers,
	);
	const {
		data: { user },
	} = await supabaseClient.auth.getUser();

	if (!user) {
		throw redirect('/', { headers: new Headers() });
	}

	if (method == 'post' || method == 'POST') {
		const { error: logoutError } = await supabaseClient.auth.signOut();

		if (logoutError) {
			return { error: logoutError.message };
		} else {
			return redirect('/', { headers });
		}
	} else if (method == 'delete' || method == 'DELETE') {
		const { error: deleteUserError } =
			await supabaseClient.auth.admin.deleteUser(user.id);

		if (deleteUserError) {
			return { error: deleteUserError.message };
		} else {
			return redirect('/', { headers });
		}
	}
}
