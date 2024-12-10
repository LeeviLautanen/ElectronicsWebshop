import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  bootstrapCart4,
  bootstrapChevronDown,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ShoppingCartService } from '../services/shopping-cart.service';
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
  private cartSubscription: Subscription = new Subscription();
  cartItems: CartItem[] = [];
  cartValue: number = 0.0;
  cartQuantity: number = 0;

  constructor(private shoppingCartService: ShoppingCartService) {}

  ngOnInit(): void {
    // Subscribe to the cart observable and update values
    this.cartSubscription = this.shoppingCartService.cart$.subscribe(
      (cartData) => {
        this.cartItems = cartData.items;
        this.cartQuantity = cartData.quantity;
        this.cartValue = cartData.value;
      }
    );
  }

  ngOnDestroy(): void {
    // For possible memory leaks
    this.cartSubscription.unsubscribe();
  }
}
