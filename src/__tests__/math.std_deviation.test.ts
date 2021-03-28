import { simple_std_deviation, welford_std_deviation } from '../math/std_deviation';

const arr = [10, 12, 23, 23, 16, 23, 21, 16];

test('[math] Simple Std Deviation', () => {
	expect(simple_std_deviation(arr)).toBe(4.898979485566356);
});

const wfrd_std = new welford_std_deviation(arr)

test('[math] Welford\'s Std Deviation Algorithm', () => {
	expect(wfrd_std.std_deviation()).toBe(4.898979485566356);
});

const arr2 = [0, 2, 3, 3, 6, 3, 1, 6];
const arr3 = [0, 12, 0, 23, 0, 23, 0, 16];

const [ s1, w1 ] = [ simple_std_deviation(arr), new welford_std_deviation(arr).std_deviation() ]
const [ s2, w2 ] = [ simple_std_deviation(arr2), new welford_std_deviation(arr2).std_deviation() ]
const [ s3, w3 ] = [ simple_std_deviation(arr3), new welford_std_deviation(arr3).std_deviation() ]

test('[math] Welford\'s and Simple Std', () => {
	expect(s1).toBe(w1);
	expect(s2).toBe(w2);
	expect(s3).toBe(w3);
});

const initialArray = [1, 5, 33, 2, 9, 3, 45, 20]
const incremental_w = new welford_std_deviation(initialArray)
incremental_w.push(4); initialArray.push(4);
incremental_w.push(15); initialArray.push(15);
incremental_w.push(7); initialArray.push(7);

test('[math] Welford\'s incremental', () => {
	expect(incremental_w.std_deviation()).toBe(simple_std_deviation(initialArray));
});