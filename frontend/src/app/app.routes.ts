import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'main', pathMatch: 'full' },
    { path: 'main', loadComponent: () => import('./pages/main-page/main-page.component').then(m => m.MainPageComponent) },
    { path: 'language-settings', loadComponent: () => import('./pages/language-settings/language-settings.component').then(m => m.LanguageSettingsComponent)},
    { path: 'word-gen', loadComponent: () => import('./pages/word-gen-page/word-gen-page.component').then(m => m.WordGenPageComponent)}
];
