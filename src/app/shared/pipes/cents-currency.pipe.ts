import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'centsCurrency',
})
export class CentsCurrencyPipe implements PipeTransform {
  transform(cents: number | null): string {
    if (cents === null) {
      return '-';
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  }
}
