import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartControlsLargeComponent } from './cart-controls-large.component';

describe('CartControlsLargeComponent', () => {
  let component: CartControlsLargeComponent;
  let fixture: ComponentFixture<CartControlsLargeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartControlsLargeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartControlsLargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
