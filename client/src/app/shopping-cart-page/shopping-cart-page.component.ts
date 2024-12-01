import { Component, OnInit } from '@angular/core';
import { ShoppingCartService } from '../shopping-cart.service';
import { CartItem } from '../models/CartItem.model';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapDashCircleFill,
  bootstrapPlusCircleFill,
  bootstrapTrash3,
} from '@ng-icons/bootstrap-icons';
import { CartProductCardComponent } from '../cart-product-card/cart-product-card.component';

@Component({
  selector: 'app-shopping-cart-page',
  standalone: true,
  imports: [CommonModule, NgIcon, CartProductCardComponent],
  templateUrl: './shopping-cart-page.component.html',
  styleUrls: ['./shopping-cart-page.component.css'],
  providers: [
    provideIcons({
      bootstrapPlusCircleFill,
      bootstrapDashCircleFill,
      bootstrapTrash3,
    }),
  ],
})
export class ShoppingCartPageComponent implements OnInit {
  cartItems: CartItem[] = [];
  totalItems = 0;
  cartTotal = 0;

  constructor(private shoppingCartService: ShoppingCartService) {}

  ngOnInit(): void {
    this.shoppingCartService.cart$.subscribe((items) => {
      this.cartItems = items;
      this.calculateSummary();
    });
  }

  updateQuantity(item: CartItem, quantity: number): void {
    if (quantity > 0) {
      this.shoppingCartService.addItem(item.product, quantity - item.quantity);
    }
  }

  removeItem(productId: number): void {
    this.shoppingCartService.removeItem(productId);
  }

  calculateSummary(): void {
    this.totalItems = this.cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    this.cartTotal = this.cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  }

  checkout(): void {
    // Implement checkout logic here
    console.log('Proceeding to checkout...');
  }
}
