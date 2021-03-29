import { cbf_engine } from '../content-based-filtering'
import { Id } from '../engine-schema';

const cbf = new cbf_engine({
    schema: {
        db_id: Id,
        price: Number,
    },
})

test('Content Based Filtering', () => {
    console.log(cbf.fields)
    console.log(cbf.wheights)
	expect(25.5).toBe(25.5);
});