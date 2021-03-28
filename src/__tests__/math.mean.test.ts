import mean from '../math/mean';

test('[math] Mean/Avarage', () => {
	const arr = [10, 38, 23, 38, 23, 21];
	expect(mean(arr)).toBe(25.5);
});