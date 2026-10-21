import { Component, inject } from '@angular/core';
import { MarketProducer } from '../../core/services/market-producer';
import { MarketState } from '../../core/services/market-state';
import { CentsCurrencyPipe } from '../../shared/pipes/cents-currency.pipe';
import { ImbalancePipe } from '../../shared/pipes/imbalance.pipe';

@Component({
  selector: 'app-dashboard',
  imports: [CentsCurrencyPipe, ImbalancePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {
  private readonly producer = inject(MarketProducer);
  private readonly state = inject(MarketState);

  readonly rows = this.state.rows;
  readonly status = this.producer.status;
  readonly error = this.producer.error;

  pause(): void {
    this.producer.pause();
  }

  resume(): void {
    this.producer.resume();
  }
}
