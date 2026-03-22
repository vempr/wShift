import type { SupabaseClient } from '@supabase/supabase-js';
import { eachWeekOfInterval, endOfMonth, endOfWeek, format } from 'date-fns';
import type { Database } from '~/types/database';

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

export interface WeekSummary {
	weekNumber: number;
	startDate: Date;
	endDate: Date;
	earnings: number;
}

class ShiftStorage {
	private storageKey = 'shifts';
	private userId: string | null = null;
	private supabaseClient: SupabaseClient<Database> | null = null;

	set_supabase_client(client: SupabaseClient<Database>) {
		this.supabaseClient = client;
	}

	set_user_id(id: string) {
		this.userId = id;
	}

	get_all_shifts(): Shift[] {
		try {
			const data = localStorage.getItem(this.storageKey);
			return data ? JSON.parse(data) : [];
		} catch (err) {
			console.error('Error loading work shifts:', err);
			return [];
		}
	}

	set_all_shifts(shifts?: string): void {
		localStorage.setItem(this.storageKey, shifts ?? '');
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

		if (i !== -1) {
			allShifts[i] = { ...allShifts[i], ...updatedData };
			localStorage.setItem(this.storageKey, JSON.stringify(allShifts));
			return allShifts[i];
		}

		return null;
	}

	delete_shift(shiftId: string): Shift[] {
		const allShifts = this.get_all_shifts();
		const shiftsWithoutDeletedShift = allShifts.filter((s) => s.id !== shiftId);
		localStorage.setItem(
			this.storageKey,
			JSON.stringify(shiftsWithoutDeletedShift),
		);

		return shiftsWithoutDeletedShift;
	}

	calculate_hours_worked(shift: Shift): number {
		const [fromHour, fromMinute] = shift.from.split(':').map(Number);
		const [toHour, toMinute] = shift.to.split(':').map(Number);

		const fromMinutes = fromHour * 60 + fromMinute;
		const toMinutes = toHour * 60 + toMinute;

		let durationMinutes = toMinutes - fromMinutes;
		if (durationMinutes < 0) {
			durationMinutes += 24 * 60;
		}

		return durationMinutes / 60;
	}

	calculate_shift_earnings(shift: Shift): number {
		if (shift.wage && shift.wage !== '' && shift.wage !== '0') {
			const hoursWorked = this.calculate_hours_worked(shift);
			const rate = parseFloat(shift.wage);
			if (!isNaN(hoursWorked) && !isNaN(rate)) {
				return hoursWorked * rate;
			}
		} else if (shift.pay && shift.pay !== '' && shift.pay !== '0') {
			const pay = parseFloat(shift.pay);
			if (!isNaN(pay)) {
				return pay;
			}
		}

		return 0;
	}

	sum_in_year(year: number) {
		const allShifts = this.get_all_shifts();

		return allShifts.reduce((total, shift) => {
			const shiftYear = parseInt(shift.date.split('-')[0]);
			if (shiftYear == year) {
				return total + this.calculate_shift_earnings(shift);
			}
			return total;
		}, 0);
	}

	sum_in_month(year: number, month: number): number {
		const allShifts = this.get_all_shifts();

		return allShifts.reduce((total, shift) => {
			const [shiftYear, shiftMonth] = shift.date.split('-').map(Number);
			if (shiftYear == year && shiftMonth === month + 1) {
				return total + this.calculate_shift_earnings(shift);
			}
			return total;
		}, 0);
	}

	get_weeks_in_month(year: number, month: number): WeekSummary[] {
		const monthStart = new Date(year, month, 1);
		const monthEnd = endOfMonth(monthStart);

		const weeks = eachWeekOfInterval(
			{ start: monthStart, end: monthEnd },
			{ weekStartsOn: 1 },
		);

		const allShifts = this.get_all_shifts();
		return weeks.map((weekStart, index) => {
			const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

			const shiftsInWeek = allShifts.filter((shift) => {
				const shiftDate = new Date(shift.date);
				return shiftDate >= weekStart && shiftDate <= weekEnd;
			});

			const weeklyEarnings = shiftsInWeek.reduce((total, shift) => {
				return total + this.calculate_shift_earnings(shift);
			}, 0);

			return {
				weekNumber: index + 1,
				startDate: weekStart,
				endDate: weekEnd,
				earnings: weeklyEarnings,
			};
		});
	}

	/* async sync_to_supabase(): Promise<void> {
		if (!this.userId || !this.supabaseClient) return;

		const shifts = this.get_all_shifts();
		const { error } = await this.supabaseClient.from('shifts').upsert(
			{
				user_id: this.userId,
				shifts: JSON.stringify(shifts),
			},
			{
				onConflict: 'user_id',
			},
		);

		if (error) {
			console.log('Error syncing shifts to Supabase:', error);
		}
	}

	async load_from_supabase(): Promise<void> {
		if (!this.userId || !this.supabaseClient) return;

		const { data, error } = await this.supabaseClient
			.from('shifts')
			.select('shifts')
			.eq('user_id', this.userId)
			.single();

		if (error) {
			console.error('Error loading shifts from Supabase:', error);
		}

		if (!error && data.shifts) {
			try {
				const shifts = JSON.parse(data.shifts);
				localStorage.setItem(this.storageKey, JSON.stringify(shifts));
			} catch (err) {
				console.error('Error parsing shifts from Supabase:', err);
			}
		}
	} */
}

export const shiftStorage = new ShiftStorage();
