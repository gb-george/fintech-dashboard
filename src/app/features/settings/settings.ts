import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MarketProducer } from '../../core/services/market-producer';

function integer(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value === null || value === '') {
    return { required: true };
  }
  return Number.isInteger(Number(value)) ? null : { integer: true };
}

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class SettingsComponent {
  private readonly producer = inject(MarketProducer);
  private readonly current = this.producer.settings();

  readonly form = new FormGroup({
    instrumentCount: new FormControl(this.current.instrumentCount, {
      nonNullable: true,
      validators: [Validators.required, integer, Validators.min(1), Validators.max(50)],
    }),
    updatesPerBatch: new FormControl(this.current.updatesPerBatch, {
      nonNullable: true,
      validators: [Validators.required, integer, Validators.min(1), Validators.max(1000)],
    }),
    batchIntervalMs: new FormControl(this.current.batchIntervalMs, {
      nonNullable: true,
      validators: [Validators.required, integer, Validators.min(50), Validators.max(2000)],
    }),
  });

  apply(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.producer.start(this.form.getRawValue());
  }
}
