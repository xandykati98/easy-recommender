import { Vector1D, Vector2D } from 'math-types';
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
    constructor(args:Vector1D) {
        super(...args)
        this._id = ''
    }
    id(newId:string) {
        this._id = newId
        return this
    }
}

export class NamedVector2D extends Array<NamedVector1D> implements Vector2D {
    column_names:string[]
    constructor(args:Vector2D) {
        super(...args.map<NamedVector1D>(value => new NamedVector1D(value)))
        this.column_names = []
    }
    addColumnName(name:string) {
        return this.column_names.push(name)
    }
    get numberOfRows() {
        return this.length
    }
    get numberOfColumns() {
        return this.column_names.length
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
    
    constructor(matrix2D: Vector2D) {
        this.unscaled_matrix = new NamedVector2D(matrix2D);
        this.columns_u = []
        this.columns_variance = []
        this.columns_std = []
        this.columns_sum = []
        this.scaled_matrix = new NamedVector2D([]);
        this.rescaleMatrix()
    }
    /**
     * @todo add NamedVector2D column_names
     */
    async addRow(row:NamedVector1D, options?:{ updateColumnProps: boolean }) {
        this.unscaled_matrix.push(row)
        const scaled_row = new NamedVector1D([]).id(row._id);
        if (row.length > this.unscaled_matrix.numberOfColumns) {
            // new columns were added, probably by dummy variables
            
            let new_column_index = this.unscaled_matrix.numberOfColumns;
            for (const new_column_data_from_row of row.slice(this.unscaled_matrix.numberOfColumns, row.length)) {

                const new_column = new Array(this.unscaled_matrix.numberOfRows).fill(0);
                new_column.push(new_column_data_from_row)

                this.updateColumnProps(new_column_index, this.unscaled_matrix)

                // Adds a new value to every row in the place of the new column
                for (const unscaled_row of this.unscaled_matrix) {
                    unscaled_row[new_column_index] = new_column[new_column_index]
                }

                // scales the new column
                this.rescaleColumn(new_column_index)

                new_column_index++
            }
        }
        for (let index = 0; index < row.length; index++) {
            const item = row[index];
            scaled_row.push((item - this.columns_u[index]) / this.columns_std[index])
        }
        this.scaled_matrix.push(scaled_row)
        if (options?.updateColumnProps === false) return {
            columns_sum: this.columns_sum,
            columns_u: this.columns_u,
            columns_variance: this.columns_variance,
            columns_std: this.columns_std,
        }
        return this.updateColumnsProps()
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
            const scaled_row = new NamedVector1D([]).id(row._id);
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