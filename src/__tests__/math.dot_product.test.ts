import dot_product from '../math/dot_product';

test('[math] Dot product', () => {
    const a = [2, 7, 1];
    const b = [8, 2, 8];
    expect(dot_product(a, b)).toBe(38);
});