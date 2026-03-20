import { DialogManagerService } from 'warskald-ui/services';
import { LangConfig } from './lang-config';
import { LexEntry, Lexicon } from './lex-entry';
import { TransactionService } from '../services/transaction-service';
import { NgZone } from '@angular/core';
import { TypeGuard } from 'warskald-ui/type-guards';
import { KeyOf } from 'warskald-ui/models';

export interface AppSettingsConfig {
    currentLangConfigID?: number;
    currentLangConfig?: LangConfig;
    dialogMgr?: DialogManagerService;
    currentLexicon?: LexEntry[];
    currentLexMap?: Lexicon;
    txSvc?: TransactionService;
    ngZone?: NgZone;
}

export interface AppSettingsInit {
    appKey: KeyOf<AppSettingsConfig>;
    propKey?: string;
    defaultValue?: unknown;
    noSubscribe?: boolean;
    typeGuard?: TypeGuard<unknown>;

    [key: string]: unknown;
}