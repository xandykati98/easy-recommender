import sum from '../math/sum';

test('[math] Sum', () => {
	const arr = [10, 38, 23, 38, 23, 21];
	expect(sum(arr)).toBe(153);
});