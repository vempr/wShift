import { Controller, useForm } from 'react-hook-form';
import { Button } from '~/components/ui/button';
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
import { Input } from '~/components/ui/input';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '~/components/ui/dialog';
import { shiftSchema, type ShiftFormSchema } from '~/form/shift';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import {
	templateStorage,
	type Template,
	type TemplateFormData,
} from '~/utils/templateStorage';
import { Badge } from '~/components/ui/badge';
import { calculatePayFromWage } from '~/utils/wage';

export default function ManageShiftTemplates() {
	const [addTemplateDialogIsOpen, setAddTemplateDialogIsOpen] = useState(false);
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
		<Drawer>
			<DrawerTrigger asChild>
				<Button variant="destructive">Manage shift templates</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Manage shift templates</DrawerTitle>
					<DrawerDescription>
						Add, edit or delete templates to write down your entries quicker and
						easier.
					</DrawerDescription>
				</DrawerHeader>
				<div className="flex flex-col justify-content items-center">
					{templates.length ? (
						<ul className="flex flex-col gap-y-1">
							{templates.map((template) => {
								return (
									<li
										key={template.id}
										className="flex gap-x-1 items-center"
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
														`${parseFloat(template.wage).toString()}$/hr, ${calculatePayFromWage(template.wage, template.to, template.from)}$ total`}
													{template.pay &&
														template.pay !== '' &&
														template.pay !== '0' &&
														`${parseFloat(template.pay).toString()}$ total`}
													)
												</span>
											</Badge>
										</div>
									</li>
								);
							})}
						</ul>
					) : (
						<p>No templates created.</p>
					)}

					<Dialog
						open={addTemplateDialogIsOpen}
						onOpenChange={setAddTemplateDialogIsOpen}
					>
						<DialogTrigger asChild>
							<Button className="mt-4">Add shift template?</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Create shift template</DialogTitle>
								<DialogDescription>
									Create and reuse shift templates to quickly write down a work
									shift for any day.
								</DialogDescription>
							</DialogHeader>

							<form
								className="flex flex-col justify-content items-center"
								onSubmit={(e) => {
									e.preventDefault();
									const formData = new FormData(e.currentTarget);

									const templateData: TemplateFormData = {
										workplace: formData.get('workplace') as string,
										wage: (formData.get('wage') as string) || undefined,
										pay: (formData.get('pay') as string) || undefined,
										from: formData.get('from') as string,
										to: formData.get('to') as string,
									};

									const fromAndToValid = templateData.from && templateData.to;

									const hasWage =
										templateData.wage &&
										templateData.wage !== '0' &&
										templateData.wage !== '';
									const hasPay =
										templateData.pay &&
										templateData.pay !== '0' &&
										templateData.pay !== '';
									const moneyValid =
										(hasWage && !hasPay) || (!hasWage && hasPay);

									if (templateData.workplace && fromAndToValid && moneyValid) {
										console.log(formData);
										const newTemplate =
											templateStorage.add_template(templateData);
										setTemplates((prev) => [...prev, newTemplate]);

										form.reset();
										setAddTemplateDialogIsOpen(false);
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
									Make template
								</Button>
							</form>
						</DialogContent>
					</Dialog>
				</div>
				<DrawerFooter></DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
