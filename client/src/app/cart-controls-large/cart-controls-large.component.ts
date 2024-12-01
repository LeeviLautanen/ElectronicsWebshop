import { Component, Input } from '@angular/core';
import { Product } from '../models/Product.model';
import { ShoppingCartService } from '../shopping-cart.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapCartPlus,
  bootstrapDashCircleFill,
  bootstrapPlusCircleFill,
} from '@ng-icons/bootstrap-icons';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart-controls-large',
  standalone: true,
  imports: [NgIcon, CommonModule, FormsModule],
  templateUrl: './cart-controls-large.component.html',
  styleUrl: './cart-controls-large.component.css',
  providers: [
    provideIcons({
      bootstrapCartPlus,
      bootstrapPlusCircleFill,
      bootstrapDashCircleFill,
    }),
  ],
})
export class CartControlsLargeComponent {
  @Input() product!: Product;
  quantity = 1;

  constructor(private shoppingCartService: ShoppingCartService) {}

  increaseQuantity(): void {
    this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) this.quantity--;
  }

  addToCart() {
    this.shoppingCartService.addItem(this.product, this.quantity);
    this.quantity = 1;
  }
}
