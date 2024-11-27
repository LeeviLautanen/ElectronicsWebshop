import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from './models/ProductModel';

@Injectable({
  providedIn: 'root',
})
export class ProductDataService {
  constructor(private http: HttpClient) {}

  getProductBySlug(slug: string): Observable<Product> {
    return this.http.get<Product>(`http://localhost:3000/products/${slug}`);
  }

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`http://localhost:3000/all`);
  }
}
