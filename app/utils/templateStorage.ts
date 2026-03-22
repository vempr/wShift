import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '~/types/database';

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
	private userId: string | null = null;
	private supabaseClient: SupabaseClient<Database> | null = null;

	set_supabase_client(client: SupabaseClient<Database>) {
		this.supabaseClient = client;
	}

	set_user_id(id: string) {
		this.userId = id;
	}

	get_all_templates(): Template[] {
		try {
			const data = localStorage.getItem(this.storageKey);
			return data ? JSON.parse(data) : [];
		} catch (err) {
			console.error('Error loading work shift templates:', err);
			return [];
		}
	}

	set_all_templates(templates?: string): void {
		localStorage.setItem(this.storageKey, templates ?? '');
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

		if (i !== -1) {
			allTemplates[i] = { ...allTemplates[i], ...updatedData };
			localStorage.setItem(this.storageKey, JSON.stringify(allTemplates));

			return allTemplates[i];
		}

		return null;
	}

	delete_template(templateId: string): Template[] {
		const allTemplates = this.get_all_templates();
		const newTemplatesAfterDeletion = allTemplates.filter(
			(s) => s.id !== templateId,
		);
		localStorage.setItem(
			this.storageKey,
			JSON.stringify(newTemplatesAfterDeletion),
		);

		return newTemplatesAfterDeletion;
	}

	/** I forgot that this supabase client is server-side, so this is pointless*/
	/* async sync_to_supabase(): Promise<void> {
		if (!this.userId || !this.supabaseClient) return;

		const templates = this.get_all_templates();
		const { error } = await this.supabaseClient.from('templates').upsert(
			{
				user_id: this.userId,
				templates: JSON.stringify(templates),
			},
			{
				onConflict: 'user_id',
			},
		);

		if (error) {
			console.log('Error syncing templates to Supabase:', error);
		}
	}

	async load_from_supabase(): Promise<void> {
		if (!this.userId || !this.supabaseClient) return;

		const { data, error } = await this.supabaseClient
			.from('templates')
			.select('templates')
			.eq('user_id', this.userId)
			.single();

		if (error) {
			console.error('Error loading templates from Supabase:', error);
		}

		if (!error && data.templates) {
			try {
				const templates = JSON.parse(data.templates);
				localStorage.setItem(this.storageKey, JSON.stringify(templates));
			} catch (err) {
				console.error('Error parsing templates from Supabase:', err);
			}
		}
	} */
}

export const templateStorage = new TemplateStorage();
