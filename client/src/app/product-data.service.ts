import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Product } from './models/Product.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductDataService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get one product by slug and add image url prefix
  getProductBySlug(slug: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/api/products/${slug}`).pipe(
      map((product) => {
        product.image = `${this.apiUrl}/assets/${product.image}`;
        return product;
      })
    );
  }

  // Get all products and add image url prefix
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/api/allProducts`).pipe(
      map((products) => {
        products.forEach((product) => {
          product.image = `${this.apiUrl}/assets/${product.image}`;
        });
        return products;
      })
    );
  }
}
