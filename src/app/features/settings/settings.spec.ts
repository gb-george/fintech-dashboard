import { TestBed } from '@angular/core/testing';
import { MarketProducer } from '../../core/services/market-producer';
import { SettingsComponent } from './settings';

class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  postMessage(): void {}
  terminate(): void {}
  addEventListener(): void {}
  removeEventListener(): void {}
  dispatchEvent(): boolean {
    return false;
  }
}

describe('SettingsComponent', () => {
  beforeEach(async () => {
    (globalThis as unknown as { Worker: typeof Worker }).Worker =
      MockWorker as unknown as typeof Worker;

    await TestBed.configureTestingModule({
      imports: [SettingsComponent],
    }).compileComponents();
  });

  it('starts from the current producer settings', () => {
    const fixture = TestBed.createComponent(SettingsComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.form.getRawValue()).toEqual({
      instrumentCount: 5,
      updatesPerBatch: 100,
      batchIntervalMs: 500,
    });
  });

  it('does not change the producer until Apply', () => {
    const producer = TestBed.inject(MarketProducer);
    const fixture = TestBed.createComponent(SettingsComponent);
    fixture.detectChanges();

    fixture.componentInstance.form.patchValue({ instrumentCount: 8 });
    fixture.detectChanges();

    expect(producer.settings().instrumentCount).toBe(5);
    expect(producer.activeRunId()).toBe(0);
  });

  it('applies valid settings as a new run', () => {
    const producer = TestBed.inject(MarketProducer);
    const fixture = TestBed.createComponent(SettingsComponent);
    fixture.detectChanges();

    fixture.componentInstance.form.setValue({
      instrumentCount: 8,
      updatesPerBatch: 50,
      batchIntervalMs: 200,
    });
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(producer.settings()).toEqual({
      instrumentCount: 8,
      updatesPerBatch: 50,
      batchIntervalMs: 200,
    });
    expect(producer.activeRunId()).toBe(1);
    expect(producer.status()).toBe('running');
  });

  it('rejects values outside the allowed ranges', () => {
    const producer = TestBed.inject(MarketProducer);
    const fixture = TestBed.createComponent(SettingsComponent);
    fixture.detectChanges();

    fixture.componentInstance.form.patchValue({ instrumentCount: 51 });
    fixture.componentInstance.apply();
    fixture.detectChanges();

    expect(producer.activeRunId()).toBe(0);
    expect(producer.settings().instrumentCount).toBe(5);
    expect(fixture.nativeElement.textContent).toContain('Enter an integer from 1 to 50');
  });

  it('rejects non-integers', () => {
    const producer = TestBed.inject(MarketProducer);
    const fixture = TestBed.createComponent(SettingsComponent);
    fixture.detectChanges();

    fixture.componentInstance.form.patchValue({ updatesPerBatch: 10.5 });
    fixture.componentInstance.apply();

    expect(producer.activeRunId()).toBe(0);
    expect(fixture.componentInstance.form.invalid).toBe(true);
  });

  it('disables Apply when the form is invalid', () => {
    const fixture = TestBed.createComponent(SettingsComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;

    expect(button.disabled).toBe(false);

    fixture.componentInstance.form.patchValue({ instrumentCount: 51 });
    fixture.detectChanges();

    expect(button.disabled).toBe(true);
  });
});
