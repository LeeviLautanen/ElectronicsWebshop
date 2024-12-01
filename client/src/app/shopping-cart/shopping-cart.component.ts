import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  bootstrapCart4,
  bootstrapChevronDown,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ShoppingCartService } from '../shopping-cart.service';
import { Subscription } from 'rxjs';
import { CartItem } from '../models/CartItem.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [NgIcon, CommonModule],
  templateUrl: './shopping-cart.component.html',
  styleUrl: './shopping-cart.component.css',
  providers: [provideIcons({ bootstrapCart4, bootstrapChevronDown })],
})
export class ShoppingCartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  cartTotal: number = 0.0;
  cartQuantity: number = 0;
  private cartSubscription: Subscription = new Subscription();

  constructor(private shoppingCartService: ShoppingCartService) {}

  ngOnInit(): void {
    // Subscribe to the cart observable
    this.cartSubscription = this.shoppingCartService.cart$.subscribe((cart) => {
      this.cartItems = cart;
      this.updateCartSummary();
    });
  }

  ngOnDestroy(): void {
    // For possible memory leaks
    this.cartSubscription.unsubscribe();
  }

  private updateCartSummary(): void {
    this.cartQuantity = this.cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );
    this.cartTotal = this.cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  }
}
