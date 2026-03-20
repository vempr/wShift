import { useState } from 'react';
import {
	startOfMonth,
	endOfMonth,
	getDay,
	addMonths,
	subMonths,
	format,
	eachDayOfInterval,
} from 'date-fns';
import { Button } from '~/components/ui/button';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/ui/card';

export default function Calendar() {
	const [currentMonth, setCurrentMonth] = useState(new Date());

	const startDate = startOfMonth(currentMonth);
	const endDate = endOfMonth(currentMonth);
	const days = eachDayOfInterval({ start: startDate, end: endDate });

	// this is for the 'whitespace' days before the first day of the month since it probably doesn't start at monday
	const startDay = (getDay(startDate) + 6) % 7;
	const emptyDaysStart = Array(startDay).fill(null);

	const totalCells = 42;
	const emptyDaysEndCount = totalCells - (emptyDaysStart.length + days.length);
	const emptyDaysEnd = Array(
		emptyDaysEndCount > 0 ? emptyDaysEndCount : 0,
	).fill(null);

	return (
		<div className="flex gap-x-4 h-full">
			<div className="min-w-72 bg-black">Insights and stuff</div>
			<div className="flex flex-1 flex-col items-center gap-y-2">
				<div className="flex items-center gap-x-2">
					<Button
						className="rounded-full p-3 px-4"
						onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
					>
						<ChevronsLeft />
					</Button>
					<h1 className="text-xl min-w-50 text-center">
						{format(currentMonth, 'MMMM yyyy')}
					</h1>
					<Button
						className="rounded-full p-3 px-4"
						onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
					>
						<ChevronsRight />
					</Button>
				</div>

				<div className="grid grid-cols-7 gap-1 w-full">
					{[
						'Monday',
						'Tuesday',
						'Wednesday',
						'Thursday',
						'Friday',
						'Saturday',
						'Sunday',
					].map((day) => (
						<div
							key={day}
							className="text-xs text-center"
						>
							{day}
						</div>
					))}
				</div>

				<div className="flex-1 w-full">
					<div className="grid grid-cols-7 gap-1 w-full h-full">
						{emptyDaysStart.map((_, i) => (
							<Card key={`empty-day-${i}`}>
								<CardHeader>
									<CardTitle>
										<p className="opacity-20">X</p>
									</CardTitle>
								</CardHeader>
							</Card>
						))}

						{days.map((day) => (
							<Card key={day.toString()}>
								<CardHeader>
									<CardTitle>{format(day, 'd')}</CardTitle>
								</CardHeader>
								<CardContent>
									<p></p>
								</CardContent>
							</Card>
						))}

						{emptyDaysEnd.map((_, i) => (
							<Card key={`empty-day-${i}`}>
								<CardHeader>
									<CardTitle>
										<p className="opacity-20">X</p>
									</CardTitle>
								</CardHeader>
							</Card>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
