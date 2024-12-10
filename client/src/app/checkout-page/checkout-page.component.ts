import { Component, OnInit } from '@angular/core';
import { PaypalCheckoutComponent } from '../paypal-checkout/paypal-checkout.component';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ShippingOption } from '../models/ShippingOption.model';
import { ShippingService } from '../services/shipping.service';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [PaypalCheckoutComponent, CommonModule, FormsModule],
  templateUrl: './checkout-page.component.html',
  styleUrl: './checkout-page.component.css',
})
export class CheckoutPageComponent implements OnInit {
  emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  shippingOptions: ShippingOption[] = [];
  selectedOption: string = '';

  constructor(private shippingService: ShippingService) {}

  ngOnInit(): void {
    this.shippingService.getShippingOptions().subscribe((options) => {
      this.shippingOptions = options;
    });
  }

  shippingInfo = {
    name: '',
    phone: '',
    email: '',
    address: '',
    postalCode: '',
    postalCity: '',
  };

  onSelectOption(optionId: string): void {
    this.selectedOption = optionId;
  }

  isEmailValid(): boolean {
    return this.emailPattern.test(this.shippingInfo.email);
  }

  isPhoneValid(): boolean {
    return this.shippingInfo.phone.length <= 11;
  }
}
