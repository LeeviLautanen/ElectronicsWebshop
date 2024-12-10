import { Component, OnInit } from '@angular/core';
import { PaypalCheckoutComponent } from '../paypal-checkout/paypal-checkout.component';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ShippingOption } from '../models/ShippingOption.model';
import { ShoppingCartService } from '../services/shopping-cart.service';
import { Observable, Subscription } from 'rxjs';
import { Cart } from '../models/Cart.model';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [PaypalCheckoutComponent, CommonModule, FormsModule],
  templateUrl: './checkout-page.component.html',
  styleUrl: './checkout-page.component.css',
})
export class CheckoutPageComponent implements OnInit {
  emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  shippingOptions$!: Observable<ShippingOption[]>;
  cart$!: Observable<Cart>;

  shippingInfo = {
    name: '',
    phone: '',
    email: '',
    address: '',
    postalCode: '',
    postalCity: '',
  };

  constructor(private shoppingCartService: ShoppingCartService) {}

  ngOnInit(): void {
    // Make shipping service update shipping options from DB
    this.shoppingCartService.loadShippingOptions();

    // Assign the observables
    this.shippingOptions$ = this.shoppingCartService.shippingOptions$;
    this.cart$ = this.shoppingCartService.cart$;
  }

  // Update selected shipping option to cart
  onSelectOption(option: ShippingOption): void {
    this.shoppingCartService.selectShippingOption(option);
  }

  isEmailValid(): boolean {
    return this.emailPattern.test(this.shippingInfo.email);
  }

  isPhoneValid(): boolean {
    return this.shippingInfo.phone.length <= 11;
  }
}
