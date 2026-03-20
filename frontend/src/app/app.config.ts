import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { ClassRegistry, DataService, DefaultLogSettingsLogEverything, DefaultLogSettingsPreferLocal, NavigationService, NgLogService } from 'warskald-ui/services';
import { provideHttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { WsComponentMap } from 'warskald-ui/components';
import { PropTracker } from 'warskald-ui/services';
import { AppSettingsConfig } from './models/app-settings';

NgLogService.initialize(DefaultLogSettingsPreferLocal);
ClassRegistry.initialize(WsComponentMap);

DataService.initialize([
    'baseWords',
    'langConfigs',
    'synsets',
    'currentLangConfig',
    'conlangWords',
]);

export const AppSettings: PropTracker<AppSettingsConfig> = new PropTracker<AppSettingsConfig>({});

AppSettings.setIgnoredKeys([
    'currentLangConfig',
    'dialogMgr',
    'currentLexicon',
    'currentLexMap',
    'txSvc',
    'ngZone',
]);

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        provideAnimations(),
        provideHttpClient(),
        {
            provide: MessageService,
            useValue: new MessageService()
        },
    ]
};
