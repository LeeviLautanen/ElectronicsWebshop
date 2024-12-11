import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Product } from '../models/Product.model';
import { environment } from '../../environments/environment.dev';

@Injectable({
  providedIn: 'root',
})
export class ProductDataService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  // Get one product by slug and add image url prefix
  getProductBySlug(slug: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/api/products/${slug}`).pipe(
      map((product) => {
        product.image = `${this.baseUrl}/assets/${product.image}`;
        return product;
      })
    );
  }

  // Get all products and add image url prefix
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/api/products`).pipe(
      map((products) => {
        products.forEach((product) => {
          product.image = `${this.baseUrl}/assets/${product.image}`;
        });
        return products;
      })
    );
  }

  // Add a product to database
  addProduct(product: Product): Observable<any> {
    return this.http.post('http://localhost:1234/api/products', product);
  }
}
