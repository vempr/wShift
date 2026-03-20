import { useEffect, useState } from 'react';
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
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '~/components/ui/dialog';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '~/components/ui/drawer';
import Insights from './insights';
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '~/components/ui/field';
import { Controller, useForm } from 'react-hook-form';
import {
	type Shift,
	shiftStorage,
	type ShiftFormData,
} from '~/utils/shiftStorage';

export default function Calendar() {
	const form = useForm();

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

	console.log(shifts);

	return (
		<div className="flex gap-x-4 h-full">
			<Insights />
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

						{days.map((day) => {
							const formattedDay = format(day, 'd');
							let daySuffix = 'th';

							if (
								parseInt(formattedDay, 10) < 11 ||
								parseInt(formattedDay, 10) > 13
							)
								if (formattedDay.endsWith('1')) {
									daySuffix = 'st';
								} else if (formattedDay.endsWith('2')) {
									daySuffix = 'nd';
								} else if (formattedDay.endsWith('3')) {
									daySuffix = 'rd';
								}

							const epicDate = `${formattedDay}${daySuffix} of ${format(currentMonth, 'MMMM')}, ${format(currentMonth, 'yyyy')}`;

							return (
								<Dialog key={day.toString()}>
									<DialogTrigger asChild>
										<Card className="hover:cursor-pointer">
											<CardHeader>
												<CardTitle>{formattedDay}</CardTitle>
											</CardHeader>
											<CardContent>
												<p></p>
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
										<div className="flex flex-col gap-2">
											No entries.
											<Drawer>
												<DrawerTrigger asChild>
													<Button>Add new work shift?</Button>
												</DrawerTrigger>
												<DrawerContent>
													<DrawerHeader>
														<DrawerTitle>New shift for {epicDate}</DrawerTitle>
														<DrawerDescription>
															Add manually or use a work shift template.
														</DrawerDescription>
													</DrawerHeader>

													<div className="flex flex-col justify-content items-center">
														<form
															className="min-w-96 flex flex-col justify-content items-center"
															onSubmit={(e) => {
																e.preventDefault();
																const formData = new FormData(e.currentTarget);

																const shiftData: ShiftFormData = {
																	workplace: formData.get(
																		'workplace',
																	) as string,
																	wage:
																		(formData.get('wage') as string) ||
																		undefined,
																	pay:
																		(formData.get('pay') as string) ||
																		undefined,
																};

																if (
																	(shiftData.workplace &&
																		shiftData.wage &&
																		!shiftData.pay) ||
																	(shiftData.workplace &&
																		!shiftData.wage &&
																		shiftData.pay)
																) {
																	const newShift = shiftStorage.add_shift(
																		day,
																		shiftData,
																	);
																	setShifts((prev) => [...prev, newShift]);

																	form.reset();
																}
															}}
														>
															<FieldGroup>
																<Controller
																	name="workplace"
																	control={form.control}
																	render={({ field, fieldState }) => (
																		<Field data-invalid={fieldState.invalid}>
																			<FieldLabel htmlFor="workplace">
																				Workplace
																			</FieldLabel>
																			<Input
																				{...field}
																				id="workplace"
																				aria-invalid={fieldState.invalid}
																				placeholder="Apple Inc."
																				autoComplete="workplace"
																				required
																			/>
																			{fieldState.invalid && (
																				<FieldError
																					errors={[fieldState.error]}
																				/>
																			)}
																		</Field>
																	)}
																/>

																<Controller
																	name="wage"
																	control={form.control}
																	render={({ field, fieldState }) => (
																		<Field data-invalid={fieldState.invalid}>
																			<FieldLabel htmlFor="hourly-wage">
																				Hourly Wage (x$/h)
																			</FieldLabel>
																			<Input
																				{...field}
																				id="hourly-wage"
																				aria-invalid={fieldState.invalid}
																				placeholder="15"
																				autoComplete="off"
																				type="number"
																			/>
																			{fieldState.invalid && (
																				<FieldError
																					errors={[fieldState.error]}
																				/>
																			)}
																		</Field>
																	)}
																/>

																<Controller
																	name="pay"
																	control={form.control}
																	render={({ field, fieldState }) => (
																		<Field data-invalid={fieldState.invalid}>
																			<FieldLabel htmlFor="total-pay">
																				Total Pay ($)
																			</FieldLabel>
																			<Input
																				{...field}
																				id="total-pay"
																				aria-invalid={fieldState.invalid}
																				placeholder="120"
																				autoComplete="off"
																				type="number"
																			/>
																			{fieldState.invalid && (
																				<FieldError
																					errors={[fieldState.error]}
																				/>
																			)}
																			<FieldDescription>
																				*Please fill out either only the hourly
																				wage OR how much you get paid for the
																				entirety of the shift.*
																			</FieldDescription>
																		</Field>
																	)}
																/>
															</FieldGroup>

															<Button
																type="submit"
																size="lg"
																className="mt-5"
															>
																Add to entries
															</Button>
														</form>
													</div>

													<DrawerFooter>
														<DrawerClose>
															<Button variant="outline">Cancel</Button>
														</DrawerClose>
													</DrawerFooter>
												</DrawerContent>
											</Drawer>{' '}
										</div>
									</DialogContent>
								</Dialog>
							);
						})}

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
