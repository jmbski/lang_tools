import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { environment } from '@app/environment';
import { GenWord, LangConfig } from '@app/models';
import { ButtonModule } from 'primeng/button';
import { SplitterModule } from 'primeng/splitter';
import { ToolbarModule } from 'primeng/toolbar';
import { BehaviorSubject } from 'rxjs';
import { WordGeneratorComponent } from 'src/app/components/word-generator/word-generator.component';
import { ConlangWord } from 'src/app/models/conlang-word';
import { ElementRendererComponent, PageLayoutComponent } from 'warskald-ui/components';
import { ComponentConfig, PageLayoutConfig, WeakObject } from 'warskald-ui/models';
import { DataService, LoggableComponent, LogLevels } from 'warskald-ui/services';

@LoggableComponent({
    LOCAL_ID: 'WordGenPageComponent',
    autoAddLogs: true,
    canLog: true,
    localLogLevel: LogLevels.Error
})
@Component({
    selector: 'app-word-gen-page',
    standalone: true,
    imports: [
        ButtonModule,
        CommonModule,
        ElementRendererComponent,
        PageLayoutComponent,
        ReactiveFormsModule,
        SplitterModule,
        ToolbarModule,
        WordGeneratorComponent,
    ],
    templateUrl: './word-gen-page.component.html',
    styleUrl: './word-gen-page.component.scss'
})
export class WordGenPageComponent {

    // #region public properties

    public pageLayoutConfig: PageLayoutConfig = <PageLayoutConfig>environment.layoutConfig;

    public langConfig?: LangConfig;

    public conlangWords: ConlangWord[] = [];
    
    public conlangWords$: BehaviorSubject<ConlangWord[]> = new BehaviorSubject<ConlangWord[]>([]);

    public wordElements: ComponentConfig[] = [];
    

    
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
        public cd: ChangeDetectorRef,
        public el: ElementRef,
    ) {
        DataService.subscribeToDataSource('conlangWords', this, (genWords: GenWord[]) => {
            this.conlangWords = genWords.map((genWord) => {
                const wordData: WeakObject = {
                    word: genWord.word,
                    wordIpa: genWord.ipa,
                    langConfigId: this.langConfig?.langConfigId || 0,
                    wordId: 0,
                };
                return new ConlangWord(wordData);
            });
            this.conlangWords$.next(this.conlangWords);    
        });

        this.conlangWords$.subscribe((conlangWords) => {
            this.cd.detectChanges();
        });
    }
    // #endregion constructor and lifecycle hooks
    
    
    // #region public methods
    
    // #endregion public methods
    
    
    // #region protected methods
    
    // #endregion protected methods
    
    
    // #region private methods
    
    // #endregion private methods
    
    
}
