import { cumulative_std_scaler as CumulativeStdScaler } from "@math/std_scaler"
import { Vector1D } from "math-types"
import { EngineSchema, Id, needDummies, ValidateSchema } from "./engine-schema"
import { CallbackArray } from "./util"

interface Wheights {
    [field_name: string]: number
}
interface Fields {
    [field_name: string]: Id | number
}
interface EngineSettings {
    schema: EngineSchema
    isAdaptative?: boolean
    multiEntry?: boolean
    experimental_data_relation?: any[]
    transformFirst?: boolean
    validateFirst?: boolean
    logger?: boolean
    loggerMeta?: boolean
}

class ContentBasedEngine implements EngineSettings {
    readonly schema: EngineSchema
    readonly fields: Fields
    private _wheights: Wheights
    readonly id_field: string;
    validators: CallbackArray
    transformers: CallbackArray
    readonly pipeline: Function[]
    readonly std_scaler: CumulativeStdScaler
    readonly dummy_variables: {
        [field_name: string]: string[]
    }
    constructor(settings: EngineSettings) {
        this.schema = settings.schema
        const id_field_entry = Object.entries(this.schema).find(([_, value]) => value === Id)
        if (id_field_entry === undefined) {
            throw console.log('Something will go wrong. You didn\'t provide an ID field for the schema.', this.schema)
        }
        const [ id_field ] = id_field_entry
        this._wheights = {};
        this.id_field = id_field;
        this.fields = {
            ...this._wheights,
            [id_field]: Id
        };
        this.validators = new CallbackArray()
        this.transformers = new CallbackArray()
        this.pipeline = [
            ...this.transformers,
            (data:any) => ValidateSchema(data, this.schema),
            ...this.validators,
        ]
        this.std_scaler = new CumulativeStdScaler([])
        this.dummy_variables = {}
    }
    get wheights() {
        return this._wheights
    }
    set wheights(update:Wheights) {
        for (const field in update) {
            this._wheights[field] = update[field]
        }
    }
    viewPipeline() {
        return this.pipeline
    }
    reversePipeline() {
        return this.pipeline.reverse()
    }
    /**
     * Adds a single unscaled vector to the std_scaler
     */
    private addSingleVector(vec:Vector1D) {
        return this.std_scaler.addRow(vec)
    }
    private addSingleObject(data:any) {
        let transform_data = data;
        const pipeline = this.viewPipeline()
        for (const check of pipeline) {
            const result = check(transform_data)
            // Check if it is a validator
            if (typeof result === 'boolean') {
                if (result === false) throw console.error('One object was unable to pass in a validator', { validator: check, object: data })
            } else {
                // Else, it is a transformer
                transform_data = check(transform_data)
            }
        }
        /**
         * transform data is almost ready, it was compliant to the schema
         * next we will have to create the dummy variables for the data
         */
        if (needDummies(this.schema)) {
            // This schema use binary dummy variables or tf-idf, generate the variables for this data point
            // and, if necessary, add new dummy variables created by this data point to every other vector as 0 if it is a dummy variable
            // if it is a tf-idf compute the tf for every data point
        } else {
            // This schema doest use dummy variables nor tf-idf, just add the number vectors to the std_scaler
            delete transform_data[this.id_field];
            return this.addSingleVector(Object.values(transform_data))
        }
    }
    addData(data: any | any[]) {
        if (Array.isArray(data)) {
            // Is it a 1D Vector?
            if (data.every(item => typeof item === 'number')) {
                // It is a 1D Vector, standarize it and add it by adding it to the std scaler
                this.addSingleVector(data)
            } else {
                // Sadly it is not. However it may be a array of 1D Vectors, check for it
                if (data.every(item => Array.isArray(item) && item.every(sub_item => typeof sub_item === 'number') )) {
                    // Well, it seems to be an array of 1D Vectors, add every single one of them to the std scaler
                    for (const vector of data) {
                        this.addSingleVector(vector)
                    }
                } else {
                    // It is not a array of vectors. So it can only be an array of objects
                    for (const item of data) {
                        this.addSingleObject(item)
                    }
                }
            }
        } else {
            // It is neither a vector nor a array in any way. It must be a single object. Insert it into the pipeline
            this.addSingleObject(data)
        }
    }
}

export const cbf_engine = ContentBasedEngine