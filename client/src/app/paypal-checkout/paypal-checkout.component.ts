import { Component, ElementRef, OnInit } from '@angular/core';
import { PaymentService } from '../services/payment.service';
import { environment } from '../../environments/environment.dev';

@Component({
  selector: 'app-paypal-checkout',
  standalone: true,
  imports: [],
  templateUrl: './paypal-checkout.component.html',
  styleUrl: './paypal-checkout.component.css',
})
export class PaypalCheckoutComponent implements OnInit {
  private clientId = environment.clientId;

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    // Initialize the paypal button after the script has loaded
    this.loadPaypalScript().then(() => {
      this.initializePaypalButton();
    });
  }

  // Load paypal sdk
  private loadPaypalScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${this.clientId}&components=buttons&currency=EUR`;
      script.onload = () => resolve();
      script.onerror = () => reject('Paypal SDK could not be loaded.');
      document.body.appendChild(script);
    });
  }

  // Create paypal button and callbacks
  private initializePaypalButton(): void {
    // @ts-ignore, doesnt play nice with ts
    window.paypal
      .Buttons({
        // Sets up the transaction when a payment button is clicked
        createOrder: this.createOrderCallback.bind(this),
        // Callback for handling an approved order
        onApprove: this.onApproveCallback.bind(this),
        // Error callback
        onError: function (error: any) {
          // Do something with the error from the SDK
        },

        style: {
          shape: 'rect',
          layout: 'vertical',
          color: 'gold',
          label: 'paypal',
        },
      })
      .render('#paypal-button-container');
  }

  async createOrderCallback(): Promise<string> {
    try {
      const res = await this.paymentService.createOrder();
      return res;
    } catch (error) {
      console.log(error);
      return 'error';
    }
  }

  onApproveCallback(data: any): void {
    this.paymentService.captureOrder(data.orderID);
  }

  onErrorCallback(): void {
    console.log('Order didnt work');
  }
}
