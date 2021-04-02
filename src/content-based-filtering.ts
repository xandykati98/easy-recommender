import { cumulative_std_scaler as CumulativeStdScaler, NamedVector1D } from "@math/std_scaler"
import { InputData, Vector1D } from "math-types"
import { DummyVariable, EngineSchema, Id, needDummies, RemoveUnnecessaryFields, ValidateSchema } from "./engine-schema"
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
    /**
     * The schema of the data, only data points that 
     */
    readonly schema: EngineSchema
    /**
     * @returns An object containing all the features (not including id) and its types
     */
    readonly fields: Fields
    /**
     * @returns An object relating every feature to its corresponding wheight, all wheights are 1 by default
     */
    private _wheights: Wheights
    /**
     * @returns The name of the identifier for the data points
     */
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
        this.fields = {}
        this._wheights = {};
        this.id_field = '';
        this.dummy_variables = {}

        for (const [ field_name, value ] of Object.entries(this.schema)) {
            if (value === Id) {
                this.id_field = field_name;
            } else {
                if (value === DummyVariable) {
                    this.dummy_variables[field_name] = []
                }
                this.fields[field_name] = value
                this._wheights[field_name] = 1
            }
        }

        if (!this.id_field) {
            throw console.log('Something will go wrong. You didn\'t provide an ID field for the schema.', this.schema)
        }

        this.validators = new CallbackArray()
        this.transformers = new CallbackArray()
        this.pipeline = [
            ...this.transformers,
            (data:any) => ValidateSchema(data, this.schema),
            (data:any) => RemoveUnnecessaryFields(data, this.schema),
            ...this.validators,
        ]
        this.std_scaler = new CumulativeStdScaler([], this.schema)
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
    /**
     * @deprecated Do not use this, it may look good but the validators are in the end of the callback chain for a reason
     */
    reversePipeline() {
        return this.pipeline.reverse()
    }
    /**
     * Adds a single unscaled vector to the std_scaler
     */
    private addSingleVector(vec:NamedVector1D, vec_indexed_columns:string[]) {
        return this.std_scaler.addRow(vec, vec_indexed_columns)
    }
    private addSingleObject(data:any) {
        let transform_data = { ...data };
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
            // This schema uses binary dummy variables or tf-idf, generate the variables for this data point
            // and, if necessary, add new dummy variables created by this data point to every other vector as 0 if it is a dummy variable
            // if it is a tf-idf compute the tf for every data point
        } else {
            // This schema doest use dummy variables nor tf-idf, just add the number vectors to the std_scaler
            const { [this.id_field]: data_id, ...pure_data } = transform_data;
            const vec = new NamedVector1D().id(data_id)
            const vec_indexed_columns:string[] = []

            for (const [ key, value ] of Object.entries<number>(pure_data)) {
                vec.push(value)
                vec_indexed_columns.push(key)
            }
            
            return this.addSingleVector(vec, vec_indexed_columns)
        }
    }
    addData(data: InputData | InputData[]) {
        if (Array.isArray(data)) {
            // Is it a 1D Vector?
            if (data.every(item => typeof item === 'number')) {
                // It is a 1D Vector, we cant add it directly to the std scaler without an ID!
                throw console.error('A Vector without and ID was provided to the "addData" method')
            } else {
                // It is not. However it may be a array of 1D Vectors, check for it
                if (data.every(item => Array.isArray(item) && item.every(sub_item => typeof sub_item === 'number') )) {
                    // Well, it seems to be an array of 1D Vectors, add every single one of them to the std scaler
                    throw console.error('An Array Vector without and ID was provided to the "addData" method')
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