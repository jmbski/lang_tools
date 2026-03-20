import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@app/environment';

import {
    GenWord,
    isGenWord,
    isGenWordArray,
    isLangConfigArray,
    isLangConfigPythonArray,
    isLexEntryPythonArray,
    isSynsetPython,
    isSynsetPythonArray,
    LangConfig,
    LexEntry,
    LocalObject,
    RequestData,
    ResponseError,
    Synset,
    WordGenConfig
} from '@app/models';
import { WeakObject } from 'warskald-ui/models';
import { DataService } from 'warskald-ui/services';
import { isArray, isString, isStringArray, isWeakObject, isWeakObjectArray } from 'warskald-ui/type-guards';

export function isTxSvc(obj: unknown): obj is TransactionService {
    return obj instanceof TransactionService;
}

//export function wrapData(): RequestData;
@Injectable({ providedIn: 'root' })
export class TransactionService implements LocalObject {
    public readonly LOCAL_ID: string = 'transaction-service';

    // #region public properties
    public base_url = environment.production ? location.origin + '/services/' : 'http://localhost:5000/services/';
    // #endregion public properties


    // #region private properties

    // #endregion private properties


    // #region getters/setters

    // #endregion getters/setters


    // #region standard inputs

    // #endregion standard inputs


    // #region get/set inputs

    // #endregion get/set inputs


    // #region outputs, emitters, and event listeners

    // #endregion outputs, emitters, and event listeners


    // #region viewchildren and contentchildren

    // #endregion viewchildren and contentchildren


    // #region constructor and lifecycle hooks
    constructor(
        private http: HttpClient,
    ) {

    }
    // #endregion constructor and lifecycle hooks


    // #region public methods

    public configureHeaders(config?: unknown) {
        let requestOptions = {};

        if (config ?? false) {
            //TODO: convert input into HttpHeaders object
        }
        else {
            const headerDict = {
                'Content-Type': 'application/json',
                Accept: '*',
                'Access-Control-Allow-Headers': 'Content-Type',
            };

            requestOptions = {
                headers: new Headers(headerDict),
            };
        }

        return requestOptions;
    }

    public async test(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.http.get(this.base_url + 'test').subscribe((response?: unknown) => {
                if (response == null) {
                    reject('No response from server');
                    return;
                }
                if (typeof response === 'string') {
                    resolve(response);
                    return;
                }
                reject('Invalid response from server');
            });
        });
    }

    public async getLanguageConfigs(): Promise<LangConfig[]> {
        return new Promise((resolve, reject) => {
            this.http.get(this.base_url + 'get-lang-configs').subscribe((response?: unknown) => {
                if (response == null) {
                    reject('No response from server');
                    return;
                }

                if (isWeakObjectArray(response)) {
                    resolve(response.map((config) => new LangConfig(config)));
                    return;
                }
                reject('Invalid response from server');
            });
        });
    }

    /**
     * 
     * @deprecated
     * @returns 
     */
    public async getWords(amount: number = 50): Promise<string[]> {
        return new Promise((resolve, reject) => {
            this.http.get(this.base_url + 'get-words?amount=' + amount).subscribe({
                next: (response?: unknown) => {
                    if (response == null) {
                        reject('No response from server');
                        return;
                    }
                    if (isStringArray(response)) {
                        resolve(response);
                        return;
                    }
                    reject('Invalid response from server');
                },
                error: (error?: unknown) => {
                    reject(error);
                }
            });
        });
    }

    public async getSynsets(word: string): Promise<Synset[]> {
        return new Promise((resolve, reject) => {
            this.http.get(this.base_url + 'get-synsets?word=' + word).subscribe({
                next: (response?: unknown) => {
                    if (response == null) {
                        reject('No response from server');
                        return;
                    }

                    if (isSynsetPythonArray(response)) {
                        resolve(response.map((synset) => new Synset(synset)));
                        return;
                    }

                    reject('Invalid response from server');
                },
                error: (error?: unknown) => {
                    reject(error);
                }
            });
        });
    }

    /**
     * 
     * @deprecated
     */
    public async getSynset(word: string): Promise<Synset> {
        return new Promise((resolve, reject) => {
            this.http.get(this.base_url + 'get-synset?word=' + word).subscribe({
                next: (response?: unknown) => {
                    if (response == null) {
                        reject('No response from server');
                        return;
                    }

                    if (isSynsetPython(response)) {
                        resolve(new Synset(response));
                        return;
                    }

                    reject('Invalid response from server');
                },
                error: (error?: unknown) => {
                    reject(error);
                }
            });
        });
    }

    public async saveSynsets(synsets: Synset[]) {
        return new Promise((resolve, reject) => {
            const data = synsets.map((synset) => synset.toPython());
            // data = JSON.parse(JSON.stringify(synsets));
            this.http.post(this.base_url + 'save-synsets', data).subscribe({
                next: (response?: unknown) => {
                    if (response == null) {
                        reject('No response from server');
                        return;
                    }
                    if (isWeakObject(response)) {
                        resolve(response);
                        return;
                    }
                    reject('Invalid response from server');
                },
                error: (error?: unknown) => {
                    reject(error);
                }
            });
        });
    }

    public async getBaseWords(): Promise<string[]> {
        console.log('origin:', location.origin);
        return new Promise((resolve, reject) => {
            this.http.get(this.base_url + 'get-base-words').subscribe({
                next: (response?: unknown) => {
                    if (response == null) {
                        reject('No response from server');
                        return;
                    }
                    if (isStringArray(response)) {
                        resolve(response);
                        return;
                    }
                    reject('Invalid response from server');
                },
                error: (error?: unknown) => {
                    reject(error);
                }
            });
        });
    }

    public async genConlangWord(options: WordGenConfig): Promise<GenWord> {
        return new Promise((resolve, reject) => {
            const { langConfigId, minimum, maximum, syllables } = options;
            let uri = `${this.base_url}gen-conlang-word?langConfigId=${langConfigId}&minimum=${minimum}&maximum=${maximum}`;
            if (syllables) {
                uri += `&syllables=${syllables}`;
            }
            this.http.get(uri).subscribe({
                next: (response?: unknown) => {
                    if (response == null) {
                        reject('No response from server');
                        return;
                    }
                    if (isGenWord(response)) {
                        resolve(response);
                        return;
                    }
                    const reason: ResponseError = {
                        message: 'Invalid response from server',
                        response,
                    };
                    reject(reason);
                },
                error: (error?: unknown) => {
                    reject(error);
                }
            });
        });
    }

    public genConlangWords(langConfigId: number, amount: number = 20, syllables?: number, minimum: number = 1, maximum: number = 3): Promise<GenWord[]> {
        return new Promise((resolve, reject) => {

            let uri = `${this.base_url}gen-conlang-words?langConfigId=${langConfigId}&amount=${amount}&minimum=${minimum}&maximum=${maximum}`;
            if (syllables) {
                uri += `&syllables=${syllables}`;
            }

            this.http.get(uri).subscribe({
                next: (response?: unknown) => {
                    if (response == null) {
                        reject('No response from server');
                        return;
                    }
                    if (isWeakObjectArray(response)) {

                        if (isGenWordArray(response)) {
                            resolve(response);
                            return;
                        }
                        return;
                    }
                    reject('Invalid response from server');
                },
                error: (error?: unknown) => {
                    reject(error);
                }
            });
        });
    }

    public async genWordsByLangConfig(langConfig: LangConfig, amount: number = 20, syllables?: number, minimum: number = 1, maximum: number = 3): Promise<GenWord[]> {
        return new Promise((resolve, reject) => {
            const requestData = {
                langConfig: langConfig.toPython(),
                amount,
                syllables,
                minimum,
                maximum,
            };
            this.http.post(this.base_url + 'langconfig-gen-words', requestData).subscribe({
                next: (response?: unknown) => {
                    if (response == null) {
                        reject('No response from server');
                        return;
                    }
                    if (isGenWordArray(response)) {
                        resolve(response);
                        return;
                    }
                    reject('Invalid response from server');
                },
                error: (error?: unknown) => {
                    reject(error);
                }
            });
        });
    }

    public async getLexicon(langConfigId: number): Promise<LexEntry[]> {
        return new Promise((resolve, reject) => {
            this.http.get(this.base_url + 'get-lexicon?langConfigId=' + langConfigId).subscribe({
                next: (response?: unknown) => {
                    if (response == null) {
                        reject('No response from server');
                        return;
                    }
                    if (isLexEntryPythonArray(response)) {
                        resolve(response.map((entry) => new LexEntry(entry)));
                        return;
                    }
                    reject('Invalid response from server');
                },
                error: (error?: unknown) => {
                    reject(error);
                }
            });
        });
    }

    public async deleteSynset(synsetDbId: number): Promise<unknown> {
        return new Promise((resolve, reject) => {
            this.http.delete(this.base_url + 'delete-synset?synsetDbId=' + synsetDbId).subscribe({
                next: (response?: unknown) => {
                    if (response == null) {
                        reject('No response from server');
                        return;
                    }
                    if (isWeakObject(response)) {
                        resolve(response);
                        return;
                    }
                    reject('Invalid response from server');
                },
                error: (error?: unknown) => {
                    reject(error);
                }
            });
        });
    }

    public async saveLexEntry(entry: LexEntry): Promise<unknown> {

        const requestData = entry.parseLexEntry();

        return new Promise((resolve, reject) => {
            this.http.post(this.base_url + 'save-lex-entry', requestData).subscribe({
                next: (response?: unknown) => {
                    if (response == null) {
                        reject('No response from server');
                        return;
                    }
                    if (isWeakObject(response)) {
                        resolve(response);
                        return;
                    }
                    reject('Invalid response from server');
                },
                error: (error?: unknown) => {
                    reject(error);
                }
            });
        });
    }

    public async saveLangConfig(requestData: WeakObject): Promise<unknown> {
        //const requestData = config.toPython();

        return new Promise((resolve, reject) => {
            this.http.post(this.base_url + 'save-lang-config', requestData).subscribe({
                next: (response?: unknown) => {
                    if (response == null) {
                        reject('No response from server');
                        return;
                    }
                    if (isWeakObject(response)) {
                        resolve(response);
                        return;
                    }
                    reject('Invalid response from server');
                },
                error: (error?: unknown) => {
                    reject(error);
                }
            });
        });
    }

    // #endregion public methods


    // #region protected methods

    // #endregion protected methods


    // #region private methods

    // #endregion private methods


}