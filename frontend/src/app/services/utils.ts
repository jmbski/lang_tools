import {
    isLangConfig,
    isLangConfigArray,
    isWordGenConfig,
    LangConfig,
    LexEntry,
    LocalObject,
    WordGenConfig,
} from '@app/models';
import { round } from 'lodash';
import { AppSettings } from '../app.config';
import { isNumber } from 'warskald-ui/type-guards';
import { DataService, DialogManagerService } from 'warskald-ui/services';
import { ComponentConfig, ElementType } from 'warskald-ui/models';
import { getFormDialog } from 'warskald-ui/components';

export class Utils implements LocalObject {
    public readonly LOCAL_ID: string = 'utils';
    
    public static printMap(map: Map<unknown, unknown>): void {
        for (const [key, value] of map.entries()) {
            console.log(key, value);
        }
    }

    public static compareStrings(a: string, b: string, threshold: number = 0.7): boolean {
        a = a.toLowerCase().replace(/\s/g, '');
        b = b.toLowerCase().replace(/\s/g, '');
      
        if (a === b) return true;
      
        const setA = new Set(a.split(''));
        const setB = new Set(b.split(''));
      
        const intersection = new Set([...setA].filter(x => setB.has(x)));
      
        // calculate Jaccard similarity
        const similarity = intersection.size / (setA.size + setB.size - intersection.size);
      
        return similarity >= threshold;
    }
}

export function getCurrentLangConfig(): void {

    const currentLangConfigID = AppSettings.getValue('currentLangConfigID') ?? 1;
    if(isNumber(currentLangConfigID)) {
        const langConfigs = DataService.getDataSourceValue('langConfigs');
        if(isLangConfigArray(langConfigs)) {
            const currentConfig = langConfigs.find((config) => config.langConfigId === currentLangConfigID);
            if(isLangConfig(currentConfig)) {
                AppSettings.setValue('currentLangConfig', currentConfig);

            }
        }
    }
}

export function toSnakeCase(str: string): string {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : '_' + word.toLowerCase();
    }).replace(/\s+/g, '');
}

export function getWordConfigForm(config: WordGenConfig, disableCount: boolean = true) {
    const dialogMgr = AppSettings.getValue('dialogMgr');
    if(dialogMgr instanceof DialogManagerService) {
        const elements = Object.keys(config).map((key) => {
            
            return <ComponentConfig>{
                elementType: ElementType.INPUT_NUMBER,
                id: key,
                hasForm: true,
                disabled: key === 'langConfigId' || (key === 'count' && disableCount),
                label: key.toFormat('label'),
                value: config[key],
                layoutStyles: {
                    baseClass: 'flex flex-column align-items-center w-full'
                },
                options: {
                    styleClass: 'w-full',
                    min: 0,
                    showButtons: true,
                    buttonLayout: 'horizontal',
                    incrementButtonIcon: 'pi pi-plus',
                    decrementButtonIcon: 'pi pi-minus',
                }
            };
        }).filter((item) => item !== undefined) as ComponentConfig[];
    
        const { form, options } = getFormDialog('Word Generation Configuration', elements);
    
        const dialogRef = dialogMgr?.openModularDialog(options);
    
        dialogRef?.onSubmit.subscribe(() => {
            const settings = form.value;
            settings.langConfigId = config.langConfigId;
            if(isWordGenConfig(settings)) {
                Object.assign(config, settings);
            }
        });
    }
}