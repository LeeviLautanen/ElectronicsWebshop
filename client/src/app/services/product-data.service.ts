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
    return this.http.get<Product>(`${this.baseUrl}/api/products/${slug}`);
  }

  // Get products by category and add image url prefix
  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(
      `${this.baseUrl}/api/categories/${category}`
    );
  }

  // Get all products and add image url prefix
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/api/products`);
  }

  // Add a product to database
  addProduct(product: Product): Observable<any> {
    return this.http.post('https://localhost:1234/api/products', product);
  }
}
