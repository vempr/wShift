import { useEffect, useMemo, useState } from 'react';
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
import { Card, CardHeader, CardTitle } from '~/components/ui/card';
import Insights from './insights';
import { type Shift, shiftStorage } from '~/utils/shiftStorage';
import Day from './calendar/day';
import ManageShiftTemplates from './calendar/template';

export default function Calendar() {
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [currentMonth, setCurrentMonth] = useState(new Date());

	useEffect(() => {
		const loadShifts = () => {
			const allShifts = shiftStorage.get_all_shifts();
			setShifts(allShifts);
		};

		loadShifts();

		window.addEventListener('storage', loadShifts);
		return () => window.removeEventListener('storage', loadShifts);
	}, []);

	const shiftsByDate = useMemo(() => {
		const map = new Map<string, Shift[]>();
		shifts.forEach((shift) => {
			const existingShifts = map.get(shift.date) || [];
			map.set(shift.date, [...existingShifts, shift]);
		});
		return map;
	}, [shifts]);

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
			<Insights />
			<div className="flex flex-1 flex-col items-center gap-y-2 min-h-0 overflow-hidden">
				<div className="flex justify-between w-full">
					<div className="flex-1"></div>
					<div className="flex items-center gap-x-2 flex-1">
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

					<div className="flex-1 flex justify-end">
						<ManageShiftTemplates />
					</div>
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

				<div className="flex-1 w-full min-h-0">
					<div className="grid grid-cols-7 gap-1 w-full h-full auto-rows-fr">
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
							<Day
								key={day.toString()}
								day={day}
								currentMonth={currentMonth}
								setShifts={setShifts}
								shiftsForDay={shiftsByDate.get(format(day, 'yyyy-MM-dd')) || []}
							/>
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
