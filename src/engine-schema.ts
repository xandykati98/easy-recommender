export class Id {}
export class DummyVariable {}
export class TfIdf {}

export interface EngineSchema {
    [field_name: string]: Number | Id | DummyVariable | TfIdf
}

export function ValidateSchema(data: any, schema: EngineSchema):boolean {
    for (const field in schema) {
        if (!(field in data)) return false
    }
    return true
}

export function needDummies(schema: EngineSchema):boolean {
    for (const field in schema) {
        if (schema[field] === DummyVariable || schema[field] === TfIdf) return false
    }
    return true
}