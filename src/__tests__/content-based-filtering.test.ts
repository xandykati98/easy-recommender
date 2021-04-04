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

test('Content Based Filtering', async () => {
    cbf.addData({db_id: '123', price: 123, size: 3, type: 'good' });
    cbf.addData({db_id: '2', size: 20, price: 200 , type: 'bad' });
    cbf.addData({size: 33, price: 300, db_id: '3' , type: 'good' });
    const std = (cbf.std_scaler as cumulative_std_scaler)
    cbf.addData({size: 44444, price: 444444, db_id: '4' , type: 'very good' });
    std.rescaleMatrix()
    // Test matrix props when the input object is slightly different
    expect(std.unscaled_matrix.numberOfRows).toBe(4)
    expect(std.unscaled_matrix.numberOfColumns).toBe(5)
    // Test column values when the input object is slightly different
    expect(std.unscaled_matrix.map(row => row[0])).toEqual([123,200,300,444444])
    expect(std.unscaled_matrix.map(row => row[1])).toEqual([3,20,33,44444])
    const c_index_type =  std.columns_indexed_names.indexOf('type_good')
    expect(std.unscaled_matrix.map(row => row[c_index_type])).toEqual([1,0,1,0])
    cbf.addData({size: 1, price: 1, db_id: '4' , type: 'very good' });
    cbf.addData({size: 12, price: 12, db_id: '4' , type: 'very good' });
    cbf.addData({size: 32, price: 32, db_id: '4' , type: 'very good' });
    cbf.addData({size: 34, price: 42, db_id: '4' , type: 'very good' });
});