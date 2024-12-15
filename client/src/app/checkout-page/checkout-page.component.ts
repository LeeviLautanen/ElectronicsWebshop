import { Component, OnInit } from '@angular/core';
import { PaypalCheckoutComponent } from '../paypal-checkout/paypal-checkout.component';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ShippingOption } from '../models/ShippingOption.model';
import { ShoppingCartService } from '../services/shopping-cart.service';
import { Observable, Subscription } from 'rxjs';
import { Cart } from '../models/Cart.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapCheck, bootstrapCircle } from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [PaypalCheckoutComponent, CommonModule, FormsModule, NgIcon],
  templateUrl: './checkout-page.component.html',
  styleUrl: './checkout-page.component.css',
  providers: [
    provideIcons({
      bootstrapCircle,
      bootstrapCheck,
    }),
  ],
})
export class CheckoutPageComponent implements OnInit {
  emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  shippingOptions$!: Observable<ShippingOption[]>;
  cart$!: Observable<Cart>;

  termsAccepted: boolean = false;
  shippingInfoValid: boolean = false;
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
  onSelectOption(option: ShippingOption) {
    this.shoppingCartService.selectShippingOption(option);
  }

  isEmailValid(): boolean {
    return this.emailPattern.test(this.shippingInfo.email);
  }

  isPhoneValid(): boolean {
    return this.shippingInfo.phone.length <= 11;
  }

  areInputLengthsValid(): boolean {
    // Max lengths gotten from https://developer.paypal.com/docs/api/orders/v2/#orders_create

    const info = this.shippingInfo;
    if (
      info.name.length > 300 ||
      info.address.length > 300 ||
      info.postalCity.length > 120 ||
      info.postalCode.length > 60
    ) {
      return false;
    }
    return true;
  }

  checkShippingInfo() {
    this.shippingInfoValid =
      //this.isEmailValid() && Enable for production !!!
      this.isPhoneValid() && this.areInputLengthsValid() && this.termsAccepted;
  }
}
