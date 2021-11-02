import sum from "@math/sum";
import { Vector1D } from 'math-types';

/**
 * @description In mathematics, the dot product or scalar product is an algebraic operation that takes two equal-length sequences of numbers (usually coordinate vectors), and returns a single number. 
 * @see https://wikimedia.org/api/rest_v1/media/math/render/svg/5bd0b488ad92250b4e7c2f8ac92f700f8aefddd5
 * @param {Vector1D} a 1D Vector
 * @param {Vector1D} b 1D Vector
 * @param {Vector1D} ws Peso de cada valor
 * @example
 * a = [2, 7, 1]
 * b = [8, 2, 8]
 * sum([2*8, 7*2, 1*8]) === dot_product(a, b) // 38
 */
const dot_product = (a: Vector1D, b: Vector1D, ws?: Vector1D) => {
    if (a.length !== b.length) {
        console.error(`Vectors with different sizes. Vector A: ${a.length}, Vector B: ${b.length}.`);
        return 0;
    }
    /**
     * @example
     * a = [2, 7, 1]
     * b = [8, 2, 8]
     * dot_vector =  [2*8, 7*2, 1*8]
     */
    const products = a.map((a_val, i) => (ws !== undefined ? ws[i] : 1) * a_val * b[i]);
    return sum(products)
}
  
export default dot_product;