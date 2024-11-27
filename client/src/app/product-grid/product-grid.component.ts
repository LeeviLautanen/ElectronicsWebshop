import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  bootstrapCartPlus,
  bootstrapDashCircleFill,
  bootstrapPlusCircleFill,
} from '@ng-icons/bootstrap-icons';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { Product } from '../models/ProductModel';
import { ProductDataService } from '../product-data.service';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, NgIconComponent, RouterLink],
  templateUrl: './product-grid.component.html',
  styleUrl: './product-grid.component.css',
  providers: [
    provideIcons({
      bootstrapCartPlus,
      bootstrapPlusCircleFill,
      bootstrapDashCircleFill,
    }),
  ],
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

  increaseQuantity(product: Product) {}

  decreaseQuantity(product: Product) {}

  addToCart(product: Product) {}

  goToProductPage(product: Product) {
    this.router.navigate([`/${product.slug}`]);
  }
}
