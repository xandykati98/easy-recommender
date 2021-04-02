export class Id {}
export class DummyVariable {}
export class TfIdf {}

export interface EngineSchema {
    [field_name: string]: Number | Id | DummyVariable | TfIdf
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

export function needDummies(schema: EngineSchema):boolean {
    for (const field in schema) {
        if (schema[field] === DummyVariable || schema[field] === TfIdf) return true
    }
    return false
}