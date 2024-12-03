import { Component, Input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { CartItem } from '../models/CartItem.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShoppingCartService } from '../shopping-cart.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-cart-product-card',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon],
  templateUrl: './cart-product-card.component.html',
  styleUrl: './cart-product-card.component.css',
})
export class CartProductCardComponent {
  @Input() cartItem!: CartItem;
  apiUrl = environment.apiUrl;

  constructor(private shoppingCartService: ShoppingCartService) {}

  increaseQuantity(): void {
    this.shoppingCartService.addItem(this.cartItem.product, 1);
  }

  decreaseQuantity(): void {
    this.shoppingCartService.removeItem(this.cartItem.product, 1);
  }

  removeFromCart(): void {
    this.shoppingCartService.removeItem(this.cartItem.product);
  }
}
