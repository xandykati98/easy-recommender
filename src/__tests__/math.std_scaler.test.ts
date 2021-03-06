
import { DummyVariable, Id } from '../engine-schema';
import { std_scaler, cumulative_std_scaler, NamedVector1D, NamedVector2D } from '../math/std_scaler';
import { zip } from '../util';

const unscaled_matrix = [
    new NamedVector1D(3.0, 0.0),
    new NamedVector1D(0.0, 2.0),
    new NamedVector1D(1.0, 1.0),
    new NamedVector1D(8.0, 1.0),
];
const scaled_matrix = [
    new NamedVector1D(0, -1.414213562373095),
    new NamedVector1D(-0.9733285267845753, 1.414213562373095),
    new NamedVector1D(-0.6488856845230502, 0),
    new NamedVector1D(1.6222142113076254, 0),
]
test('[ml] Standard Scaler', () => {
    expect(new NamedVector2D(...std_scaler(unscaled_matrix).map(E => new NamedVector1D(...E)))).toStrictEqual(new NamedVector2D(...scaled_matrix));
});
test('[ml] Cumulative Standard Scaler', async () => {
    const css = new cumulative_std_scaler(unscaled_matrix);

    // Test initialization computations
    expect(css.scaled_matrix).toStrictEqual(new NamedVector2D(...scaled_matrix));

    const pre_unscaled_matrix = [
        new NamedVector1D(3.0, 0.0),
        new NamedVector1D(0.0, 2.0),
        new NamedVector1D(1.0, 1.0),
    ];
    
    const css2 = new cumulative_std_scaler(pre_unscaled_matrix);

    css2.addRow(new NamedVector1D(8.0, 1.0))

    // Test with sync recalculating the whole matrix
    css2.rescaleMatrix()
    expect(css2.columns_std).toStrictEqual(css.columns_std);
    expect(css2.columns_u).toStrictEqual(css.columns_u);
    expect(css2.columns_variance).toStrictEqual(css.columns_variance);
    expect(css2.columns_sum).toStrictEqual(css.columns_sum);
    expect(css2.scaled_matrix).toStrictEqual(css.scaled_matrix);

    /**
     * @todo better way of naming columns in NamedVector2D
     */
    css2.addRow(new NamedVector1D(3, 5, 1))
    css2.addRow(new NamedVector1D(2, 4, 8, 5))
    css2.addRow(new NamedVector1D(2, 4, 0, 0))
    css2.addRow(new NamedVector1D(2, 4,))
    css2.addRow(new NamedVector1D())
    
    css2.rescaleMatrix()

    const pre_unscaled_matrix2 = [
        new NamedVector1D(3.0, 0.0),
        new NamedVector1D(0.0, 2.0),
        new NamedVector1D(1.0, 1.0),
        new NamedVector1D(8.0, 1.0),
        new NamedVector1D(3, 5, 1),
        new NamedVector1D(2, 4, 8, 5),
        new NamedVector1D(2, 4, 0, 0),
        new NamedVector1D(2, 4,),
        new NamedVector1D()
    ];
    const css3 = new cumulative_std_scaler(pre_unscaled_matrix2)
});

test('[ml] Precision Cumulative Standard Scaler', async () => {
    const css = new cumulative_std_scaler([], {
        db_id: Id,
        price: Number,
        size: Number
    });
    css.addRow(new NamedVector1D(0, 0).id('1'), ['price', 'size'])
    css.addRow(new NamedVector1D(0, 0).id('2'), ['price', 'size'])
    css.addRow(new NamedVector1D(1, 1).id('3'), ['price', 'size'])
    css.addRow(new NamedVector1D(1, 1).id('3'), ['price', 'size'])

    for await (const column of css.precision_columns) {
        expect(typeof column.busy === 'boolean').toBe(true)
        await column.waitLastCalc()
        expect(column.busy).toBe(false)
        expect(column.as_array).toStrictEqual([-1,-1,1,1])
        expect(column.unscaled_as_array).toStrictEqual([0,0,1,1])
    }
});

test('[ml] Precision Cumulative Standard Scaler (Bulky add)', async () => {
    const css = new cumulative_std_scaler([], {
        db_id: Id,
        price: Number,
        size: Number
    });

    const batch_size = 5;

    for (let i = 0; i < new Array(batch_size).fill(0).length; i++) {
        css.addRow(new NamedVector1D(Math.random() * 1000, Math.random() * 1000).id(String(i)), ['price', 'size'], { informRecalc: i === (batch_size - 1) })
    }

    for await (const column of css.precision_columns) {
        expect(typeof column.busy === 'boolean').toBe(true)
        await column.waitLastCalc()
        expect(column.busy).toBe(false)
    }
});