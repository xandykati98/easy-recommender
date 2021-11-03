export class Id {}
export class DummyVariable {}
export class TfIdf {}

export interface EngineSchema {
    [field_name: string]: Number | Id | DummyVariable | TfIdf
}

export interface CBFQueryOptions {
    /**
     * Maximum number of results within threshold
     */
    limit?: number, 
    /**
     * A number between 1 and -1, if the similarity between the input and the item that the input is being compared to is lower than the threshold the item will not be returned.
     */
    threshold?: number
}

export type DummyEntry = { 
    /**
     * Dummy column name
     */
    key: string, 
    value: string 
}

export function ValidateSchema(data: any, schema: EngineSchema):boolean {
    for (const field in schema) {
        if (!(field in data)) return false
    }
    return true
}

export function RemoveUnnecessaryFields(data: any, schema: EngineSchema):any {
    let copy_data = { ...data }
    for (const field in copy_data) {
        if (!(field in schema)) delete copy_data[field]
    }
    return copy_data
}

export interface Wheights {
    [field_name: string]: number
}

export function needDummies(schema: EngineSchema):boolean {
    for (const field in schema) {
        if (schema[field] === DummyVariable || schema[field] === TfIdf) return true
    }
    return false
}