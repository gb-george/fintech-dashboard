import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HeaderComponent } from './header';

describe('HeaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('links the title to the dashboard', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
    const logo = fixture.nativeElement.querySelector('.logo');
    expect(logo.getAttribute('href')).toBe('/dashboard');
  });
});
