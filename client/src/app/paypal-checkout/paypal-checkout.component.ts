import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { environment } from '../../environments/environment.dev';
import { Router } from '@angular/router';
import { ShoppingCartService } from '../services/shopping-cart.service';
import { OrderService } from '../services/order.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-paypal-checkout',
  standalone: true,
  imports: [],
  templateUrl: './paypal-checkout.component.html',
  styleUrl: './paypal-checkout.component.css',
})
export class PaypalCheckoutComponent implements OnInit {
  @Input() shippingInfo: any;
  private clientId = environment.clientId;

  constructor(
    private orderService: OrderService,
    private router: Router,
    private shoppingCartService: ShoppingCartService,
    private toastr: ToastrService
  ) {}

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
      script.src = `https://www.paypal.com/sdk/js?client-id=${this.clientId}&components=buttons&currency=EUR&disable-funding=card`;
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
        createOrder: this.createOrderCallback.bind(this),
        onApprove: this.onApproveCallback.bind(this),
        onError: this.onErrorCallback.bind(this),

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
      return await this.orderService.createOrder(this.shippingInfo);
    } catch (error) {
      this.toastr.error(
        'Maksun aloittamisessa tapahtui virhe, tilausta ei luotu.',
        'Tilaus epäonnistui'
      );
      console.log(error);
      return 'error';
    }
  }

  async onApproveCallback(data: any) {
    try {
      const result = await this.orderService.captureOrder(data.orderID);

      if (result.status == 'COMPLETED') {
        this.shoppingCartService.emptyCart();
        this.router.navigateByUrl(`/tilaus/${result.orderId}`);
      } else {
        throw new Error(`Order capture result was not 'completed': ${result}`);
      }
    } catch (error) {
      this.toastr.error(
        'Maksun käsittelyssä tapahtui virhe, tilaus on peruutettu.',
        'Tilaus epäonnistui'
      );
      console.log(error);
    }
  }

  onErrorCallback(data: any): void {
    this.toastr.error(
      'Maksun käsittelyssä tapahtui virhe, tilaus on peruutettu.',
      'Tilaus epäonnistui'
    );
    console.log('Order didnt work');
    console.log(data.error);
  }
}
