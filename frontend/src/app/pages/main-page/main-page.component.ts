import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { environment } from '@app/environment';
import { PageLayoutComponent } from 'warskald-ui/components';
import { PageLayoutConfig } from 'warskald-ui/models';
import { LoggableComponent, LogLevels } from 'warskald-ui/services';
import { LexBuilderComponent, WordListComponent } from '@app/components';
import { TransactionService } from '@app/services';

/* @LoggableComponent({
    LOCAL_ID: 'MainPageComponent',
    localLogLevel: LogLevels.Debug,
    autoAddLogs: true,
    canLog: true,
}) */
@Component({
    selector: 'app-main-page',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        LexBuilderComponent,
        PageLayoutComponent,
        WordListComponent,
    ],
    templateUrl: './main-page.component.html',
    styleUrl: './main-page.component.scss'
})
export class MainPageComponent {

    // #region public properties

    public pageLayoutConfig: PageLayoutConfig = <PageLayoutConfig>environment.layoutConfig;
    
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
    ) {
        
    }
    // #endregion constructor and lifecycle hooks
    
    
    // #region public methods
    
    // #endregion public methods
    
    
    // #region protected methods
    
    // #endregion protected methods
    
    
    // #region private methods
    
    // #endregion private methods
    
    
}
