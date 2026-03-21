export const calculatePayFromWage = (
	wage: string,
	to: string,
	from: string,
): number => {
	if (!wage || !from || !to) return 0;

	const [fromHour, fromMinute] = from.split(':').map(Number);
	const [toHour, toMinute] = to.split(':').map(Number);

	const fromMinutes = fromHour * 60 + fromMinute;
	const toMinutes = toHour * 60 + toMinute;

	let durationMinutes = toMinutes - fromMinutes;
	if (durationMinutes < 0) {
		durationMinutes += 24 * 60;
	}

	const hoursWorked = durationMinutes / 60;
	console.log(hoursWorked, parseFloat(wage));
	return hoursWorked * parseFloat(wage);
};
