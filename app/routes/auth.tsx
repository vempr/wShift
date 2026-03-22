import type { Route } from './+types/home';
import Nav from '~/components/nav';
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '~/components/ui/field.tsx';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { createSupabaseServerClient } from '~/utils/supabase.server.ts';
import { Form, useFetcher, useLoaderData } from 'react-router';

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

const emailSchema = z.object({
	email: z.email(),
});

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
	const body = await request.formData();
	let email = body.get('email');

	try {
		z.email().parse(email);
	} catch (err) {
		return { error: 'Not a valid email!' };
	}

	email = email as string;

	const { supabaseClient } = createSupabaseServerClient(
		request,
		request.headers,
	);

	const { error } = await supabaseClient.auth.signInWithOtp({
		email,
		options: {
			shouldCreateUser: true,
			emailRedirectTo: 'http://localhost:5173/?authSuccess=true',
		},
	});

	if (error) {
		return {
			error:
				'Supabase/Gmail Error: ' + error.message + ' (Please try again later.)',
		};
	} else {
		return { success: true };
	}
}

export default function Auth() {
	const user = useLoaderData<typeof loader>();
	const fetcher = useFetcher<typeof action>();

	const form = useForm({
		resolver: zodResolver(emailSchema),
		defaultValues: {
			email: '',
		},
	});

	return (
		<div>
			<Nav
				loggedIn={user ? true : false}
				email={user?.email}
			/>

			{user ? (
				<div>
					<h1>Hello, {user.email}. You can manage your account here.</h1>

					<div className="mt-4 flex gap-x-2">
						<Form
							action="/auth/manage"
							method="post"
						>
							<Button>Log out</Button>
						</Form>

						<Form
							action="/auth/manage"
							method="delete"
						>
							<Button>Delete account</Button>
						</Form>
					</div>
				</div>
			) : (
				<>
					<fetcher.Form
						method="post"
						className="flex flex-col justify-content gap-y-1"
					>
						<FieldGroup>
							<Controller
								name="email"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="email">Email Address</FieldLabel>
										<Input
											{...field}
											id="email"
											aria-invalid={fieldState.invalid}
											placeholder="your.email@address.com"
											autoComplete="email"
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
										<FieldDescription>
											Please type in your email address. You'll get a magic link
											to login or register!
										</FieldDescription>
									</Field>
								)}
							/>
						</FieldGroup>
						<Button
							type="submit"
							size="lg"
							disabled={fetcher.state !== 'idle'}
						>
							{fetcher.state !== 'idle' ? 'Processing...' : 'Submit'}
						</Button>
					</fetcher.Form>

					{fetcher.data?.error !== null && (
						<p className="text-xs mt-1 text-center text-red-500">
							{fetcher.data?.error}
						</p>
					)}

					{fetcher.data?.success && (
						<p className="text-xs mt-1 text-center text-green-500">
							Magic link sent! Please check your inbox (spam) to use start using
							wShift synchronized across your devices.
						</p>
					)}
				</>
			)}
		</div>
	);
}
