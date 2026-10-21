import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MarketProducer } from './core/services/market-producer';
import { HeaderComponent } from './layout/header/header';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly producer = inject(MarketProducer);

  constructor() {
    this.producer.start();
  }
}
