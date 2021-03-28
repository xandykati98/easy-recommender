import cos_similarity from '../math/cos_similarity';

test('[math] Cosine similarity', () => {
    const a = [2, 7, 1];
    const b = [8, 2, 8];
    expect(cos_similarity(a, b)).toBe(0.45009040119517757);
});