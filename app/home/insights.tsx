import { format } from 'date-fns';
import { shiftStorage } from '~/utils/shiftStorage';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/ui/card';

export default function Insights({ currentMonth }: { currentMonth: Date }) {
	const currentYear = currentMonth.getFullYear();

	const earningsInYear = shiftStorage.sum_in_year(currentYear);
	const weeksInMonth = shiftStorage.get_weeks_in_month(
		currentYear,
		currentMonth.getMonth(),
	);

	return (
		<div className="w-72 overflow-hidden">
			<h2 className="font-bold text-lg">Overview</h2>
			<p>
				<kbd className="font-bold">{earningsInYear.toFixed(2)}$</kbd> earned in{' '}
				{currentYear},
			</p>

			<p>
				<kbd className="font-bold">
					{weeksInMonth
						.reduce((total, week) => {
							return total + week.earnings;
						}, 0)
						.toFixed(2)}
					$
				</kbd>{' '}
				earned in {format(currentMonth, 'MMMM')}.
			</p>

			<h2 className="font-bold text-lg mt-4">
				Weeks ({format(currentMonth, 'MMMM yyyy')})
			</h2>

			<ul>
				{weeksInMonth.map((week) => {
					return (
						<li key={week.weekNumber}>
							<Card>
								<CardHeader>
									<CardTitle>Week {week.weekNumber}</CardTitle>
									<CardDescription>
										{week.startDate.toDateString()} -{' '}
										{week.endDate.toDateString()}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<p>
										Earnings:{' '}
										<kbd className="font-bold">{week.earnings.toFixed(2)}$</kbd>
									</p>
								</CardContent>
							</Card>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
