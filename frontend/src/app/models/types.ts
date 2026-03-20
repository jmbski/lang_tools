import { TemplateRef, Type } from '@angular/core';

export type TypedRecord<T> = Record<string, T>;
export type StandardObject = TypedRecord<unknown>;

export interface SelectButtonItem {
    label: string;
    value: string;
}

export type ComponentType = string | Type<unknown> | TemplateRef<unknown>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GeneralFunction<T> = (...args: any[]) => T;

export type CssStyleObject = Partial<CSSStyleDeclaration>;

export interface LocalObject {
    readonly LOCAL_ID: string;
}

export interface ResponseError {
    error?: unknown;
    message?: string;
    response?: unknown;
}

export interface RequestData {
    content: unknown;

    [key: string]: unknown;
}

