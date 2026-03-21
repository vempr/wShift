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
		<nav className="mb-2">
			<ul className="flex justify-between">
				<li className="flex gap-x-3 items-center">
					<Link to="/">
						<h1 className="text-2xl font-bold italic">wShift</h1>
					</Link>
					<p className="text-xs opacity-40 italic">
						{'->'} document your work shifts.
					</p>
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
								<p className="text-sm opacity-50">
									Guest <span className="italic">(link account to sync)</span>
								</p>
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
