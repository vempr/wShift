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
import { useEffect, useState } from 'react';
import {
	templateStorage,
	type Template,
	type TemplateFormData,
} from '~/utils/templateStorage';
import { Badge } from '~/components/ui/badge';
import { calculatePayFromWage } from '~/utils/wage';
import { Trash } from 'lucide-react';
import AddShiftTemplate from './template/add_template';
import EditShiftTemplate from './template/edit.template';

export default function ManageShiftTemplates() {
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
										<div className="flex flex-1 gap-x-1 items-center">
											<p>{template.workplace}:</p>
											<div className="flex">
												<Badge variant="secondary">
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
										</div>
										<div>
											<EditShiftTemplate
												template={template}
												setTemplates={setTemplates}
											/>
											<Button
												variant="destructive"
												onClick={() => {
													setTemplates(
														templateStorage.delete_template(template.id),
													);
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
						<p>No templates created.</p>
					)}

					<AddShiftTemplate setTemplates={setTemplates} />
				</div>
				<DrawerFooter></DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
