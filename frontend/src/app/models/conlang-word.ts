import { WeakObject } from 'warskald-ui/models';
import { PythonObj } from './_index';

export class ConlangWord extends PythonObj {
    public word: string = '';
    public wordId: number = 0;
    public wordIpa: string = '';
    public langConfigId: number = 0;

    constructor(init: ConlangWord | Partial<ConlangWord> | WeakObject = {}) {
        super();
        this.initSelf(init);
    }
}