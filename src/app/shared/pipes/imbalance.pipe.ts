import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'imbalance',
})
export class ImbalancePipe implements PipeTransform {
  transform(value: number | null): string {
    if (value === null) {
      return '-';
    }

    return value.toFixed(2);
  }
}
