
import { FormGroup } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ListboxModule } from 'primeng/listbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { PanelModule } from 'primeng/panel';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ElementRendererComponent, getFormDialog, MenuBarComponent, MenuBarConfig } from 'warskald-ui/components';
import { ClickableListConfig, ComponentConfig, ContainerConfig, DictionaryConfig, ElementType, MouseEventHandler, PageLayoutConfig, PanelConfig, WeakObject } from 'warskald-ui/models';
import { DataService, DialogManagerService, FormService, ModularDialogConfig, ToastService } from 'warskald-ui/services';
import { AppSettings } from '../app.config';
import { GenWord, isLangConfig, isLangConfigArray, LangConfig } from '../models/lang-config';
import { SelectItem } from 'primeng/api';
import { isNumber, isStringArray, isWeakObject } from 'warskald-ui/type-guards';
import { BehaviorSubject } from 'rxjs';
import { getCurrentLangConfig } from '../services/utils';
import { nanoid } from 'nanoid';
import { TransactionService } from '../services/transaction-service';
import { cloneDeep, isString } from 'lodash';

export const COMMON_PRIME_MODULES = [
    ButtonModule,
    CardModule,
    CheckboxModule,
    DropdownModule,
    InputNumberModule,
    InputTextModule,
    InputTextareaModule,
    ListboxModule,
    MultiSelectModule,
    PanelModule,
    RadioButtonModule,
    SelectButtonModule,
    ToastModule,
    ToolbarModule,
    TooltipModule,
];

export interface AppDeviceSettings {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
}
export const AppDeviceInfo: AppDeviceSettings = {
    isMobile: false,
    isTablet: false,
    isDesktop: false,
};

export function GetLangConfigDialogOptions() {
    const langConfigs = DataService.getDataSourceValue('langConfigs');

    const dialogMgr = AppSettings.getValue('dialogMgr');

    const formGroup: FormGroup = new FormGroup({});

    if (dialogMgr instanceof DialogManagerService) {
        let options: ModularDialogConfig = {
            header: 'No Language Detected',
            content: 'UI to auto-build new language config is WIP',
            dialogID: 'lang-config-dialog',
            allowMultiple: false,
            appendTo: 'body',
            showSubmitButton: false,
        };


        if (isLangConfigArray(langConfigs)) {

            const langOptions: SelectItem[] = langConfigs.map((config) => {
                return {
                    label: config.name,
                    value: config.langConfigId
                };
            });

            const currentID = AppSettings.getValue('currentLangConfigID');

            options = {
                header: 'Choose Language Config',
                dialogID: 'lang-config-dialog',
                allowMultiple: false,
                appendTo: 'body',
                modal: true,
                content: ElementRendererComponent,
                contentData: <ContainerConfig>{
                    elementType: ElementType.CONTAINER,
                    id: 'lang-config-dialog-content',
                    hasForm: true,
                    form: formGroup,
                    elements: [
                        {
                            elementType: ElementType.DROPDOWN,
                            hasForm: true,
                            id: 'langConfigId',
                            label: 'Language',
                            optionValues: langOptions,
                            layoutStyles: {
                                baseClass: 'col-12'
                            },
                            options: {
                                appendTo: 'body',
                                style: {
                                    width: '100%'
                                },
                            },
                            baseStyles: {
                                baseClass: 'w-full'
                            },
                            onChangeHandler: (event: unknown) => {
                                console.log(event);
                            },
                            value: currentID
                        }
                    ]
                },
                styles: {
                    style: {
                        minWidth: '70vw',
                    }
                },
                minimizable: false
            };
        }

        const ref = dialogMgr.openModularDialog(options);
        if (ref) {
            ref.onSubmit.subscribe((data: unknown) => {
                const { langConfigId } = formGroup.value;
                if (isNumber(langConfigId)) {
                    AppSettings.setValue('currentLangConfigID', langConfigId);
                    getCurrentLangConfig();
                    const langConfig = AppSettings.getValue('currentLangConfig');
                    if (isWeakObject(langConfig) && isString(langConfig.name)) {
                        AppSettings.updateValue('currentLexicon');
                        ToastService.showSuccess(`Language Config changed to ${langConfig.name}`, 'Success!');
                    }
                }
            });
        }
    }
}

export function getListElement(label: string, value: string[], options?: Partial<ClickableListConfig>) {
    //const propValue = this[propName];
    const elements: ComponentConfig[] = [];
    if (isStringArray(value)) {
        const clickableList: ClickableListConfig = {
            elementType: ElementType.CLICKABLE_LIST,
            id: label,
            hasForm: true,
            value: value,
            orientation: 'vertical'
        };
        if (options) {
            Object.assign(clickableList, options);
        }
        elements.push(clickableList);
    }

    return FormService.getStandardContainer({ label: label.toFormat('label'), id: label, elements });

}

export function getLangConfigSettingsDialog() {
    const langConfig = cloneDeep(AppSettings.getValue('currentLangConfig'));
    const dialogMgr = AppSettings.getValue('dialogMgr');

    if (isLangConfig(langConfig) && dialogMgr instanceof DialogManagerService) {
        const { phoneticInventory, orthographyCategories, orthSyllables } = langConfig;

        const pInventory = FormService.getDictionaryForm({
            value: phoneticInventory, label: 'Phonetic Inventory',
            id: 'phoneticInventory',
            options: {
                keyLabel: 'Grapheme',
                valueLabel: 'Phoneme',
                keyTooltip: 'Graphic character representation of the phoneme',
                valueTooltip: 'Phonetic symbol for the grapheme (IPA)',
                usePanel: true,
                initialType: 'string',
                enableTypeSelection: false,
                options: {
                    collapsed: true
                },
            }
        });


        const oCategories = FormService.getDictionaryForm({
            value: orthographyCategories, label: 'Orthographic Categories',
            id: 'orthographyCategories',
            options: {
                keyLabel: 'Category',
                valueLabel: 'Graphemes',
                keyTooltip: 'Character that represents a grouping of graphemes',
                valueTooltip: 'List of graphemes that belong to the category',
                usePanel: true,
                layoutStyles: {
                    baseClass: 'col-12'
                },
                initialType: 'string[]',
                enableTypeSelection: false,
                options: {
                    collapsed: true
                }
            }
        });

        const oSyllables = FormService.getDictionaryForm({
            value: orthSyllables, label: 'Orthographic Syllables',
            id: 'orthSyllables',
            options: {
                keyLabel: 'Syllable',
                valueLabel: 'Weight',
                keyTooltip: 'Categories to generate syllables from<br><br>Each character in the syllable represents an orthographic grouping of phonemes to choose from',
                valueTooltip: 'Weight of the syllable<br><br>Higher weight means the syllable is more likely to be generated',
                usePanel: true,
                layoutStyles: {
                    baseClass: 'col-12'
                },
                useSortByValues: true,
                reverseSort: true,
                initialType: 'number',
                enableTypeSelection: false,
                options: {
                    collapsed: true
                }
            }
        });

        const genWordList: ComponentConfig[] = [];
        const wordList$ = new BehaviorSubject<ComponentConfig[]>([]);

        const genWordFunct: MouseEventHandler = (event: MouseEvent) => {
            event.stopPropagation();
            const txSvc = AppSettings.getValue('txSvc');
            const formValues = form.value;
            const tempLangConfig = new LangConfig();
            tempLangConfig.phoneticInventory = formValues.phoneticInventory as Record<string, string>;
            tempLangConfig.orthSyllables = formValues.orthSyllables as Record<string, number>;
            tempLangConfig.orthographyCategories = formValues.orthographyCategories as Record<string, string[]>;
            tempLangConfig.name = formValues.name as string;

            tempLangConfig.generateGraphemeLookup();

            if (txSvc instanceof TransactionService) {
                txSvc.genWordsByLangConfig(tempLangConfig, 30)
                    .then((response: GenWord[]) => {
                        const words = response.map((word: GenWord) => word.word).sort();
                        const elements: ComponentConfig[] = [getListElement('Generated Words', words, {
                            elementType: ElementType.CLICKABLE_LIST,
                            listStyles: {
                                style: {
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                    gap: '16px',
                                    maxHeight: '300px',
                                    overflow: 'hidden',
                                }
                            }
                        })];
                        wordList$.next(elements);
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        };

        const genWordButton = FormService.getButtonElement({
            id: 'GenWords', label: 'Gen Words', layoutClass: 'col-12',
            handler: genWordFunct
        });

        const genWordPanel = FormService.getPanelForm('Generate Words', 'Generate Words', genWordList, {
            headerContent: [genWordButton],
            headerType: 'components',
            contentChanges$: wordList$,
        });

        const elements: ComponentConfig[] = [
            FormService.getTextElement('name', langConfig.name, 'col-12', false, 'Name'),
            FormService.getTextElement('id', '' + langConfig.langConfigId, 'col-12 w-full', true, 'ID'),
            genWordPanel,
            pInventory,
            oCategories,
            oSyllables
        ];

        const { form, options } = getFormDialog('Edit Language Settings', elements, undefined,
            {
                baseClass: 'mh-80vh overflow-auto'
            },
            {
                maximizable: true,
            }
        );

        options.styles = {
            style: {
                width: '80vw',
                maxWidth: '85vw',
                height: '65vh',
                maxHeight: '90vh',
            }
        };

        const dialogRef = dialogMgr.openModularDialog(options);

        dialogRef?.onSubmit.subscribe(() => {
            const formValues = form.value;

            langConfig.phoneticInventory = formValues.phoneticInventory as Record<string, string>;
            langConfig.orthSyllables = formValues.orthSyllables as Record<string, number>;
            langConfig.orthographyCategories = formValues.orthographyCategories as Record<string, string[]>;
            langConfig.name = formValues.name as string;

            langConfig.generateGraphemeLookup();

            AppSettings.setValue('currentLangConfig', langConfig);
            const txSvc = AppSettings.getValue('txSvc');
            const requestData = {
                lang_config_id: langConfig.langConfigId,
                name: langConfig.name,
                phonetic_inventory: langConfig.phoneticInventory,
                orth_syllables: langConfig.orthSyllables,
                orthography_categories: langConfig.orthographyCategories,
                grapheme_lookup: langConfig.graphemeLookup,
                debug: langConfig.debug
            };

            if (txSvc instanceof TransactionService) {
                txSvc.saveLangConfig(requestData)
                    .then((response) => {
                        ToastService.showSuccess('Language Config Saved', 'Success!');
                        AppSettings.updateValue('currentLexicon');
                    })
                    .catch((error) => {
                        ToastService.showError('Error Saving Language Config', 'Error!');
                        console.error(error);
                    });
            }

        });
    }
}

export const BasePageLayoutConfig: PageLayoutConfig = {
    wsTopNavConfig: {
        headerText: 'Conlang Tools',
        navMenuDef: {
            component: MenuBarComponent,
            config: <MenuBarConfig>{
                usePennant: false,
                useSpacer: false,
                menuBarButtonStyles: {
                    optionalClass: 'lang-button-scroll',
                    style: {
                        color: '#444444'
                    }
                },
                subMenuItemStyles: {
                    style: {
                        color: '#444444'

                    }
                },
                model: [
                    {
                        label: 'Menu',
                        items: [
                            {
                                label: 'Language Settings',
                                items: [
                                    {
                                        label: 'Current Language',
                                        command: () => {
                                            GetLangConfigDialogOptions();
                                        }
                                    },
                                    {
                                        label: 'New Language'
                                    },
                                    {
                                        label: 'Save Language'
                                    },
                                    {
                                        label: 'Edit Language Settings',
                                        command: () => {
                                            getLangConfigSettingsDialog();
                                        }
                                    }
                                ]
                            },
                            {
                                label: 'Tools',
                                items: [
                                    {
                                        label: 'Word Generator',
                                        navAction: {
                                            route: '/word-gen'
                                        }
                                    },
                                    {
                                        label: 'Grammar Generator'
                                    },
                                    {
                                        label: 'Dictionary'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }
    }
};