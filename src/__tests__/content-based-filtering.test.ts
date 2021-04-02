import { cbf_engine } from '../content-based-filtering'
import { Id } from '../engine-schema';

const cbf = new cbf_engine({
    schema: {
        db_id: Id,
        price: Number,
    },
})

test('Content Based Filtering', () => {
    cbf.addData({db_id: '123', price: 123})
	expect(25.5).toBe(25.5);
});