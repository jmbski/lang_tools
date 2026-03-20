import { NgZone } from '@angular/core';
import { 
    StandardObject, 
    TypedRecord, 
} from '@app/models';
import { DialogManagerService } from 'warskald-ui/services';


export function IsStandardObject(obj: unknown): obj is StandardObject {
    return obj !== null && typeof obj === 'object' && !Array.isArray(obj) && Object.keys(obj).every(key => typeof key === 'string');
}

export function IsStandardObjectArray(obj: unknown): obj is StandardObject[] {
    return Array.isArray(obj) && obj.every(IsStandardObject);
}

export function IsTypedContainer<T>(obj: unknown, typeGuard: (obj: unknown) => obj is T): obj is TypedRecord<T> {
    return IsStandardObject(obj) && Object.values(obj).every(typeGuard);
}

export function IsTypedContainerArray<T>(obj: unknown, typeGuard: (obj: unknown) => obj is T): obj is TypedRecord<T>[] {
    return Array.isArray(obj) && obj.every(item => IsTypedContainer(item, typeGuard));
}

export type FunctionKeys<T> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

export function isFunctionKey<T>(obj: T, key: keyof T): key is FunctionKeys<T> {
    return typeof obj[ key ] === 'function';
}

export function isDialogMgr(obj: unknown): obj is DialogManagerService {
    return obj instanceof DialogManagerService;
}

export function isNgZone(obj: unknown): obj is NgZone {
    return obj instanceof NgZone;
}