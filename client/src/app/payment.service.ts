import { Injectable } from '@angular/core';
import { environment } from '../environments/environment.dev';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, map } from 'rxjs';
import { ShoppingCartService } from './shopping-cart.service';
import { CartItem } from './models/CartItem.model';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private baseUrl = environment.baseUrl;

  constructor(
    private httpClient: HttpClient,
    private shoppingCartService: ShoppingCartService
  ) {}

  async createOrder(): Promise<any> {
    const url = `${this.baseUrl}/api/createOrder`;

    const cartItems: CartItem[] = this.shoppingCartService.getCart();
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
