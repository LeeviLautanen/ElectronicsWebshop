import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.dev';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ShippingOption } from '../models/ShippingOption.model';

@Injectable({
  providedIn: 'root',
})
export class ShippingService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  // Get all shipping options
  getShippingOptions(): Observable<ShippingOption[]> {
    return this.http.get<ShippingOption[]>(`${this.baseUrl}/api/shipping`).pipe(
      map((options) => {
        options.forEach((option) => {
          option.image = `${this.baseUrl}/assets/${option.image}`;
        });
        return options;
      })
    );
  }
}
