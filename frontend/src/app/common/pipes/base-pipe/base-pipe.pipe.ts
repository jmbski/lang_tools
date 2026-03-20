import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'basePipe',
    standalone: true
})
export class BasePipePipe implements PipeTransform {

    transform(value: unknown, ...args: unknown[]): unknown {
        return null;
    }

}
