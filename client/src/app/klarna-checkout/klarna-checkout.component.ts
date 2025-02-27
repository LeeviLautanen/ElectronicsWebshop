import { Component, Input } from '@angular/core';
import { OrderService } from '../services/order.service';
import { Router } from '@angular/router';
import { ShoppingCartService } from '../services/shopping-cart.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment.dev';

@Component({
  selector: 'app-klarna-checkout',
  standalone: true,
  imports: [],
  templateUrl: './klarna-checkout.component.html',
  styleUrl: './klarna-checkout.component.css',
})
export class KlarnaCheckoutComponent {
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
    this.loadKlarnaScript().then(() => {
      this.initializeKlarnaButton();
    });
  }

  // Load paypal sdk
  private loadKlarnaScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://x.klarnacdn.net/kp/lib/v1/api.js`;
      script.onload = () => resolve();
      script.onerror = () => reject('Klarna SDK could not be loaded.');
      document.body.appendChild(script);
    });
  }

  // Create paypal button and callbacks
  private initializeKlarnaButton(): void {
    // @ts-ignore, doesnt play nice with ts
    window.Klarna.Payments.Buttons.init({
      client_id: 'YOUR_CLIENT_ID',
    }).load(
      {
        container: '#container',
        theme: 'default',
        shape: 'default',
        on_click: (authorize: any) => {
          // Here you should invoke authorize with the order payload.
          authorize(
            { collect_shipping_address: true },
            {}, // order payload
            (result: any) => {
              // The result, if successful contains the authorization_token
            }
          );
        },
      },
      function load_callback(loadResult: any) {
        // Here you can handle the result of loading the button
      }
    );
  }
}
