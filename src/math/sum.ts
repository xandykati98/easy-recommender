import { Vector1D } from 'math-types';
import { NamedVector1D } from './std_scaler';

/**
 * Sums a 1D matrix
 * @param arr Number array to be summed
 * @returns The array sum
 */
const sum = (arr:Vector1D | NamedVector1D) => {
    let result = 0;
    for (const number of arr) {
        result+=number
    }
    return result
}

export default sum