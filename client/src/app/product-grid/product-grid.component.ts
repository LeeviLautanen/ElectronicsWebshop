import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Product } from '../models/Product.model';
import { ProductDataService } from '../services/product-data.service';
import { CartControlsSmallComponent } from '../cart-controls-small/cart-controls-small.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, RouterLink, CartControlsSmallComponent],
  templateUrl: './product-grid.component.html',
  styleUrl: './product-grid.component.css',
})
export class ProductGridComponent implements OnInit {
  products: Product[] = [];

  constructor(
    private productDataService: ProductDataService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const category = params.get('category');
      this.fetchProducts(category);
    });
  }

  private fetchProducts(category: string | null): void {
    if (category == null || category.length == 0) {
      this.productDataService.getAllProducts().subscribe((data) => {
        this.products = data;
      });
    } else {
      this.productDataService
        .getProductsByCategory(category)
        .subscribe((data) => {
          this.products = data;
        });
    }
  }
}
