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
  async createOrder(): Promise<any> {
    const url = `${this.baseUrl}/api/createOrder`;

    // Get items in cart and compress then before sending to server
    const cartData = await firstValueFrom(this.shoppingCartService.cart$);
    const cartItems: CartItem[] = cartData.cartItems;
    const cartItemsCompact = cartItems.map((item) => ({
      slug: item.product.slug,
      quantity: item.quantity,
    }));

    return await firstValueFrom(
      this.httpClient.post(url, { cartItems: cartItemsCompact })
    );
  }

  async captureOrder(orderId: string): Promise<any> {
    const url = `${this.baseUrl}/api/captureOrder`;
    return await firstValueFrom(this.httpClient.post(url, { id: orderId }));
  }
}
