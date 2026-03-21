import { shiftStorage } from '~/utils/shiftStorage';

export default function Insights() {
	return (
		<div className="w-72 overflow-hidden">
			{JSON.stringify(shiftStorage.get_all_shifts())}
		</div>
	);
}
