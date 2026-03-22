import { createSupabaseServerClient } from '~/utils/supabase.server';
import type { Route } from './+types/api-sync';

export async function action({ request }: Route.ActionArgs) {
	const { supabaseClient } = createSupabaseServerClient(
		request,
		request.headers,
	);

	const {
		data: { user },
	} = await supabaseClient.auth.getUser();

	if (!user) return Response.json({ error: 'Unauthorized' });

	const formData = await request.formData();
	const type = formData.get('type');
	const data = formData.get('data');

	if (!type || !data) {
		return Response.json({ error: 'Missing data' });
	}

	try {
		if (type === 'shifts') {
			const { error } = await supabaseClient.from('shifts').upsert(
				{
					user_id: user.id,
					shifts: data as string,
				},
				{
					onConflict: 'user_id',
				},
			);
			if (error) throw error;
		} else if (type === 'templates') {
			const { error } = await supabaseClient.from('templates').upsert(
				{
					user_id: user.id,
					templates: data as string,
				},
				{
					onConflict: 'user_id',
				},
			);
			if (error) throw error;
		}

		return Response.json({ success: true });
	} catch (err) {
		console.error('Sync error:', err);
		return Response.json({ error: 'Sync failed' });
	}
}
