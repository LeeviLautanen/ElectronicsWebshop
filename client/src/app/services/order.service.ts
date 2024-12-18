import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.dev';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { ShoppingCartService } from './shopping-cart.service';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private baseUrl = environment.baseUrl;
  // Temporary shipping info storage to use in capture request
  private shippingInfo: any;

  constructor(
    private http: HttpClient,
    private shoppingCartService: ShoppingCartService
  ) {}

  // Send a request to server to create a new order
  async createOrder(shippingInfo: any): Promise<any> {
    const url = `${this.baseUrl}/api/createOrder`;
    this.shippingInfo = shippingInfo;

    // Get items in cart and compress then before sending to server
    const cartData = await firstValueFrom(this.shoppingCartService.cart$);
    return await firstValueFrom(
      this.http.post(url, {
        cartData: cartData,
        shippingInfo: shippingInfo,
      })
    );
  }

  async captureOrder(orderId: string): Promise<any> {
    const url = `${this.baseUrl}/api/captureOrder`;

    const cartData = await firstValueFrom(this.shoppingCartService.cart$);
    const result = await firstValueFrom(
      this.http.post(url, {
        id: orderId,
        cartData: cartData,
        shippingInfo: this.shippingInfo,
      })
    );
    this.shippingInfo = null;
    return result;
  }

  getOrderData(orderId: string): Observable<any> {
    const url = `${this.baseUrl}/api/getOrderData`;

    return this.http.post(url, { orderId });
  }
}
