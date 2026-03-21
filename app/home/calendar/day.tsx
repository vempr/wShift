import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '~/components/ui/dialog';
import { shiftStorage, type Shift } from '~/utils/shiftStorage';
import { Button } from '~/components/ui/button';
import { format, isSameDay } from 'date-fns';

import { Badge } from '~/components/ui/badge';
import { calculatePayFromWage } from '~/utils/wage';
import { useEffect, useState } from 'react';
import { templateStorage, type Template } from '~/utils/templateStorage';
import { Pencil, Trash } from 'lucide-react';
import AddShiftDrawer from './day/add_shift';
import EditShiftDrawer from './day/edit_shift';

interface DayComponentProps {
	day: Date;
	currentMonth: Date;
	setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
	shiftsForDay: Shift[];
}

export default function Day({
	day,
	currentMonth,
	setShifts,
	shiftsForDay,
}: DayComponentProps) {
	const [templates, setTemplates] = useState<Template[]>([]);

	useEffect(() => {
		const loadTemplates = () => {
			const allTemplates = templateStorage.get_all_templates();
			setTemplates(allTemplates);
		};

		loadTemplates();

		window.addEventListener('storage', loadTemplates);
		return () => window.removeEventListener('storage', loadTemplates);
	}, []);

	const formattedDay = format(day, 'd');
	let daySuffix = 'th';

	if (parseInt(formattedDay, 10) < 11 || parseInt(formattedDay, 10) > 13)
		if (formattedDay.endsWith('1')) {
			daySuffix = 'st';
		} else if (formattedDay.endsWith('2')) {
			daySuffix = 'nd';
		} else if (formattedDay.endsWith('3')) {
			daySuffix = 'rd';
		}

	const epicDate = `${formattedDay}${daySuffix} of ${format(currentMonth, 'MMMM')}, ${format(currentMonth, 'yyyy')}`;

	const earnings = shiftsForDay.reduce((total, shift) => {
		if (shift.wage && shift.wage !== '' && shift.wage !== '0')
			return total + calculatePayFromWage(shift.wage, shift.to, shift.from);
		else if (shift.pay && shift.pay !== '' && shift.pay !== '0')
			return total + parseFloat(shift.pay);
		return total;
	}, 0);

	return (
		<Dialog key={day.toString()}>
			<DialogTrigger asChild>
				<Card className="hover:cursor-pointer h-full hover:italic">
					<CardHeader>
						<CardTitle>
							{isSameDay(day, new Date()) ? (
								<span className="underline font-black">{formattedDay}</span>
							) : (
								formattedDay
							)}{' '}
							{earnings > 0 && (
								<kbd className="font-bold">({earnings.toFixed(2)}$)</kbd>
							)}
						</CardTitle>
					</CardHeader>
					<CardContent className="overflow-auto h-12 2xl:h-30">
						<ul className="flex flex-col gap-y-0.5">
							{shiftsForDay.map((shift) => (
								<li key={shift.id}>
									<Badge>
										{shift.from} - {shift.to}
									</Badge>
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Entries for {epicDate}</DialogTitle>
					<DialogDescription>
						Manage the work shifts for this specific day.
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-y-4">
					{shiftsForDay.length ? (
						<ul className="flex flex-col gap-y-1">
							{shiftsForDay.map((shift) => {
								return (
									<li
										key={shift.id}
										className="flex gap-x-1 items-center"
									>
										<div className="flex flex-1 gap-x-1 items-center">
											{' '}
											<p>{shift.workplace}:</p>
											<div className="flex">
												<Badge>
													{shift.from} - {shift.to}{' '}
													<span className="font-bold">
														(
														{shift.wage &&
															shift.wage !== '' &&
															shift.wage !== '0' &&
															`${parseFloat(shift.wage).toFixed(2).toString()}$/hr, ${calculatePayFromWage(shift.wage, shift.to, shift.from).toFixed(2)}$ total`}
														{shift.pay &&
															shift.pay !== '' &&
															shift.pay !== '0' &&
															`${parseFloat(shift.pay).toFixed(2).toString()}$ total`}
														)
													</span>
												</Badge>
											</div>
										</div>
										<div>
											<EditShiftDrawer
												shift={shift}
												epicDate={epicDate}
												templates={templates}
												setShifts={setShifts}
												setTemplates={setTemplates}
											/>
											<Button
												variant="destructive"
												onClick={() => {
													setShifts(shiftStorage.delete_shift(shift.id));
												}}
											>
												<Trash />
											</Button>
										</div>
									</li>
								);
							})}
						</ul>
					) : (
						'No entries.'
					)}

					<AddShiftDrawer
						day={day}
						epicDate={epicDate}
						templates={templates}
						setShifts={setShifts}
						setTemplates={setTemplates}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
