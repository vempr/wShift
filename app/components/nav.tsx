import { Link } from 'react-router';
import { Button } from './ui/button';

export default function Nav({
	loggedIn,
	email,
}: {
	loggedIn: boolean;
	email?: string;
}) {
	return (
		<nav>
			<ul className="flex justify-between">
				<li>
					<Link to="/">
						<h1 className="text-2xl font-bold italic">wShift</h1>
					</Link>
				</li>
				<li>
					<div className="flex items-center gap-x-3">
						{loggedIn ? (
							<>
								<p className="text-sm">{email}</p>
								<Link to="/auth">
									<Button className="">Account</Button>
								</Link>
							</>
						) : (
							<>
								<p className="text-sm opacity-50">Guest</p>
								<Link to="/auth">
									<Button className="">Account</Button>
								</Link>
							</>
						)}
					</div>
				</li>
			</ul>
		</nav>
	);
}
