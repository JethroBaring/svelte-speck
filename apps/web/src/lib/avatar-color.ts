export const generateColorFromName = (name: string) => {
	const bgColors = [
		'bg-blue-800',
		'bg-green-800',
		'bg-purple-800',
		'bg-pink-800',
		'bg-indigo-800',
		'bg-teal-800',
		'bg-orange-800',
		'bg-cyan-800',
		'bg-rose-800',
		'bg-violet-800'
	];

	const textColors = [
		'text-white',
		'text-white',
		'text-white',
		'text-white',
		'text-white',
		'text-white',
		'text-white',
		'text-white',
		'text-white',
		'text-white'
	];

	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
	}

	const bgIndex = Math.abs(hash) % bgColors.length;
	const textIndex = Math.abs(hash + 3) % textColors.length;

	return `${bgColors[bgIndex]} ${textColors[textIndex]}`;
};
