import sum from "@math/sum"
import { Vector1D } from 'math-types';

/**
 * Finds the array mean
 * @param arr Number array to have its mean calculated
 * @returns The mean of the numbers in the array
 */
const mean = (arr:Vector1D) => {
    const sum_result = sum(arr);
    return sum_result / arr.length
}

export default mean