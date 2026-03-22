import { Input } from '~/components/ui/input';
import {
	Drawer,
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
import { useState } from 'react';
import { calculatePayFromWage } from '~/utils/wage';
import { zodResolver } from '@hookform/resolvers/zod';
import { shiftSchema, type ShiftFormSchema } from '~/form/shift';
import { templateStorage, type Template } from '~/utils/templateStorage';
import { Badge } from '~/components/ui/badge';
import { RefreshCcw } from 'lucide-react';
import { useSync } from '~/utils/sync';

interface ShiftDrawerProps {
	day: Date;
	epicDate: string;
	templates: Template[];
	setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
	setTemplates: React.Dispatch<React.SetStateAction<Template[]>>;
}

export default function AddShiftDrawer({
	day,
	epicDate,
	templates,
	setShifts,
	setTemplates,
}: ShiftDrawerProps) {
	const [addShiftDialogIsOpen, setAddShiftDialogIsOpen] = useState(false);
	const { syncShifts } = useSync();

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

	return (
		<Drawer
			open={addShiftDialogIsOpen}
			onOpenChange={setAddShiftDialogIsOpen}
		>
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
					<div className="flex gap-x-2 items-center mb-2">
						<Button
							variant="outline"
							onClick={() => {
								setTemplates(templateStorage.get_all_templates());
							}}
						>
							<RefreshCcw />
						</Button>
						<p className="mb-1 font-bold">Templates:</p>
					</div>

					{templates.length ? (
						<ul className="flex flex-col gap-y-1 mb-5">
							{templates.map((template) => {
								return (
									<li key={template.id}>
										<button
											className="flex gap-x-1 items-center hover:cursor-pointer hover:italic"
											onClick={() => {
												form.setValue('workplace', template.workplace);
												form.setValue('wage', template.wage ?? '');
												form.setValue('pay', template.pay ?? '');
												form.setValue('from', template.from);
												form.setValue('to', template.to);
											}}
										>
											<p>{template.workplace}:</p>
											<div className="flex">
												<Badge>
													{template.from} - {template.to}{' '}
													<span className="font-bold">
														(
														{template.wage &&
															template.wage !== '' &&
															template.wage !== '0' &&
															`${parseFloat(template.wage).toFixed(2).toString()}$/hr, ${calculatePayFromWage(template.wage, template.to, template.from)}$ total`}
														{template.pay &&
															template.pay !== '' &&
															template.pay !== '0' &&
															`${parseFloat(template.pay).toFixed(2).toString()}$ total`}
														)
													</span>
												</Badge>
											</div>
										</button>
									</li>
								);
							})}
						</ul>
					) : (
						<p className="opacity-50">No templates created.</p>
					)}

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
								shiftData.pay && shiftData.pay !== '0' && shiftData.pay !== '';
							const moneyValid = (hasWage && !hasPay) || (!hasWage && hasPay);

							if (shiftData.workplace && fromAndToValid && moneyValid) {
								const newShift = shiftStorage.add_shift(day, shiftData);
								setShifts((prev) => [...prev, newShift]);

								syncShifts();

								form.reset();
								setAddShiftDialogIsOpen(false);
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
											autoComplete="off"
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
										<FieldLabel htmlFor="total-pay">Total Pay ($)</FieldLabel>
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
											*Please fill out either only the hourly wage OR how much
											you get paid for the entirety of the shift.*
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

				<DrawerFooter></DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
