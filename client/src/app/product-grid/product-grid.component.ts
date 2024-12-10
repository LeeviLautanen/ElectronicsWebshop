import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../models/Product.model';
import { ProductDataService } from '../services/product-data.service';
import { CartControlsSmallComponent } from '../cart-controls-small/cart-controls-small.component';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, RouterLink, CartControlsSmallComponent],
  templateUrl: './product-grid.component.html',
  styleUrl: './product-grid.component.css',
})
export class ProductGridComponent implements OnInit {
  products: Product[] = [];

  constructor(private productDataService: ProductDataService) {}

  // Fetch all product data
  ngOnInit(): void {
    this.productDataService.getAllProducts().subscribe((data) => {
      this.products = data;
    });
  }
}
