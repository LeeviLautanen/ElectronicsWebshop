import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from './models/Product.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductDataService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProductBySlug(slug: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/api/products/${slug}`);
  }

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/api/allProducts`);
  }
}
