import { cbf_engine } from '../content-based-filtering'
import { DummyVariable, Id } from '../engine-schema';
import { cumulative_std_scaler } from '../math/std_scaler';

const cbf = new cbf_engine({
    schema: {
        db_id: Id,
        price: Number,
        size: Number,
        type: DummyVariable
    },
})

test('Content Based Filtering', () => {
    cbf.addData({db_id: '123', price: 123, size: 3, type: 'good' });
    cbf.addData({db_id: '2', size: 20, price: 200 , type: 'bad' });
    cbf.addData({size: 33, price: 300, db_id: '3' , type: 'good' });
    const std = (cbf.std_scaler as cumulative_std_scaler)
    std.rescaleMatrix()
    std.log()
    cbf.addData({size: 44444, price: 444444, db_id: '4' , type: 'very good' });
    std.log()
    std.rescaleMatrix()
    // Test matrix props when the input object is slightly different
    expect(std.unscaled_matrix.numberOfRows).toBe(4)
    expect(std.unscaled_matrix.numberOfColumns).toBe(5)
    // Test column values when the input object is slightly different
    expect(std.unscaled_matrix.map(row => row[0])).toEqual([123,200,300,444444])
    expect(std.unscaled_matrix.map(row => row[1])).toEqual([3,20,33,44444])

});