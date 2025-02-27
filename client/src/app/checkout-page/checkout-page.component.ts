import { Component, OnInit } from '@angular/core';
import { PaypalCheckoutComponent } from '../paypal-checkout/paypal-checkout.component';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ShippingOption } from '../models/ShippingOption.model';
import { ShoppingCartService } from '../services/shopping-cart.service';
import { firstValueFrom, Observable, Subscription, timeout } from 'rxjs';
import { Cart } from '../models/Cart.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapCheck, bootstrapCircle } from '@ng-icons/bootstrap-icons';
import { Router } from '@angular/router';
import { ImageUrlService } from '../services/image-url.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { OrderService } from '../services/order.service';

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

  klarnaSnippet: SafeHtml | null = null;

  shippingOptions$!: Observable<ShippingOption[]>;
  cart$!: Observable<Cart>;

  termsAccepted: boolean = false;
  shippingInfoValid: boolean = false;
  shippingInfo = {
    name: '',
    phone: '',
    email: '',
    address_line_1: '',
    admin_area_2: '',
    postal_code: '',
  };

  constructor(
    private shoppingCartService: ShoppingCartService,
    private orderService: OrderService,
    private router: Router,
    private imageUrlService: ImageUrlService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // Assign the observables
    this.shippingOptions$ = this.shoppingCartService.shippingOptions$;
    this.cart$ = this.shoppingCartService.cart$;

    // Check that cart is not empty
    this.checkCart();

    // Make shipping service update shipping options from DB
    this.shoppingCartService.fetchShippingOptions();
  }

  // Check that cart is not empty
  async checkCart() {
    const cartData = await firstValueFrom(this.shoppingCartService.cart$);
    if (cartData.cartItems.length === 0) {
      this.router.navigate(['/kauppa']);
    }
  }

  getImageUrl(imageName: string): string {
    return this.imageUrlService.getImageUrl(imageName, 'small');
  }

  // Update selected shipping option to cart
  onSelectOption(option: ShippingOption) {
    this.shoppingCartService.selectShippingOption(option);
  }

  isEmailValid(): boolean {
    this.shippingInfo.email = this.shippingInfo.email.trim();
    return this.emailPattern.test(this.shippingInfo.email);
  }

  isPhoneValid(): boolean {
    // Remove 358 prefix if for some reason it is written
    if (this.shippingInfo.phone.startsWith('358')) {
      this.shippingInfo.phone = this.shippingInfo.phone.slice(3);
    }
    this.shippingInfo.phone = this.shippingInfo.phone.trim();
    return this.shippingInfo.phone.length <= 11;
  }

  areInputLengthsValid(): boolean {
    // Max lengths gotten from https://developer.paypal.com/docs/api/orders/v2/#orders_create
    const info = this.shippingInfo;
    if (
      info.name.length > 300 ||
      info.address_line_1.length > 300 ||
      info.admin_area_2.length > 120 ||
      info.postal_code.length > 60
    ) {
      return false;
    }
    return true;
  }

  async checkShippingInfo() {
    const cartData = await firstValueFrom(this.shoppingCartService.cart$);

    this.shippingInfoValid =
      this.isEmailValid() &&
      this.isPhoneValid() &&
      this.areInputLengthsValid() &&
      this.termsAccepted &&
      cartData.shippingOption != null;

    console.log(this.shippingInfoValid);

    if (this.shippingInfoValid && this.klarnaSnippet === null) {
      const klarnaHtml = await this.orderService.createKlarnaOrder(
        this.shippingInfo
      );

      console.log(klarnaHtml);

      // Sanitize and store it
      this.klarnaSnippet = this.sanitizer.bypassSecurityTrustHtml(klarnaHtml);
    }
  }
}
