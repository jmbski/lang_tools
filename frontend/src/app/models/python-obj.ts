import { exists, isFunction, isString, isWeakObject, TypeGuard } from 'warskald-ui/type-guards';
import { GenericFunction, KeyOf, toCamelCase, WeakObject } from 'warskald-ui/models';
import { toSnakeCase } from '../services/utils';
import { AppSettings } from '../app.config';
import { BehaviorSubject } from 'rxjs';
import { AppSettingsConfig, AppSettingsInit } from './app-settings';

/**
 * Base class for objects that reflect a backend Python class
 */
export class PythonObj {

    [key: string]: unknown;

    /**
     * @returns a WeakObject representation of this object with keys in snake_case
     */
    public toPython(obj: unknown = this): WeakObject {
        return this._convertKeyCases(toSnakeCase, obj);
    }

    /**
     * @returns a WeakObject representation of this object with keys in camelCase
     */
    public toTypeScript(obj: unknown = this): WeakObject {
        return this._convertKeyCases(toCamelCase, obj);
    }

    public initAppSettings(initItems: AppSettingsInit[] | KeyOf<AppSettingsConfig>[]): void {

        initItems.forEach((init) => {
            if(isString(init)) {
                init = { appKey: init };
            }

            const { 
                appKey, 
                defaultValue, 
                noSubscribe, 
                propKey, 
                typeGuard 
            } = init;

            const appValue = AppSettings.getValue(appKey) ?? defaultValue;

            this._assignValue(propKey ?? appKey, appValue, typeGuard);

            if(!noSubscribe) {
                const observable = AppSettings.settings[appKey];
    
                if(observable instanceof BehaviorSubject) {
                    observable.subscribe((value) => {
                        this._assignValue(propKey ?? appKey, value, typeGuard);
                    });
                }
            }
        });
    }

    public initSelf(obj: unknown): WeakObject {
        const init = this.toTypeScript(this.toPython(obj));
        Object.keys(init).forEach((key) => {

            if(Object.hasOwn(this, key)) {
                this[key] = init[key];
            }
        });
        
        return init;
    }

    private _assignValue(key: string, value: unknown, typeGuard: TypeGuard<unknown> = exists): void {
        if(typeGuard(value)) {
            this[key] = value;
        }
    }

    private _convertKeyCases(caseFunct: GenericFunction<string> = toSnakeCase, obj: unknown = this): WeakObject {
        const newObj: WeakObject = {};
        if(isWeakObject(obj)) {
            Object.keys(obj).forEach((key) => {
                const newKey = caseFunct(key);
                const prop = obj[key];
                
                if(!isFunction(prop)) {
                    newObj[newKey] = prop;
                }
            });
        }

        return newObj;
    }
}