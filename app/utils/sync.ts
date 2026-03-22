import { useFetcher } from 'react-router';
import { shiftStorage } from './shiftStorage';
import { templateStorage } from './templateStorage';

export function useSync() {
	const fetcher = useFetcher();

	const syncShifts = () => {
		const formData = new FormData();
		formData.append('type', 'shifts');
		formData.append('data', JSON.stringify(shiftStorage.get_all_shifts()));
		fetcher.submit(formData, { method: 'post', action: '/api/sync' });
	};

	const syncTemplates = () => {
		const formData = new FormData();
		formData.append('type', 'templates');
		formData.append(
			'data',
			JSON.stringify(templateStorage.get_all_templates()),
		);
		fetcher.submit(formData, { method: 'post', action: '/api/sync' });
	};

	return { syncShifts, syncTemplates, isSyncing: fetcher.state !== 'idle' };
}
