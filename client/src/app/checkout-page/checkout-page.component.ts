import { Component } from '@angular/core';
import { PaypalCheckoutComponent } from '../paypal-checkout/paypal-checkout.component';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [PaypalCheckoutComponent],
  templateUrl: './checkout-page.component.html',
  styleUrl: './checkout-page.component.css',
})
export class CheckoutPageComponent {}
