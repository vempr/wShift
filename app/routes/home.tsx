import Calendar from '~/home/calendar';
import type { Route } from './+types/home';
import Nav from '~/components/nav';
import { createSupabaseServerClient } from '~/utils/supabase.server.ts';
import { useLoaderData } from 'react-router';
import { shiftStorage } from '~/utils/shiftStorage';
import { templateStorage } from '~/utils/templateStorage';
import { useEffect } from 'react';

export function meta({}: Route.MetaArgs) {
	return [
		{ title: 'wShift' },
		{
			name: 'description',
			content:
				'Document your work shifts as a flexible employee with wShift, a simple and convenient web application that runs offline and synchronizes between devices.',
		},
	];
}

export async function loader({ request }: Route.LoaderArgs) {
	const { supabaseClient } = createSupabaseServerClient(
		request,
		request.headers,
	);

	const {
		data: { user },
	} = await supabaseClient.auth.getUser();

	if (!user) return null;

	const { data: shiftsData, error: shiftsError } = await supabaseClient
		.from('shifts')
		.select('shifts')
		.eq('user_id', user.id)
		.single();

	if (shiftsError) {
		if (shiftsError.code !== 'PGRST116')
			console.error('Error loading shifts from Supabase:', shiftsError);
	}

	if (!shiftsError && shiftsData.shifts) {
		try {
			JSON.parse(shiftsData.shifts);
		} catch (err) {
			console.error('Error parsing shifts from Supabase:', err);
		}
	}

	const { data: templatesData, error: templatesError } = await supabaseClient
		.from('templates')
		.select('templates')
		.eq('user_id', user.id)
		.single();

	if (templatesError) {
		if (templatesError.code !== 'PGRST116')
			console.error('Error loading templates from Supabase:', templatesError);
	}

	if (!templatesError && templatesData.templates) {
		try {
			JSON.parse(templatesData.templates);
		} catch (err) {
			console.error('Error parsing templates from Supabase:', err);
		}
	}

	return {
		user,
		shiftsData,
		templatesData,
	};
}

export default function Home() {
	const data = useLoaderData<typeof loader>();

	useEffect(() => {
		shiftStorage.set_all_shifts(data?.shiftsData?.shifts);
		templateStorage.set_all_templates(data?.templatesData?.templates);
	}, [data?.shiftsData, data?.templatesData]);

	return (
		<div className="h-full flex flex-col">
			<Nav
				loggedIn={data?.user ? true : false}
				email={data?.user?.email}
			/>
			<Calendar />
		</div>
	);
}
