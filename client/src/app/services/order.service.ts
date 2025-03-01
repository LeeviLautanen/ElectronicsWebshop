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

  async createCheckoutSession(
    shippingInfo: any,
    origin: string
  ): Promise<string> {
    try {
      const url = `${this.baseUrl}/api/createCheckoutSession`;
      this.shippingInfo = shippingInfo;

      // Remove spaces from phone number
      if (this.shippingInfo.phone) {
        this.shippingInfo.phone = this.shippingInfo.phone.replace(/\s+/g, '');
      }

      // Get items in cart and compress then before sending to server
      const cartData = await firstValueFrom(this.shoppingCartService.cart$);

      const data = await firstValueFrom(
        this.http.post<any>(url, {
          cartData: cartData,
          shippingInfo: shippingInfo,
          origin: origin,
        })
      );

      if (data.checkoutUrl != undefined) {
        return data.checkoutUrl;
      }

      return '';
    } catch (error: any) {
      throw new Error(`Error creating klarna order: ${error.message}`);
    }
  }

  getOrderData(orderId: string): Observable<any> {
    const url = `${this.baseUrl}/api/getOrderData/${orderId}`;
    return this.http.get(url);
  }
}
