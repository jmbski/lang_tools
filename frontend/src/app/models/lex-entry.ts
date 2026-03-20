import { AbstractControl, FormGroup } from '@angular/forms';
import { ComponentConfig, ContainerConfig, ElementType, FunctionMap, InputTextConfig, KeyOf, MouseEventHandler, toCamelCase, WeakObject } from 'warskald-ui/models';
import { ArrayProp, exists, isArray, isCast, isFunction, isString, isStringArray, NumberProp, objIsType, OptionalNumberProp, StringProp, TypeMapping } from 'warskald-ui/type-guards';
import { GeneralFunction } from './types';
import { isTxSvc, TransactionService } from '../services/transaction-service';
import { AppSettings } from '../app.config';
import { DialogManagerService, FormService, PropertyChange } from 'warskald-ui/services';
import { AppSettingsConfig } from './app-settings';
import { cloneDeep } from 'lodash';
import { GenWord, LangConfig } from './lang-config';
import { ChangeDetectorRef, NgZone } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ElementRendererComponent, getFormDialog } from 'warskald-ui/components';
import { isSynset, isSynsetArray, Synset } from './synset';
import { PythonObj } from './python-obj';
import { isDialogMgr, isNgZone } from './type-guards';
import { ConlangWord } from './conlang-word';
import { getWordConfigForm } from '../services/utils';

export interface LexEntryPython {
    lang_config_id: number;
    word_id: number;
    word_ipa: string;
    word: string;
    definition: string;
    synset_id: string;
    db_id: number;
    pos: string;
    lemmas: string[];
    examples: string[];
    eng_word: string;
    hypernyms: string[];
    hyponyms: string[];
    holonyms: string[];
    meronyms: string[];
}

export function isLexEntryPython(obj: unknown): obj is LexEntryPython {
    return objIsType(obj, [ 'lang_config_id', 'word_id', 'word_ipa', 'word', 'definition', 'synset_id', 'db_id', 'pos', 'lemmas', 'examples', 'eng_word', 'hypernyms', 'hyponyms', 'holonyms', 'meronyms']);
}

export function isLexEntryPythonArray(obj: unknown): obj is LexEntryPython[] {
    return Array.isArray(obj) && obj.every((item) => isLexEntryPython(item));
}

const LexEntryProperties: TypeMapping<WeakObject> = {
    wordId: NumberProp,
    word: StringProp,
    wordIpa: StringProp,
    langConfigId: NumberProp,
    dbId: NumberProp,
    synsetId: StringProp,
    definition: StringProp,
    pos: StringProp,
    examples: ArrayProp,
    lemmas: ArrayProp,
    engWord: StringProp,
    hypernyms: ArrayProp,
    hyponyms: ArrayProp,
    holonyms: ArrayProp,
    meronyms: ArrayProp
};

export function isLexEntry(obj: unknown): obj is LexEntry {
    return obj instanceof LexEntry || objIsType(obj, LexEntryProperties);
}

export function isLexEntryArray(obj: unknown): obj is LexEntry[] {
    return Array.isArray(obj) && obj.every((item) => isLexEntry(item));
}

export interface LexEntryForm {
    form: FormGroup;
    elements: ComponentConfig[];
    actionMap?: FunctionMap;
    [key: string]: unknown;
}

export interface WordGenConfig {
    syllables?: number;
    minimum?: number;
    maximum?: number;
    count?: number;
    langConfigId: number;

    [key: string]: unknown;
}

const wordGenConfigProperties: TypeMapping<WordGenConfig> = {
    syllables: OptionalNumberProp,
    minimum: OptionalNumberProp,
    maximum: OptionalNumberProp,
    count: OptionalNumberProp,
    langConfigId: NumberProp
};

export function isWordGenConfig(obj: unknown): obj is WordGenConfig {
    return objIsType(obj, wordGenConfigProperties);
}

export const PoSLookup: Record<string, string> = {
    n: 'Noun',
    v: 'Verb',
    a: 'Adjective',
    r: 'Adverb',
    s: 'Satellite Adjective',
};

export interface LexEntryFormValues {
    conlangWordContainer: {
        word: string;
    },
    conlangIpaContainer: {
        wordIpa: string,
    },
    lemmas: {
        lemmas: string[],
    },
    hypernyms: {
        hypernyms: string[],
    },
    hyponyms: {
        hyponyms: string[],
    },
    holonyms: {
        holonyms: string[],
    },
    meronyms: {
        meronyms: string[],
    },
}

export type LexEntryFormMode = 'edit-word' | 'edit-def' | 'view';

/**
 * Represents a lexical entry.
 */
export class LexEntry extends PythonObj {
    // #region public properties
    
    
    /**
    * The word ID.
    */
    public wordId: number = 0;

    /**
     * The word.
     */
    public word: string = '';

    /**
     * The word's IPA pronunciation.
     */
    public wordIpa: string = '';

    /**
     * The language configuration ID.
     */
    public langConfigId: number = 0;

    /**
     * The database ID.
     */
    public dbId: number = 0;

    /**
     * The synset ID.
     */
    public synsetId: string = '';

    /**
     * The definition.
     */
    public definition: string = '';

    /**
     * The part of speech.
     */
    public pos: string = '';

    /**
     * Examples of the word in a sentence.
     */
    public examples: string[] = [];

    /**
     * Lemmas of the word.
     */
    public lemmas: string[] = [];

    /**
     * The English word.
     */
    public engWord: string = '';

    /**
     * Hypernyms of the word.
     */
    public hypernyms: string[] = [];

    /**
     * Hyponyms of the word.
     */
    public hyponyms: string[] = [];

    /**
     * Holonyms of the word.
     */
    public holonyms: string[] = [];

    /**
     * Meronyms of the word.
     */
    public meronyms: string[] = [];

    public worgGenConfig: WordGenConfig = {
        minimum: 1,
        maximum: 3, 
        syllables: 0,
        count: 1,
        langConfigId: this.langConfigId
        
    };


    [key: string]: unknown;
    
    // #endregion public properties
    
    
    // #region private properties

    private _txSvc?: TransactionService;

    private _originalForm!: Partial<LexEntry>;

    private _form: FormGroup = new FormGroup({});

    private _ngZone?: NgZone;
    
    private _wordListener$?: BehaviorSubject<string>;

    private _ipaListener$?: BehaviorSubject<string>;

    private _dialogMgr?: DialogManagerService;

    private _mode: 'view' | 'edit' = 'view';

    // #endregion private properties
    
    
    // #region getters/setters
    
    // #endregion getters/setters
    
    
    // #region outputs, emitters, and event listeners
    
    // #endregion outputs, emitters, and event listeners
    
    
    // #region constructor and lifecycle hooks

    constructor(init?: LexEntryPython | Partial<LexEntry>) {
        super();

        const initialState: WeakObject = this.initSelf(init);

        this.worgGenConfig = {
            minimum: 1,
            maximum: 3, 
            syllables: 0,
            count: 1,
            langConfigId: this.langConfigId
        };

        initialState.word ??= '';
        initialState.wordIpa ??= '';

        this._originalForm = cloneDeep(initialState);
        
        this._wordListener$ = new BehaviorSubject<string>(this.word);

        this._ipaListener$ = new BehaviorSubject<string>(this.wordIpa);

        this.initAppSettings([
            { appKey: 'txSvc', propKey: '_txSvc', typeGuard: isTxSvc },
            { appKey: 'ngZone', propKey: '_ngZone', typeGuard: isNgZone },
            { appKey: 'dialogMgr', propKey: '_dialogMgr', typeGuard: isDialogMgr }
        ]);
    }
    
    // #endregion constructor and lifecycle hooks
    
    
    // #region public methods

    public toForm(): LexEntryForm {
        const actionMap: FunctionMap = {
            addChar: (data?: WeakObject) => {
                const { target, char } = data ?? {};
                if(isString(target) && isString(char)) {
                    if(target === 'word') {
                        this.word ??= '';
                        this.word += char;
                        this._wordListener$?.next(this.word);
                        const ipa = langConfig.phoneticInventory[char];
                        if(ipa) {
                            this.wordIpa ??= '';
                            this.wordIpa += ipa;
                            this._ipaListener$?.next(this.wordIpa);
                        }
                    }
                    if(target === 'wordIpa') {
                        this.wordIpa ??= '';
                        this.wordIpa += char;
                        this._ipaListener$?.next(this.wordIpa);
                        const grapheme = langConfig.graphemeLookup[char];
                        if(grapheme) {
                            this.word ??= '';
                            this.word += grapheme;
                            this._wordListener$?.next(this.word);
                        }
                    }
                }
            }
        };

        const langConfig = AppSettings.getValue('currentLangConfig') as LangConfig;

        const genWordFunct: MouseEventHandler = async (event: MouseEvent) => {
            const genWord = await this._txSvc?.genConlangWord(this.worgGenConfig);
            const { word, ipa } = genWord ?? {};
            if(word && ipa) {
                this._updateWord(word, ipa);
            }
        };

        const resetWord: MouseEventHandler = (event: MouseEvent) => {
            const { word, wordIpa } = this._originalForm;
            if(isString(word) && isString(wordIpa)) {
                this._updateWord(word, wordIpa);
            }
        };

        const elements: ComponentConfig[] = [
            FormService.getStandardContainer({ label: 'Conlang Word', id: 'conlangWordContainer', elements: [
                FormService.getTextElement('word', this.word, 'col-8', false, undefined, this._getListener('word')),
                FormService.getIconButton('gen-conlang', 'fa-solid fa-dice', 'col-1', genWordFunct),
                FormService.getCustomKeysElement('conlangKeyboard', 'word', langConfig.phoneticInventory, '', 'fas fa-keyboard', 'col-1'),
                FormService.getIconButton('wordGenConfig', 'fa-solid fa-cog', 'col-1', () => getWordConfigForm(this.worgGenConfig, true)),
                FormService.getIconButton('reset-conlang', 'fa-solid fa-undo', 'col-1', resetWord),
            ]}),
            FormService.getStandardContainer({ label: 'Conlang IPA', id: 'conlangIpaContainer', elements: [
                FormService.getTextElement('wordIpa', this.wordIpa, 'col-9', false, undefined, this._getListener('wordIpa')),
                FormService.getCustomKeysElement('ipaKeyboard', 'wordIpa', langConfig.graphemeLookup),
                FormService.getIconButton('reset-conlang-ipa', 'fa-solid fa-undo', 'col-1', resetWord),
            ]}),
            FormService.getStandardContainer({ label: 'Definition', id: 'definitionContainer', elements: [
                {
                    elementType: ElementType.TEXT_AREA,
                    id: 'definition',
                    hasForm: true,
                    disabled: true,
                    value: this.definition,
                    layoutStyles: {
                        baseClass: 'col-12'
                    },
                    baseStyles: {
                        baseClass: 'w-full'
                    }
                }
            ]}),
            FormService.getStandardContainer({ label: 'Word Info', id: 'wordInfoContainer', elements: [
                FormService.getTextElement('pos', this.pos, 'col-3 p-1', true, 'Part of Speech', this._getListener('pos')),
                FormService.getTextElement('engWord', this.engWord, 'col-5 p-1', true, 'English Word', this._getListener('engWord')),
                FormService.getTextElement('synsetId', this.synsetId, 'col-4 p-1', true, 'Synset ID', this._getListener('synsetId')),
            ]}),
            FormService.getStandardContainer({ label: 'Examples', id: 'examplesContainer', 
                elements: this.examples.map((example, index) => {
                    return {
                        elementType: ElementType.INPUT_TEXT,
                        id: `example-${index}`,
                        hasForm: true,
                        value: example,
                        disabled: true,
                        baseStyles: {
                            baseClass: 'w-full'
                        },
                    };
                })
            }),
            this._getListElement('lemmas'),
            this._getListElement('hypernyms'),
            this._getListElement('hyponyms'),
            this._getListElement('holonyms'),
            this._getListElement('meronyms')
        ];
        
        
        const formResult: LexEntryForm = {
            form: this._form,
            elements,
            actionMap,
        };

        return formResult;
    }

    public parseLexEntry(): WeakObject {
        const conlangWord = new ConlangWord(this).toPython();

        const synset = new Synset(this).toPython();

        const langConfigId = this.langConfigId;
        
        const contents: WeakObject = {
            conlangWord,
            synset,
            langConfigId
        };
        return contents;
    }
    
    // #endregion public methods
    
    
    // #region protected methods
    
    // #endregion protected methods
    
    
    // #region private methods

    private _getListElement(propName: string) {
        const propValue = this[propName];
        const elements: ComponentConfig[] = [];
        if(isStringArray(propValue)) {
            elements.push({
                elementType: ElementType.CLICKABLE_LIST,
                id: propName,
                hasForm: true,
                clickHandler: (item: string, event: MouseEvent) => {
                    this._txSvc?.getSynsets(item).then((synset) => {
                        if(isSynsetArray(synset)) {
                            this._handleLinkClick(synset);
                        }
                    });
                },
                value: propValue,
                orientation: 'vertical'
            });
        }

        return FormService.getStandardContainer({label: propName.toFormat('label'), id: propName, elements});

    }

    private _handleLinkClick(synset: Synset[]) {
        
    }

    private _getListener(propName: string) {
        if(propName === 'word') {
            return this._wordListener$;
        }
        
        if(propName === 'wordIpa') {
            return this._ipaListener$;
        }

        return undefined;
    }

    private _updateWord(word: string, wordIpa: string) {
        this.word = word;
        this.wordIpa = wordIpa;
        this._ngZone?.run(() => {
            this._wordListener$?.next(word);
            this._ipaListener$?.next(wordIpa);
        });
    }
    
    // #endregion private methods
}

export type Lexicon = Map<number, LexEntry>;