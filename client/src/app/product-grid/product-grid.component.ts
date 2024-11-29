import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Product } from '../models/ProductModel';
import { ProductDataService } from '../product-data.service';
import { CartControlsComponent } from '../cart-controls/cart-controls.component';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, RouterLink, CartControlsComponent],
  templateUrl: './product-grid.component.html',
  styleUrl: './product-grid.component.css',
})
export class ProductGridComponent implements OnInit {
  products: Product[] = [];

  constructor(
    private router: Router,
    private productDataService: ProductDataService
  ) {}

  // Fetch all product data
  ngOnInit(): void {
    this.productDataService.getAllProducts().subscribe((data) => {
      console.log(data);
      this.products = data;
    });
  }

  goToProductPage(product: Product) {
    this.router.navigate([`/tuote/${product.slug}`]);
  }
}
