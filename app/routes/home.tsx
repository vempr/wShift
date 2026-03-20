import Calendar from '~/calendar/calendar';
import type { Route } from './+types/home';
import Nav from '~/components/nav';
import { createSupabaseServerClient } from '~/utils/supabase.server';
import { useLoaderData } from 'react-router';

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

	return user;
}

export async function action({ request }: Route.ActionArgs) {
	console.log(await request.formData());
	return null;
}

export default function Home() {
	const user = useLoaderData<typeof loader>();

	return (
		<div className="h-full flex flex-col">
			<Nav
				loggedIn={user ? true : false}
				email={user?.email}
			/>
			<Calendar />
		</div>
	);
}
