import { Controller, useForm } from 'react-hook-form';
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
import {
	templateStorage,
	type Template,
	type TemplateFormData,
} from '~/utils/templateStorage';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { shiftSchema, type ShiftFormSchema } from '~/form/shift';
import { zodResolver } from '@hookform/resolvers/zod';

interface AddShiftTemplateProps {
	setTemplates: React.Dispatch<React.SetStateAction<Template[]>>;
}

export default function AddShiftTemplate({
	setTemplates,
}: AddShiftTemplateProps) {
	const [addTemplateDialogIsOpen, setAddTemplateDialogIsOpen] = useState(false);

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
						Create and reuse shift templates to quickly write down a work shift
						for any day.
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
						const moneyValid = (hasWage && !hasPay) || (!hasWage && hasPay);

						if (templateData.workplace && fromAndToValid && moneyValid) {
							console.log(formData);
							const newTemplate = templateStorage.add_template(templateData);
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
										*Please fill out either only the hourly wage OR how much you
										get paid for the entirety of the shift.*
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
	);
}
