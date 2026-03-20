import { Injectable } from '@angular/core';

@Injectable()
export class Extensions {}

export type StringFormat = 'camel' | 'snake' | 'capitalize-first' | 'capitalize' | 'label' | 'hyphenated';

declare global {
    export interface String {
        toFormat(format: StringFormat): string;
        ReplaceAll(stringToReplace: string | RegExp, replaceWith: string): string;
    }
}

String.prototype.toFormat = function (this: string, format: StringFormat): string {
    let result: string = '';
    switch (format) {
        case 'camel':
            break;
        case 'snake':
            break;
        case 'capitalize-first':
            break;
        case 'capitalize':
            result = ToCapitalized(this);
            break;
        case 'label':
            result = ToLabelCase(this);
            break;
        case 'hyphenated':
            result = ToHyphenated(this);
            break;
    }
    return result;
};

String.prototype.ReplaceAll = function (this: string, strToReplace: string | RegExp, replaceWith: string): string {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const result: string = StrReplaceAll(this, strToReplace, replaceWith);
    return result;
};

export function StrReplaceAll(input: string, strToReplace: string | RegExp, replaceWith: string): string {
    let result: string = input;
    if (strToReplace !== replaceWith) {
        if(typeof strToReplace === 'string') {
            while (result.includes(strToReplace)) {
                result = result.replace(strToReplace, replaceWith);
            }
        }
        else {
            result = result.replace(strToReplace, replaceWith);
        
        }
    }
    return result;
}

export function ToCapitalized(input: string) {
    const labelString: string = ToLabelCase(input);
    let newString: string = '';

    for (let i = 0; i < labelString.length; i++) {
        const char: string = labelString.charAt(i);
        if (i === 0) {
            newString += char;
        }
        else if (i > 0) {
            const previousChar: string = labelString.charAt(i - 1);
            if (previousChar === ' ') {
                newString += char.toUpperCase();
            }
            else {
                newString += char;
            }
        }
    }
    return newString;
}

export function ToCamelCase(input: string): string {
    const result: string = input;

    return result;
}

export function ToHyphenated(value: string) {
    return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

export function isChar(input: string): boolean {
    const charList: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const result: boolean = charList.includes(input);
    return result;
}

export function ToLabelCase(str: string): string {
    // Remove all non-word characters (like hyphens and underscores) and replace camel cased words
    const labelCase = str.replace(/[\W_]+(.)/g, ' $1').replace(/([a-z\d])([A-Z])/g, '$1 $2');
  
    // Split the string into words
    const words = labelCase.split(' ');
  
    // Capitalize the first letter of each word and join back into a string
    const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    return capitalizedWords;
}
