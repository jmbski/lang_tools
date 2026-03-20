import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { environment } from '@app/environment';
import { isLangConfig, LangConfig } from '@app/models';
import { AppSettings } from 'src/app/app.config';
import { PageLayoutComponent } from 'warskald-ui/components';
import { PageLayoutConfig } from 'warskald-ui/models';

@Component({
    selector: 'app-language-settings',
    standalone: true,
    imports: [
        CommonModule,
        PageLayoutComponent,
    ],
    templateUrl: './language-settings.component.html',
    styleUrl: './language-settings.component.scss'
})
export class LanguageSettingsComponent {
    // #region public properties

    public pageLayoutConfig: PageLayoutConfig = <PageLayoutConfig>environment.layoutConfig;

    public langConfigs: LangConfig[] = [];

    public currentConfig?: LangConfig;
    
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
        AppSettings.settings.currentLangConfig.subscribe((config: unknown) => {
            if(isLangConfig(config)) {
                this.currentConfig = config;
            }
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
