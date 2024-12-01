import { Component, Input } from '@angular/core';
import {
  bootstrapCartPlus,
  bootstrapDashCircleFill,
  bootstrapPlusCircleFill,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Product } from '../models/Product.model';
import { CommonModule } from '@angular/common';
import { ShoppingCartService } from '../shopping-cart.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart-controls-small',
  standalone: true,
  imports: [NgIcon, CommonModule, FormsModule],
  templateUrl: './cart-controls-small.component.html',
  styleUrl: './cart-controls-small.component.css',
  providers: [
    provideIcons({
      bootstrapCartPlus,
      bootstrapPlusCircleFill,
      bootstrapDashCircleFill,
    }),
  ],
})
export class CartControlsSmallComponent {
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
