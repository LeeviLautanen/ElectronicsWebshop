import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderConfirmationPageComponent } from './order-confirmation-page.component';

describe('OrderConfirmationPageComponent', () => {
  let component: OrderConfirmationPageComponent;
  let fixture: ComponentFixture<OrderConfirmationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderConfirmationPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderConfirmationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
