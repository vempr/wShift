import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '~/components/ui/dialog';
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
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '~/components/ui/field';
import { Controller, useForm } from 'react-hook-form';
import {
	shiftStorage,
	type Shift,
	type ShiftFormData,
} from '~/utils/shiftStorage';
import { Button } from '~/components/ui/button';
import { format } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import { shiftSchema, type ShiftFormSchema } from '~/form/shift';
import { Badge } from '~/components/ui/badge';
import { calculatePayFromWage } from '~/utils/wage';

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
	const form = useForm<ShiftFormSchema>({
		resolver: zodResolver(shiftSchema),
		defaultValues: {
			workplace: '',
			wage: '0',
			pay: '0',
			from: '10:00',
			to: '16:00',
		},
	});
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

	return (
		<Dialog key={day.toString()}>
			<DialogTrigger asChild>
				<Card className="hover:cursor-pointer h-full hover:italic">
					<CardHeader>
						<CardTitle>{formattedDay}</CardTitle>
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
								console.log('pay', shift.pay);
								return (
									<li
										key={shift.id}
										className="flex gap-x-1 items-center"
									>
										<p>{shift.workplace}:</p>
										<div className="flex">
											<Badge>
												{shift.from} - {shift.to}{' '}
												<span className="font-bold">
													(
													{shift.wage &&
														shift.wage !== '' &&
														shift.wage !== '0' &&
														`${parseFloat(shift.wage).toString()}$/hr, ${calculatePayFromWage(shift.wage, shift.to, shift.from)}$ total`}
													{shift.pay &&
														shift.pay !== '' &&
														shift.pay !== '0' &&
														`${shift.pay}$ total`}
													)
												</span>
											</Badge>
										</div>
									</li>
								);
							})}
						</ul>
					) : (
						'No entries.'
					)}
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
											workplace: formData.get('workplace') as string,
											wage: (formData.get('wage') as string) || undefined,
											pay: (formData.get('pay') as string) || undefined,
											from: formData.get('from') as string,
											to: formData.get('to') as string,
										};

										const fromAndToValid = shiftData.from && shiftData.to;

										const hasWage =
											shiftData.wage &&
											shiftData.wage !== '0' &&
											shiftData.wage !== '';
										const hasPay =
											shiftData.pay &&
											shiftData.pay !== '0' &&
											shiftData.pay !== '';
										const moneyValid =
											(hasWage && !hasPay) || (!hasWage && hasPay);

										if (shiftData.workplace && fromAndToValid && moneyValid) {
											console.log(formData);
											const newShift = shiftStorage.add_shift(day, shiftData);
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
													<FieldLabel htmlFor="workplace">Workplace</FieldLabel>
													<Input
														{...field}
														id="workplace"
														aria-invalid={fieldState.invalid}
														placeholder="Apple Inc."
														autoComplete="workplace"
														required
													/>
													{fieldState.invalid && (
														<FieldError errors={[fieldState.error]} />
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
														<FieldError errors={[fieldState.error]} />
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
														<FieldError errors={[fieldState.error]} />
													)}
													<FieldDescription>
														*Please fill out either only the hourly wage OR how
														much you get paid for the entirety of the shift.*
													</FieldDescription>
												</Field>
											)}
										/>

										<div className="flex gap-x-2 items-center">
											<Controller
												name="from"
												control={form.control}
												render={({ field, fieldState }) => (
													<Field data-invalid={fieldState.invalid}>
														<FieldLabel htmlFor="from">From</FieldLabel>
														<Input
															{...field}
															id="from"
															aria-invalid={fieldState.invalid}
															placeholder="9:00"
															autoComplete="off"
															type="time"
														/>
														{fieldState.invalid && (
															<FieldError errors={[fieldState.error]} />
														)}
													</Field>
												)}
											/>
											<Controller
												name="to"
												control={form.control}
												render={({ field, fieldState }) => (
													<Field data-invalid={fieldState.invalid}>
														<FieldLabel htmlFor="to">To</FieldLabel>
														<Input
															{...field}
															id="to"
															aria-invalid={fieldState.invalid}
															placeholder="9:00"
															autoComplete="off"
															type="time"
														/>
														{fieldState.invalid && (
															<FieldError errors={[fieldState.error]} />
														)}
													</Field>
												)}
											/>
										</div>
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
}
