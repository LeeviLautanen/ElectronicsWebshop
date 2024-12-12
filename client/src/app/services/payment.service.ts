import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.dev';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, map } from 'rxjs';
import { ShoppingCartService } from './shopping-cart.service';
import { CartItem } from '../models/CartItem.model';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private baseUrl = environment.baseUrl;

  constructor(
    private httpClient: HttpClient,
    private shoppingCartService: ShoppingCartService
  ) {}

  // Send a request to server to create a new order
  async createOrder(shippingInfo: any): Promise<any> {
    const url = `${this.baseUrl}/api/createOrder`;

    // Get items in cart and compress then before sending to server
    const cartData = await firstValueFrom(this.shoppingCartService.cart$);
    return await firstValueFrom(
      this.httpClient.post(url, {
        cartData: cartData,
        shippingInfo: shippingInfo,
      })
    );
  }

  async captureOrder(orderId: string): Promise<any> {
    const url = `${this.baseUrl}/api/captureOrder`;
    const cartData = await firstValueFrom(this.shoppingCartService.cart$);
    return await firstValueFrom(
      this.httpClient.post(url, { id: orderId, cartData: cartData })
    );
  }
}
