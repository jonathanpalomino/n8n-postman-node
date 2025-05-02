export interface BodyParameter {
    mode?: string
    raw?: string
    options?: Options
    formdata? : Parameter[]
}

export interface Options {
    raw: Raw
}

export interface Raw {
    headerFamily: string
    language: string
}

export interface Parameter {
    key: string
    value: string
}