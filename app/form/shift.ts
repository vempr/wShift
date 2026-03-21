import z from 'zod';

export const shiftSchema = z.object({
	workplace: z.string().min(1).max(30),
	wage: z.string().min(1).max(30),
	pay: z.string().min(1).max(30),
	from: z.iso.time(),
	to: z.iso.time(),
});

export type ShiftFormSchema = z.infer<typeof shiftSchema>;
