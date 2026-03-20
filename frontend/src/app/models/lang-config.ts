import { ComponentConfig, ElementType, WeakObject } from 'warskald-ui/models';
import { BooleanProp, isArray, NumberProp, objIsType, StringProp, TypeMapping, WeakObjectProp } from 'warskald-ui/type-guards';
import { PythonObj } from './python-obj';
import { nanoid } from 'nanoid';

export interface LangConfigPython {
    lang_config_id: number;
    name: string;
    phonetic_inventory: Record<string, string>;
    orthography_categories: Record<string, string[]>;
    orth_syllables: Record<string, number>;
    grapheme_lookup: Record<string, string>;
    debug: boolean;
}

const LangConfigProperties: TypeMapping<WeakObject> = {
    langConfigId: NumberProp,
    name: StringProp,
    debug: BooleanProp,
    phoneticInventory: WeakObjectProp,
    orthographyCategories: WeakObjectProp,
    orthSyllables: WeakObjectProp
};

export function isLangConfigPython(obj: unknown): obj is LangConfigPython {
    return objIsType(obj, ['lang_config_id', 'phonetic_inventory', 'orthography_categories', 'orth_syllables']);
}

export function isLangConfigPythonArray(obj: unknown): obj is LangConfigPython[] {
    return isArray(obj) && obj.every((item) => isLangConfigPython(item));
}

export function isLangConfig(obj: unknown): obj is LangConfig {
    return obj instanceof LangConfig || objIsType(obj, LangConfigProperties);
}

export function isLangConfigArray(obj: unknown): obj is LangConfig[] {
    return isArray(obj) && obj.every((item) => isLangConfig(item));
}

export interface GenWord {
    word: string;
    ipa: string;
}

export function isGenWord(obj: unknown): obj is GenWord {
    return objIsType(obj, ['word', 'ipa']);
}

export function isGenWordArray(obj: unknown): obj is GenWord[] {
    return isArray(obj) && obj.every((item) => isGenWord(item));
}

export class LangConfig extends PythonObj {

    /**
     * The language configuration ID.
     */
    public langConfigId: number = 0;

    /**
     * The name of the language.
     */
    public name: string = '';

    /**
     * A dictionary whose keys are graphemes and values are IPA phonemes.
     */
    public phoneticInventory: Record<string, string> = {};

    /**
     * A dictionary whose keys are category IDs and values are lists of graphemes. 
     * This is based on the word generators used by many conlang tools that use
     * individual capital letters to represent categories of graphemes, but allowing 
     * for more flexibility because you can use any valid dictionary key type. 
     * Such as a string, tuple, or number.
     */
    public orthographyCategories: Record<string, string[]> = {};

    /**
     * A dictionary whose keys are combinations of orthographic IDs and values are the syllable weight. 
     * A higher syllable weight means the syllable is more likely to appear in the language. These are
     * used to generate syllables for the language.
     *      
     * Valid key types for generating syllables are strings or tuples.
     */
    public orthSyllables: Record<string, number> = {};

    /**
     * A dictionary whose keys are IPA phonemes and values are matching graphemes. 
     * Effectively the reverse of phonetic_inventory, but allowing you to make custom
     * changes if desired. Will be generated automatically if not provided. 
     */
    public graphemeLookup: Record<string, string> = {};

    /**
     * A flag indicating whether to print debug information.
     */
    public debug: boolean = false;

    constructor(init?: LangConfigPython | LangConfig | WeakObject) {
        super();
        this.initSelf(init);
        this.generateGraphemeLookup();

    }

    /**
     * Generate the grapheme lookup dictionary.
     */
    public generateGraphemeLookup() {
        this.graphemeLookup = {};
        Object.keys(this.phoneticInventory).forEach((phoneme) => {
            const grapheme = this.phoneticInventory[phoneme];
            this.graphemeLookup[grapheme] = phoneme;
        });
    }
    
    public generateFormElements() {
        const elements: ComponentConfig[] = [
            {
                elementType: ElementType.INPUT_NUMBER,
                hasForm: true,
                id: 'lang_config_id',
                label: 'Language Config ID',
                options: {
                    disabled: true,
                },
                layoutStyles: {
                    baseClass: 'col-4'
                }
            },
            {
                elementType: ElementType.INPUT_TEXT,
                hasForm: true,
                id: 'lang_name',
                label: 'Language Name',
                layoutStyles: {
                    baseClass: 'col-6'
                }
            },
        ];
    }
}