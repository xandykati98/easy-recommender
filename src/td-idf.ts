/**
 * The tf–idf is the product of two statistics, term frequency and inverse document frequency. (tf*idf)
 * There are various ways for determining the exact values of both statistics.
 * A formula that aims to define the importance of a keyword or phrase within a document or a web page.
 * @see https://medium.com/@bindhubalu/content-based-recommender-system-4db1b3de03e7
 */

type Document = string | string[];

/**
 * The TF (term frequency) of a word is the number of times it appears in a document.
 * When you know it, you’re able to see if you’re using a term too often or too infrequently.
 * @param {string} term
 * @param {string | string[]} document
 * @todo Variants of term frequency (tf) weight https://en.wikipedia.org/wiki/Tf%E2%80%93idf#Term_frequency_2
 */
export const tf = (
    term: string,
    document: Document
) => {
    const words = typeof document === 'string' ? document.split(' ').map((word) => word.replace(',', '')) : document;

    return words.filter((word) => word === term).length / words.length;
};

/**
 * The IDF (inverse document frequency) of a word is the measure of how significant that term is in the whole corpus (collection of documents).
 * @param {string} term
 * @param {Document[]} corpus
 */
export const idf = (term: string, corpus: Document[]) => {
    const documents_with_term = corpus.filter((document) => document.includes(term));
    return Math.log(corpus.length / documents_with_term.length);
};

/**
 * A high weight in tf–idf is reached by a high term frequency (in the given document) and a low document frequency of the term in the whole collection of documents;
 * @see https://wikimedia.org/api/rest_v1/media/math/render/svg/10109d0e60cc9d50a1ea2f189bac0ac29a030a00
 * @param {string} term
 * @param {Document} document
 * @param {Document[]} corpus
 */
export const tf_idf = (term: string, document: Document, corpus: Document[]): number => {
    return tf(term, document) * idf(term, corpus);
};

export default {
    tf,
    idf,
    tf_idf,
};