export interface Template {
	id: string;
	workplace: string;
	wage?: string;
	pay?: string;
	from: string;
	to: string;
}

export interface TemplateFormData {
	workplace: string;
	wage?: string;
	pay?: string;
	from: string;
	to: string;
}

class TemplateStorage {
	private storageKey = 'templates';

	get_all_templates(): Template[] {
		try {
			const data = localStorage.getItem(this.storageKey);
			return data ? JSON.parse(data) : [];
		} catch (err) {
			console.error('Error loading work shift templates:', err);
			return [];
		}
	}

	add_template(formData: TemplateFormData): Template {
		const newTemplate: Template = {
			id: Date.now().toString(),
			workplace: formData.workplace,
			wage: formData.wage,
			pay: formData.pay,
			from: formData.from,
			to: formData.to,
		};

		const allTemplates = this.get_all_templates();
		allTemplates.push(newTemplate);
		localStorage.setItem(this.storageKey, JSON.stringify(allTemplates));

		return newTemplate;
	}

	update_template(
		templateId: string,
		updatedData: Partial<Template>,
	): Template | null {
		const allTemplates = this.get_all_templates();
		const i = allTemplates.findIndex((shift) => shift.id === templateId);

		if (i !== 1) {
			allTemplates[i] = { ...allTemplates[i], ...updatedData };
			localStorage.setItem(this.storageKey, JSON.stringify(allTemplates));
			return allTemplates[i];
		}

		return null;
	}

	delete_template(templateId: string): void {
		const allTemplates = this.get_all_templates();
		const newTemplatesAfterDeletion = allTemplates.filter(
			(s) => s.id !== templateId,
		);
		localStorage.setItem(
			this.storageKey,
			JSON.stringify(newTemplatesAfterDeletion),
		);
	}
}

export const templateStorage = new TemplateStorage();
