import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TransactionService } from '@app/services';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { AppSettings } from 'src/app/app.config';
import { SplitterModule } from 'primeng/splitter';
import { ElementRendererComponent, InputTextComponent } from 'warskald-ui/components';
import { DataService, DialogManagerService, FormService, LoggableComponent, LogLevels, ToastService } from 'warskald-ui/services';
import { WordListComponent } from '../word-list/word-list.component';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { isLexEntryArray, isSynsetArray, LexEntry, LexEntryForm, Synset } from '@app/models';
import { ComponentConfig, ContainerConfig, ElementType, WeakObject } from 'warskald-ui/models';
import { ToolbarModule } from 'primeng/toolbar';
import { BehaviorSubject } from 'rxjs';
import { isString } from 'warskald-ui/type-guards';
import { SelectItem } from 'primeng/api';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

@LoggableComponent({
    LOCAL_ID: 'LexBuilderComponent',
    autoAddLogs: true,
    canLog: true,
    localLogLevel: LogLevels.Error
})
@Component({
    selector: 'app-lex-builder',
    standalone: true,
    imports: [
        AutoCompleteModule,
        ButtonModule,
        CommonModule,
        ElementRendererComponent,
        FormsModule,
        InputGroupModule,
        InputGroupAddonModule,
        InputTextModule,
        InputTextComponent,
        PanelModule,
        ReactiveFormsModule,
        ScrollPanelModule,
        SplitterModule,
        ToolbarModule,
        WordListComponent,
    ],
    templateUrl: './lex-builder.component.html',
    styleUrl: './lex-builder.component.scss',
    providers: [
        TransactionService,
    ],
})
export class LexBuilderComponent {

    // #region public properties

    public englishWord: string = '';

    public baseWords: string[] = [];

    public langConfigs: unknown[] = [];

    public filteredWords: string[] = [];

    public currentLexEntry?: LexEntry;

    // public currentLexForm?: LexEntryForm;

    public currentLexForm$: BehaviorSubject<LexEntryForm[]> = new BehaviorSubject<LexEntryForm[]>([]);

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

    @ViewChild('lexFormRef') lexFormRef?: ElementRendererComponent;

    @ViewChild('lexFormWrapper') lexFormWrapper?: ElementRef;

    @ViewChild('wordListPanel') wordListPanel?: WordListComponent;

    // #endregion viewchildren and contentchildren


    // #region constructor and lifecycle hooks
    constructor(
        public cd: ChangeDetectorRef,
        private txSvc: TransactionService,
        private dialogMgr: DialogManagerService,
        private ngZone: NgZone,
        public el: ElementRef,
    ) {
        DataService.subscribeToDataSource('baseWords', this, (data) => {
            this.baseWords = data;
        });

        /* AppSettings.changes.subscribe((settings: unknown) => {
            
        }); */
    }
    // #endregion constructor and lifecycle hooks


    // #region public methods

    public getSynsets(): void {
        this.txSvc.getLanguageConfigs().then((configs) => {
            console.log('configs:', configs);
        });
    }

    public filterBaseWords(event: AutoCompleteCompleteEvent) {
        this.filteredWords = this.baseWords.filter((word) => {
            return word.toLowerCase().includes(event.query.toLowerCase());
        });
    }

    public handleLexChange(entry: LexEntry) {

        this.currentLexForm$.next([]);
        this.currentLexEntry = entry;
        const lexForm = entry.toForm();
        lexForm.form.valueChanges.subscribe((changes) => {


            entry.word = changes?.conlangWordContainer?.word ?? entry.word;
            entry.wordIpa = changes?.conlangIpaContainer?.wordIpa ?? entry.wordIpa;
        });

        setTimeout(() => {

            this.currentLexForm$.next([lexForm]);
        });
        /**
         * @todo configure storing unsaved values etc... when switching words
         */
    }

    public animateWordList() {

        if (this.lexFormWrapper) {
            FormService.triggerAnimation(this.lexFormWrapper.nativeElement, 'reflective');
        }
    }

    public save() {
        if (this.currentLexEntry) {
            this.animateWordList();
            this.txSvc.saveLexEntry(this.currentLexEntry).then((response) => {
                ToastService.showSuccess('Saved Lexicon Entry');
                AppSettings.updateValue('currentLexicon');
            });
        }
    }

    public delete() {
        this.animateWordList();

        const deleteContainer: ContainerConfig = {
            elementType: ElementType.CONTAINER,
            id: 'test-container',
            elements: [{
                elementType: ElementType.TEXT_BLOCK,
                id: 'confirm-text',
                value: 'Remove definition from lexicon?',
                baseStyles: {
                    baseClass: 'align-items-center flex h-full justify-content-center m-0 text-block',
                }
            }],
            hasForm: true,
            /* baseStyles: {
                baseClass: 'h-full',
            }, */
            layoutStyles: {
                baseClass: 'h-full'
            }
        };

        const dialogRef = this.dialogMgr.openModularDialog({
            dialogID: 'test-dialog',
            allowMultiple: false,
            appendTo: 'body',
            content: ElementRendererComponent,
            contentData: deleteContainer,
            header: 'Confirm Deletion',
            styles: {
                style: {
                    width: '40vw',
                }
            },
        });

        dialogRef?.onSubmit.subscribe((val: unknown) => {
            if (this.currentLexEntry) {
                this.txSvc.deleteSynset(this.currentLexEntry.dbId).then((resp: unknown) => {
                    ToastService.showSuccess('Deleted Lexicon Entry');
                    console.log('delete response:', resp);
                    this.currentLexEntry = undefined;
                    this.currentLexForm$.next([]);

                    AppSettings.updateValue('currentLexicon');
                });
            }
        });
    }

    public addWordDef() {
        const itemForm: FormGroup = new FormGroup({});

        const itemConfig: ComponentConfig = {
            elementType: ElementType.INPUT_TEXT,
            id: 'word-name',
            label: 'Word Name',
            hasForm: true,
            baseStyles: {
                baseClass: 'w-full'
            }
        };

        const nameRef = this.dialogMgr.openModularDialog({
            dialogID: 'word-name',
            allowMultiple: false,
            appendTo: 'body',
            styles: {
                style: {
                    width: '60vw',
                }
            },
            header: 'Add Word',
            content: ElementRendererComponent,
            contentData: <ContainerConfig>{
                elementType: ElementType.CONTAINER,
                id: 'word-name-container',
                elements: [itemConfig],
                form: itemForm,
                hasForm: true,
            },

        });

        nameRef?.onSubmit.subscribe(() => {
            const word = itemForm.get('word-name')?.value;
            if (isString(word)) {
                ToastService.showInfo(`Retrieving definitions for ${word}`);
                this.txSvc.getSynsets(word).then((synsets) => {
                    ToastService.showSuccess(`Found ${synsets.length} definitions for ${word}`);
                    this.selectSynSets(synsets);
                });
            }
        });
    }

    public selectSynSets(synsets: Synset[]) {
        const synsetForm: FormGroup = new FormGroup({});
        const lexicon = AppSettings.getValue('currentLexicon');
        if (isLexEntryArray(lexicon)) {
            synsets = synsets.filter((synset) => {
                return !lexicon.find((entry) => {
                    return entry.synsetId === synset.synsetId;
                });
            });
        }

        const optionValues: SelectItem[] = synsets.map((synset) => {
            return {
                label: `${synset.engWord} - ${synset.definition}`,
                value: synset
            };
        });

        const itemConfig: ComponentConfig = {
            elementType: ElementType.MULTI_SELECT,
            id: 'synset-select',
            label: 'Retrieved Definitions',
            hasForm: true,
            value: [],
            options: {
                panelStyle: {
                    maxWidth: '85vw',
                },
                appendTo: 'body',
            },
            optionValues,
        };

        const synsetRef = this.dialogMgr.openModularDialog({
            dialogID: 'synset-select',
            allowMultiple: false,
            appendTo: 'body',
            styles: {
                style: {
                    width: '60vw',
                }
            },
            header: 'Select Meanings',
            content: ElementRendererComponent,
            contentData: <ContainerConfig>{
                elementType: ElementType.CONTAINER,
                id: 'synset-select-container',
                elements: [itemConfig],
                form: synsetForm,
                hasForm: true,
            },

        });

        synsetRef?.onSubmit.subscribe(() => {
            const synsets = synsetForm.get('synset-select')?.value;
            if (isSynsetArray(synsets)) {
                ToastService.showInfo(`Saving ${synsets.length} definitions`);
                this.txSvc.saveSynsets(synsets).then(() => {
                    ToastService.showSuccess(`Saved ${synsets.length} definitions`);
                    this.animateWordList();
                    AppSettings.updateValue('currentLexicon');
                });
            }
        });
    }
    // #endregion public methods


    // #region protected methods

    // #endregion protected methods


    // #region private methods

    // #endregion private methods


}
