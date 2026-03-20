import { Directive } from '@angular/core';

@Directive({
    selector: '[baseDirective]',
    standalone: true
})
export class BaseDirective {

    constructor() { }

}
