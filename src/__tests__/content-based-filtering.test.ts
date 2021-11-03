import { cbf_engine } from '../content-based-filtering'
import { DummyVariable, Id } from '../engine-schema';
import { cumulative_std_scaler } from '../math/std_scaler';

test('Content Based Filtering', async () => {
    
    const cbf = new cbf_engine({
        schema: {
            db_id: Id,
            price: Number,
            size: Number,
            type: DummyVariable
        },
    })
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
    const c_index_type =  std.columns_indexed_names.indexOf('type___good')
    expect(std.unscaled_matrix.map(row => row[c_index_type])).toEqual([1,0,1,0])
    cbf.addData({size: 1, price: 1, db_id: '4' , type: 'very good' });
    cbf.addData({size: 12, price: 12, db_id: '4' , type: 'very good' });
    cbf.addData({size: 32, price: 32, db_id: '4' , type: 'very good' });
    cbf.addData({size: 34, price: 42, db_id: '4' , type: 'very good' });
});


test('Content Based Filtering Weights', async () => {
    
    const cbf = new cbf_engine({
        schema: {
            db_id: Id,
            price: Number,
            size: Number,
            type: DummyVariable
        },
    })

    cbf.addData({size: 20, price: 100, db_id: '3' , type: 'very nice' });

    cbf.wheights = {
        size: 0.5,
        type: 0.9
    }

    cbf.addData({size: 34, price: 42, db_id: '1' , type: 'very good' });
    cbf.addData({size: 14, price: 500, db_id: '2' , type: 'very bad' });
    cbf.addData({size: 10, price: 600, db_id: '4' , type: 'very bad' });

    const std_scaler = (cbf.std_scaler as cumulative_std_scaler)
    
    expect(std_scaler.columns_weights).toEqual([ 1, 0.5, 0.3, 0.3, 0.3 ])
});

test('Content Based Filtering Recommendation (findSimilarTo)', async () => {
    
    const cbf = new cbf_engine({
        schema: {
            db_id: Id,
            price: Number,
            size: Number,
            type: DummyVariable
        },
    })

    cbf.addData({size: 34, price: 42, db_id: '1' , type: 'very good' });
    cbf.addData({size: 14, price: 500, db_id: '2' , type: 'very bad' });
    cbf.addData({size: 20, price: 100, db_id: '3' , type: 'very nice' });
    cbf.addData({size: 10, price: 600, db_id: '4' , type: 'very bad' });

});

test('Content Based Filtering Recommendation (findSimilarTo & Weights)', async () => {
    
    const cbf = new cbf_engine({
        schema: {
            db_id: Id,
            price: Number,
            size: Number,
            type: DummyVariable
        },
    })

    /**
     * Turns out that if all wheights but one are 0 the "cos_similarity" always returns -1 if one of the input vectors are negative.
     */

    cbf.wheights = {
        size: 0.5,
        type: 0.5
    }

    cbf.addData({size: 500, price: 1, db_id: '1' , type: 'very good' });
    cbf.addData({size: 550, price: 11, db_id: '2' , type: 'very bad' });
    cbf.addData({size: 600, price: 14, db_id: '3' , type: 'very nice' });
    cbf.addData({size: 660, price: 20, db_id: '4' , type: 'very bad' });
    cbf.addData({size: 660, price: 20, db_id: '5' , type: 'very nice' });
    cbf.addData({size: 660, price: 20, db_id: '5' , type: 'very good' });
    console.log(
        (cbf.std_scaler as cumulative_std_scaler).columns_weights, 
        (cbf.std_scaler as cumulative_std_scaler).columns_indexed_names
    );
    console.log(cbf.findSimilarTo({size: 500, price: 13, db_id: '7', type: 'very good'}));
});