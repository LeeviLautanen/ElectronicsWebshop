import { Injectable } from '@angular/core';
import { environment } from '../environments/environment.dev';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private baseUrl = environment.baseUrl;

  constructor(private httpClient: HttpClient) {}

  async createOrder(): Promise<any> {
    const url = `${this.baseUrl}/api/createOrder`;
    return await firstValueFrom(this.httpClient.post(url, {}));
  }

  async captureOrder(orderId: string): Promise<any> {
    const url = `${this.baseUrl}/api/captureOrder`;
    return await firstValueFrom(this.httpClient.post(url, { id: orderId }));
  }
}
