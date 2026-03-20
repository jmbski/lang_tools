import { PageLayoutConfig, WeakObject } from 'warskald-ui/models';
import { LogLevels, LogServiceConfig, NavigationService, NgLogService } from 'warskald-ui/services';
import { MenuBarComponent, MenuBarConfig } from 'warskald-ui/components';
import { BasePageLayoutConfig } from '@app/common';


export const environment: WeakObject = {
    logServiceConfig: <LogServiceConfig>{
        logLevel: LogLevels.Error,
        defaultStateName: 'primaryState',
        useLocalLogLevel: true,
        useStrictLocalLogLevel: true,
        additionalServiceStates: {
            logEverything: {
                logLevel: LogLevels.Trace,
                useLocalLogLevel: false,
                enableReportListener: true,
                enableToggleListener: true,
                persistCurrentState: true,

            }
        },
        enableReportListener: true,
        enableToggleListener: true,
        persistCurrentState: true,
        customKeyListeners: {
            '1': (event: KeyboardEvent) => {
                NgLogService.loadState('primaryState');
            },
            '2': (event: KeyboardEvent) => {
                NgLogService.loadState('logEverything');
            }
        }
    },
    layoutConfig: BasePageLayoutConfig,
    production: true
};