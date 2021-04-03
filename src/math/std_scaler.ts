import { Vector1D, Vector2D } from 'math-types';
import { DummyEntry, DummyVariable, EngineSchema, Id, TfIdf } from '../engine-schema';
import sum from './sum';

/**
 * Standardize features by removing the mean and scaling to unit variance
 * The standard score of a sample x is calculated as:
 * z = (x - u) / s
 * @see https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.StandardScaler.html
 * @param matrix2D
 */
export const std_scaler = (matrix2D: Vector2D): Vector2D => {
    const scaled_matrix: Vector2D = [];

    for (const row of matrix2D) {
        const scaled_row: number[] = [];
        let column_index: number = 0;
        for (const item of row) {
            const column = matrix2D.map((inner_row) => inner_row[column_index]);
            /**
             * Mean
             */
            const u = sum(column) / column.length;
            const std_dev_inside = matrix2D.map((inner_row) => Math.abs(inner_row[column_index] - u) ** 2);
            /**
             * Variance
             */
            const variance = sum(std_dev_inside) / matrix2D.length
            const s = Math.sqrt(variance);
            scaled_row.push((item - u) / s);
            column_index++;
        }
        scaled_matrix.push(scaled_row);
    }
    return scaled_matrix;
};

export class NamedVector1D extends Array<number> implements Vector1D {
    _id: string
    constructor(...args:Vector1D) {
        super(...args)
        this._id = ''
    }
    id(newId:string) {
        this._id = newId
        return this
    }
}

export class NamedVector2D extends Array<NamedVector1D> implements Vector2D {
    constructor(...args:NamedVector1D[]) {
        super(...args)
    }
    setNextIndex(row: NamedVector1D, row_indexed_columns:(string)[], columns_names:string[], column_types:(TfIdf|Number|DummyVariable)[]) {
        const index = this.numberOfRows;
        const vec_from_row = columns_names.map(name => row[row_indexed_columns.indexOf(name)]);
        const vec_filled:number[] = []

        for (let i = 0; i < vec_from_row.length; i++) {
            const input_value = vec_from_row[i];
            // Empty value, created when a dummy variable value is missing
            if (input_value === undefined) {
                // If it is a dummy variable we shall add a zero to symbolize this value as "off"
                if (column_types[i] === DummyVariable) {
                    vec_filled.push(0)
                } else if (column_types[i] === TfIdf) {
                    // this is where the tfidf values will need to be filled for every term
                }
            } else {
                // normal value in non-dummy column
                vec_filled.push(input_value)
            }
        }

        this[index] = new NamedVector1D(...vec_filled).id(row._id)
    }
    get numberOfRows() {
        return this.length
    }
    get numberOfColumns() {
        return this[this.length - 1]?.length || 0
    }
    get last() {
        return this[this.length - 1]    
    }
}

export class cumulative_std_scaler {
    unscaled_matrix: NamedVector2D
    scaled_matrix: NamedVector2D
    // Column props
    /**
     * Mean for each column
     */
    columns_u:number[]
    /**
     * Variance for each column
     */
    columns_variance:number[]
    /**
     * Sum of all of the items in each column
     */
    columns_sum:number[]
    /**
     * Standard deviation of the items in each column
     */
    columns_std:number[]
    /**
     * The name of each column reflected by the index that it is in
     */
    columns_indexed_names:string[]
    /**
     * The type of each column reflected by the index that it is in
     */
    columns_indexed_types:(TfIdf|Number|DummyVariable)[]

    constructor(matrix2D: NamedVector1D[] | NamedVector2D, schema?: EngineSchema) {
        // Deepcopy the initial input vector
        this.unscaled_matrix = new NamedVector2D();
        this.columns_indexed_names = []
        this.columns_indexed_types = []
        if (schema) {
            for (const column_name in schema) {
                if (schema[column_name] !== Id && schema[column_name] !== DummyVariable && schema[column_name] !== TfIdf) {
                    this.columns_indexed_names.push(column_name)
                    this.columns_indexed_types.push(schema[column_name])
                }
            }
        }
        this.columns_u = []
        this.columns_variance = []
        this.columns_std = []
        this.columns_sum = []
        this.scaled_matrix = new NamedVector2D();
        for (const row of matrix2D) {
            this.addRow(new NamedVector1D(...row).id(row._id))
        }
        this.rescaleMatrix()
    }
    log() {
        console.log(this.columns_indexed_names)
        console.log(this.columns_indexed_types)
        console.table(this.unscaled_matrix.slice(0, 10))
        console.table(this.scaled_matrix.slice(0, 10))
        console.log({
            columns_sum: this.columns_sum,
            columns_u: this.columns_u,
            columns_std: this.columns_std,
            columns_variance: this.columns_variance,
        })
    }
    /**
     * 
     * @param row The input vector of unscaled float values
     * @param row_indexed_columns The name of the column of each value by index, can contain dummy column names like "mydummy_val1"
     * @param options 
     * @returns 
     */
    addRow(row:NamedVector1D, row_indexed_columns?: (string|DummyEntry)[], options?:{ updateColumnProps: boolean }) {
        // If it provides the column names for each value
        if (row_indexed_columns) {
            // We separate values by the column type
            /**
             * Values that were sent and are of type dummy, we will loop through them and create new columns (if they are new)
             * based on their values, and set to 1 every other value in the column that is not yet assinged (values from old rows and
             * values from new rows that dont have the same dummy value active)
             */
            const dummy_entries = row_indexed_columns.filter(icolumn => typeof icolumn !== 'string') as DummyEntry[]
            // Normal values, these are not dummy variables
            const normal_entries = row_indexed_columns.filter(icolumn => typeof icolumn === 'string') as string[]
            
            // New possible dummy variables values that were added during this insert
            const new_dummy_columns:string[] = []
            for (const { key, value } of dummy_entries) {
                const dummy_column_name = `${key}_${value}`
                // If the value of this dummy is new, add to the column list and to the "new_dummy_columns" array
                if (!this.columns_indexed_names.includes(dummy_column_name)) {
                    this.columns_indexed_names.push(dummy_column_name)
                    this.columns_indexed_types.push(DummyVariable)
                    new_dummy_columns.push(dummy_column_name)
                }
                normal_entries.push(dummy_column_name)
            }

            // Set the next value of the "unscaled_matrix" with the input row, and provide the "setNextIndex" function with the possible new dummy values
            this.unscaled_matrix.setNextIndex(row, normal_entries, this.columns_indexed_names, this.columns_indexed_types);

            // For each new dummy value we will update the props of each new column created
            for (const new_dummy_column of new_dummy_columns) {
                const new_dummy_column_index = this.columns_indexed_names.indexOf(new_dummy_column)
                
                // Adds a new value to every row in the place of the new column
                let unscaled_row_index = 0;
                for (const unscaled_row of this.unscaled_matrix.slice(0, this.unscaled_matrix.numberOfRows - 1)) {
                    unscaled_row[new_dummy_column_index] = this.unscaled_matrix[unscaled_row_index][new_dummy_column_index] || 0
                    unscaled_row_index++
                }

                // updates the new column's props
                this.updateColumnProps(new_dummy_column_index, this.unscaled_matrix)

                // scales the new column
                this.rescaleColumn(new_dummy_column_index)

            }
        } else {
            this.unscaled_matrix.push(row)
        }

        // Scales the last row (that is, the same row as the input)
        // Remember: This scale does not have a 100% precision, to achieve this the "rescaleMatrix" needs to be called
        const scaled_row = new NamedVector1D().id(row._id);
        for (let index = 0; index < this.unscaled_matrix.last.length; index++) {
            const item = this.unscaled_matrix.last[index];
            scaled_row.push((item - this.columns_u[index]) / this.columns_std[index])
        }
        this.scaled_matrix.push(scaled_row)
        if (options?.updateColumnProps === false) return {
            columns_sum: this.columns_sum,
            columns_u: this.columns_u,
            columns_variance: this.columns_variance,
            columns_std: this.columns_std,
        }
        // Just so the initial data insert doesnt have NaN's and Infinities
        if (this.unscaled_matrix.numberOfRows === 1) {
            this.updateColumnsProps()
            return this.rescaleMatrix()
        } else {
            return this.updateColumnsProps()
        }
    }
    /**
     * Scales the matrix, if called during initialization the "updateColumnsProps" method will be called, otherwise you
     * should call it manually if more precision is needed.
     * 
     * @todo (optmz) maybe switch to generator functions and worker threads later on because this WILL cause lag with large datasets
     */
    rescaleMatrix() {
        let row_index = 0
        for (const row of this.unscaled_matrix) {
            const scaled_row = new NamedVector1D().id(row._id);
            let column_index: number = 0;
            for (const item of row) {

                if (!this.columns_sum[column_index]) {
                    /**
                     * if we switch this function to a generator function i dont really know how this will
                     * affect the initialization code, so i might just copy and paste this method's code (non-generator) here.
                     */
                    this.updateColumnsProps()
                }

                const u = this.columns_u[column_index]
                const s = this.columns_std[column_index]
                scaled_row.push((item - u) / s);
                column_index++;
            }
            this.scaled_matrix[row_index] = scaled_row;
            row_index++
        }
    }
    rescaleColumn(column_index:number) {
        const u = this.columns_u[column_index]
        const s = this.columns_std[column_index]

        let row_index = 0
        for (const row of this.scaled_matrix) {
            const item = this.unscaled_matrix[row_index][column_index];
            let scaled_item = (item - u) / s;
            row[column_index] = scaled_item
            row_index++
        }
    }
    updateColumnProps(column_index: number, matrix2D: NamedVector2D) {
        // Sum of all the items in this column. It'll be stored in the class after computing
        this.columns_sum[column_index] = sum(matrix2D.map((inner_row) => inner_row[column_index]));
        // Mean of all the items in this column.
        this.columns_u[column_index] = this.columns_sum[column_index] / matrix2D.length;
        const std_dev_inside = matrix2D.map((inner_row) => Math.abs(inner_row[column_index] - this.columns_u[column_index]) ** 2);
        // Variance of all the items in this column.
        this.columns_variance[column_index] = sum(std_dev_inside) / matrix2D.length;
        this.columns_std[column_index] = Math.sqrt(this.columns_variance[column_index]);
    }
    updateColumnsProps() {
        const matrix2D = this.unscaled_matrix
        for (let column_index = 0; column_index < matrix2D[0].length; column_index++) {
            this.updateColumnProps(column_index, matrix2D)
        }

        return {
            columns_sum: this.columns_sum,
            columns_u: this.columns_u,
            columns_variance: this.columns_variance,
            columns_std: this.columns_std,
        }
    }
}

export default std_scaler;