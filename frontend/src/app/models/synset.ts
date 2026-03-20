import { WeakObject } from 'warskald-ui/models';
import { objIsType, OptionalNumberProp, StringArrayProp, StringProp, TypeMapping } from 'warskald-ui/type-guards';
import { PythonObj } from './_index';

export interface SynsetPython {
    eng_word: string;
    synset_id: string;
    db_id?: number
    pos: string;
    definition: string;
    examples: string[];
    lemmas: string[];
    hypernyms: string[];
    hyponyms: string[];
    meronyms: string[];
    holonyms: string[];
}

export function isSynsetPython(obj: unknown): obj is SynsetPython {
    return objIsType(obj, ['eng_word', 'synset_id']);
}

export function isSynsetPythonArray(obj: unknown): obj is SynsetPython[] {
    return Array.isArray(obj) && obj.every((item) => isSynsetPython(item));
}

const synsetProperties: TypeMapping<WeakObject> = {
    engWord: StringProp,
    synsetId: StringProp,
    dbId: OptionalNumberProp,
    pos: StringProp,
    definition: StringProp,
    examples: StringArrayProp,
    lemmas: StringArrayProp,
    hypernyms: StringArrayProp,
    hyponyms: StringArrayProp,
    meronyms: StringArrayProp,
    holonyms: StringArrayProp,
};

export function isSynset(obj: unknown): obj is Synset {
    return obj instanceof Synset || objIsType(obj, synsetProperties);
}

export function isSynsetArray(obj: unknown): obj is Synset[] {
    return Array.isArray(obj) && obj.every((item) => isSynset(item));
}

export class Synset extends PythonObj {
    public engWord: string = '';
    public synsetId: string = '';
    public dbId: number | null = null;
    public pos: string = '';
    public definition: string = '';
    public examples: string[] = [];
    public lemmas: string[] = [];
    public hypernyms: string[] = [];
    public hyponyms: string[] = [];
    public meronyms: string[] = [];
    public holonyms: string[] = [];

    constructor(init: SynsetPython | Synset) {
        super();
        this.initSelf(init);
    }
}