import { Component, Input } from '@angular/core';
import { Product } from '../models/Product.model';
import { NgIcon } from '@ng-icons/core';
import { CartItem } from '../models/CartItem.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShoppingCartService } from '../shopping-cart.service';

@Component({
  selector: 'app-cart-product-card',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon],
  templateUrl: './cart-product-card.component.html',
  styleUrl: './cart-product-card.component.css',
})
export class CartProductCardComponent {
  @Input() cartItem!: CartItem;

  constructor(private shoppingCartService: ShoppingCartService) {}

  removeFromCart(): void {}

  increaseQuantity(): void {}

  decreaseQuantity(): void {}
}
