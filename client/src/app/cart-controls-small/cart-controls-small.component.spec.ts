import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartControlsSmallComponent } from './cart-controls-small.component';

describe('CartControlsSmallComponent', () => {
  let component: CartControlsSmallComponent;
  let fixture: ComponentFixture<CartControlsSmallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartControlsSmallComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartControlsSmallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
