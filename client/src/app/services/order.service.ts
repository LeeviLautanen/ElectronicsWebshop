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

  async createKlarnaOrder(shippingInfo: any): Promise<string> {
    try {
      const url2 = `${this.baseUrl}/api/createOrder`;
      const url = `${this.baseUrl}/api/createOrder`;
      this.shippingInfo = shippingInfo;

      // Remove spaces from phone number
      if (this.shippingInfo.phone) {
        this.shippingInfo.phone = this.shippingInfo.phone.replace(/\s+/g, '');
      }

      // Get items in cart and compress then before sending to server
      const cartData = firstValueFrom(this.shoppingCartService.cart$);

      const data = await firstValueFrom(
        this.http.post<any>(url, {
          cartData: cartData,
          shippingInfo: shippingInfo,
        })
      );

      if (data.html_snippet != undefined) {
        return data.html_snippet;
      }

      return '<h1>Error creating Klarna order</h1>';
    } catch (error: any) {
      throw new Error(`Error creating paypal order: ${error.message}`);
    }
  }

  // Send a request to server to create a new order
  async createOrder(shippingInfo: any): Promise<any> {
    try {
      const url = `${this.baseUrl}/api/createOrder`;
      this.shippingInfo = shippingInfo;

      // Remove spaces from phone number
      if (this.shippingInfo.phone) {
        this.shippingInfo.phone = this.shippingInfo.phone.replace(/\s+/g, '');
      }

      // Get items in cart and compress then before sending to server
      const cartData = await firstValueFrom(this.shoppingCartService.cart$);

      return await firstValueFrom(
        this.http.post(url, {
          cartData: cartData,
          shippingInfo: shippingInfo,
        })
      );
    } catch (error: any) {
      throw new Error(`Error creating paypal order: ${error.message}`);
    }
  }

  async captureOrder(orderId: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/api/captureOrder`;

      const cartData = await firstValueFrom(this.shoppingCartService.cart$);
      const result = await firstValueFrom(
        this.http.post(url, {
          paypalOrderId: orderId,
          cartData: cartData,
          shippingInfo: this.shippingInfo,
        })
      );
      this.shippingInfo = null;
      return result;
    } catch (error: any) {
      throw new Error(`Error capturing paypal order: ${error.message}`);
    }
  }

  getOrderData(orderId: string): Observable<any> {
    const url = `${this.baseUrl}/api/getOrderData/${orderId}`;
    return this.http.get(url);
  }
}
