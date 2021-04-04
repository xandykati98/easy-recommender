
import { Id } from '../engine-schema';
import { cumulative_std_scaler, NamedVector1D } from '../math/std_scaler';

test('Multiple copies of SharedArrayScaler.waitLastCalc', async () => {
    const css = new cumulative_std_scaler([], {
        db_id: Id,
        price: Number,
        size: Number
    });

    const batch_size = 5;

    for (let i = 0; i < new Array(batch_size).fill(0).length; i++) {
        css.addRow(new NamedVector1D(Math.round(Math.random() * 1000), Math.round(Math.random() * 1000)).id(String(i)), ['price', 'size'], { informRecalc: i === (batch_size - 1) })
    }

    for await (const column of css.precision_columns) {
        expect(typeof column.busy === 'boolean').toBe(true)
        await Promise.all([column.waitLastCalc(), column.waitLastCalc()])
        expect(column.busy).toBe(false)
    }
});