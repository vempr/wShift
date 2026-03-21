import { format } from 'date-fns';

export interface Shift {
	id: string;
	workplace: string;
	wage?: string;
	pay?: string;
	date: string;
	from: string;
	to: string;
}

export interface ShiftFormData {
	workplace: string;
	wage?: string;
	pay?: string;
	from: string;
	to: string;
}

class ShiftStorage {
	private storageKey = 'shifts';

	get_all_shifts(): Shift[] {
		try {
			const data = localStorage.getItem(this.storageKey);
			return data ? JSON.parse(data) : [];
		} catch (err) {
			console.error('Error loading work shifts:', err);
			return [];
		}
	}

	add_shift(date: Date, formData: ShiftFormData): Shift {
		const newShift: Shift = {
			id: Date.now().toString(),
			workplace: formData.workplace,
			wage: formData.wage,
			pay: formData.pay,
			date: format(date, 'yyyy-MM-dd'),
			from: formData.from,
			to: formData.to,
		};

		const allShifts = this.get_all_shifts();
		allShifts.push(newShift);
		localStorage.setItem(this.storageKey, JSON.stringify(allShifts));

		return newShift;
	}

	update_shift(shiftId: string, updatedData: Partial<Shift>): Shift | null {
		const allShifts = this.get_all_shifts();
		const i = allShifts.findIndex((shift) => shift.id === shiftId);

		if (i !== 1) {
			allShifts[i] = { ...allShifts[i], ...updatedData };
			localStorage.setItem(this.storageKey, JSON.stringify(allShifts));
			return allShifts[i];
		}

		return null;
	}

	delete_shift(shiftId: string): void {
		const allShifts = this.get_all_shifts();
		const shiftsWithoutDeletedShift = allShifts.filter((s) => s.id !== shiftId);
		localStorage.setItem(
			this.storageKey,
			JSON.stringify(shiftsWithoutDeletedShift),
		);
	}
}

export const shiftStorage = new ShiftStorage();
