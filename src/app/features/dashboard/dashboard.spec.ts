import { TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard';

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

describe('DashboardComponent', () => {
  beforeEach(async () => {
    (globalThis as unknown as { Worker: typeof Worker }).Worker =
      MockWorker as unknown as typeof Worker;

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
