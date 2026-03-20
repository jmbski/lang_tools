import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { isLexEntryArray, LexEntry } from '@app/models';
import { ButtonModule } from 'primeng/button';
import { ListboxModule } from 'primeng/listbox';
import { PanelModule } from 'primeng/panel';
import { BehaviorSubject } from 'rxjs';
import { AppSettings } from 'src/app/app.config';
import { ElementRendererComponent } from 'warskald-ui/components';
import { FunctionMap } from 'warskald-ui/models';
import { FormService, LoggableComponent, LogLevels } from 'warskald-ui/services';
import { FieldsetModule } from 'primeng/fieldset';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputTextModule } from 'primeng/inputtext';
import { debounceTime } from 'rxjs/operators';
import { TimesIcon } from 'primeng/icons/times';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { SplitButtonModule } from 'primeng/splitbutton';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

export interface LexGroup {
    engWord: string;
    label: string;
    lexEntries: LexEntry[];
    totalCount: number;
    assignedCount: number;
}

@LoggableComponent({
    LOCAL_ID: 'WordListComponent',
    localLogLevel: LogLevels.Error,
    autoAddLogs: true,
    canLog: true,
})
@Component({
    selector: 'app-word-list',
    standalone: true,
    imports: [
        AutoCompleteModule,
        BadgeModule,
        ButtonModule,
        CommonModule,
        ElementRendererComponent,
        FieldsetModule,
        FormsModule,
        IconFieldModule,
        InputGroupAddonModule,
        InputGroupModule,
        InputIconModule,
        InputTextModule,
        ListboxModule,
        MenuModule,
        OverlayPanelModule,
        PanelModule,
        ReactiveFormsModule,
        SplitButtonModule,
        TimesIcon,
        TooltipModule,
    ],
    templateUrl: './word-list.component.html',
    styleUrl: './word-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WordListComponent {

    // #region public properties

    public words: string[] = [];

    //public lexicon: LexEntry[] = [];

    public lexGroups: LexGroup[] = [];

    public lexGroups$: BehaviorSubject<LexGroup[]> = new BehaviorSubject<LexGroup[]>([]);

    public filteredList: LexGroup[] = [];

    public filterControl: FormControl = new FormControl('');

    public filterMapping: FunctionMap = {
        assigned: (entry: LexEntry) => entry.wordId,
        unassigned: (entry: LexEntry) => !entry.wordId,
        either: () => true,
    };

    public filterMode: 'assigned' | 'unassigned' | 'either' = 'either';


    public filterOptions: MenuItem[] = [
        { label: 'Either', command: (event: unknown) => {
            this.filterMode = 'either';
            this.filter(this.filterControl.value);
            this.menuRef?.hide();
        }},
        { label: 'Assigned', command: () => {
            this.filterMode = 'assigned';
            this.filter(this.filterControl.value);
            this.menuRef?.hide();
        }},
        { label: 'Unassigned', command: () => {
            this.filterMode = 'unassigned';
            this.filter(this.filterControl.value);
            this.menuRef?.hide();
        }},
    ];

    //public elements: ComponentConfig[] = [];
    
    // #endregion public properties
    
    
    // #region private properties
    
    // #endregion private properties
    
    
    // #region getters/setters

    private _lexicon: LexEntry[] = [];
    public get lexicon(): LexEntry[] {
        return this._lexicon;
    }
    public set lexicon(value: LexEntry[]) {
        this._lexicon = value;
        this.lexGroups = this.groupLexicon();
        this.lexGroups$.next(this.lexGroups);
    }
    
    // #endregion getters/setters
    
    
    // #region standard inputs

    @Input() wrapperElement?: HTMLElement;
    
    // #endregion standard inputs
    
    
    // #region get/set inputs
    
    // #endregion get/set inputs
    
    
    // #region outputs, emitters, and event listeners

    @Output() currentLexChange: EventEmitter<LexEntry> = new EventEmitter<LexEntry>();
    
    // #endregion outputs, emitters, and event listeners
    
    
    // #region viewchildren and contentchildren
    
    @ViewChild('menu') menuRef?: OverlayPanel;

    // #endregion viewchildren and contentchildren
    
    
    // #region constructor and lifecycle hooks
    constructor(
        public cd: ChangeDetectorRef,
        public el: ElementRef,
        // private txSvc: TransactionService,
    ) {
        
    }

    ngOnInit() {
        const lexEntries = AppSettings.getValue('currentLexicon');
        if(isLexEntryArray(lexEntries)) {
            this.lexicon = lexEntries;
        }

        AppSettings.settings.currentLexicon?.subscribe((lexEntries: unknown) => {
            if(isLexEntryArray(lexEntries)) {
                this.lexicon = lexEntries;
                if(this.wrapperElement) {
                    FormService.triggerAnimation(this.wrapperElement, 'reflective');
                }
                //FormService.triggerAnimation(this.el.nativeElement, 'reflective');
                /* const target: HTMLElement = (<HTMLElement>this.el.nativeElement).parentElement?.parentElement as HTMLElement;

                if(target) {
                    FormService.triggerAnimation(target, 'reflective');
                } */
            }
        });

        this.filterControl.valueChanges.pipe(debounceTime(300)).subscribe((value) => {
            this.filter(value);
        });
    }

    ngAfterViewInit() {

    }
    // #endregion constructor and lifecycle hooks
    
    
    // #region public methods
    
    public groupLexicon(): LexGroup[] {
        const groups: LexGroup[] = [];

        const engWords = this.lexicon.map((entry) => entry.engWord).sort();
        const uniqueEngWords = Array.from(new Set(engWords));
        const labels = uniqueEngWords.map((engWord) => engWord.toFormat('label'));
        const filterModeFunct = this.filterMapping[this.filterMode];
        uniqueEngWords.forEach((engWord, index) => {
            const lexEntries = this.lexicon
                .filter((entry) => filterModeFunct(entry))
                .filter((entry) => entry.engWord === engWord)
                .sort((a,b) => {
                    if(a.wordId && !b.wordId) {
                        return 1;
                    } 
                    return -1;
                });
            
            const label = labels[index];
            const totalCount = lexEntries.length;
            const assignedCount = lexEntries.filter((entry) => entry.wordId).length;
            groups.push({ engWord, lexEntries, label, totalCount, assignedCount});
        });
        
        return groups;
    }

    public filter(text: string) {
        const filterModeFunct = this.filterMapping[this.filterMode];

        const filteredGroups = this.lexGroups
            .map((group) => {
                const lexEntries = group.lexEntries.filter((entry) => filterModeFunct(entry));
                return { ...group, lexEntries };
            })
            .filter((group) => group.lexEntries.length > 0)
            .filter((group) => {
                return group.engWord.toLowerCase().includes(text.toLowerCase());
            });
            

        this.lexGroups$.next(filteredGroups);
    }
    
    public clear() {
        this.filterControl.setValue('');
    }
    
    // #endregion public methods
    
    
    // #region protected methods
    
    // #endregion protected methods
    
    
    // #region private methods
    
    // #endregion private methods
    
    
}
