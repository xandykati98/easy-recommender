import dot_product from '@math/dot_product';
import { Vector1D } from 'math-types';

/**
 * @description Cosine similarity is a measure of similarity between two non-zero vectors of an inner product space.
 * @see https://towardsdatascience.com/how-to-build-a-textual-similarity-analysis-web-app-aa3139d4fb71#8762
 * @param {Vector1D} a 1D Vector, probably standarized data features
 * @param {Vector1D} b 1D Vector, probably standarized data features
 * @param {Vector1D} ws 1D Vector, used as "ws" param in the inner "dot_product"
 * @return {number} A number between 1 and -1 where 1 is very similar and -1 is not similar at all
 */
const cos_similarity = (a: Vector1D, b: Vector1D, ws?: Vector1D) => {
    const magnitude_a = Math.sqrt(dot_product(a, a, ws));
    const magnitude_b = Math.sqrt(dot_product(b, b, ws));

    if (magnitude_a && magnitude_b)
        /**
         * @see https://wikimedia.org/api/rest_v1/media/math/render/svg/1d94e5903f7936d3c131e040ef2c51b473dd071d
         */
        return dot_product(a, b, ws) / (magnitude_a * magnitude_b)
    else return false
}

export default cos_similarity