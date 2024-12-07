import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaypalCheckoutComponent } from './paypal-checkout.component';

describe('PaypalCheckoutComponent', () => {
  let component: PaypalCheckoutComponent;
  let fixture: ComponentFixture<PaypalCheckoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaypalCheckoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaypalCheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
