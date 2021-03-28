
import { std_scaler, cumulative_std_scaler } from '../math/std_scaler';

const unscaled_matrix = [
    [3.0, 0.0],
    [0.0, 2.0],
    [1.0, 1.0],
    [8.0, 1.0],
];
const scaled_matrix = [
    [0, -1.414213562373095],
    [-0.9733285267845753, 1.414213562373095],
    [-0.6488856845230502, 0],
    [1.6222142113076254, 0],
]
test('[ml] Standard Scaler', () => {
    expect(std_scaler(unscaled_matrix)).toStrictEqual(scaled_matrix);
});
test('[ml] Cumulative Standard Scaler', async () => {
    const css = new cumulative_std_scaler(unscaled_matrix);
    expect(css.scaled_matrix).toStrictEqual(scaled_matrix);

    const pre_unscaled_matrix = [
        [3.0, 0.0],
        [0.0, 2.0],
        [1.0, 1.0],
    ];
    const css2 = new cumulative_std_scaler(pre_unscaled_matrix);
    await css2.addRow([8.0, 1.0])
    expect(css2.columns_std).toStrictEqual(css.columns_std);
    expect(css2.columns_u).toStrictEqual(css.columns_u);
    expect(css2.columns_variance).toStrictEqual(css.columns_variance);
    expect(css2.columns_sum).toStrictEqual(css.columns_sum);
    
    css2.rescaleMatrix()

    expect(css2.scaled_matrix).toStrictEqual(css.scaled_matrix);
});