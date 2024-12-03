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
import { Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-shopping-cart-page',
  standalone: true,
  imports: [CommonModule, NgIcon, CartProductCardComponent, RouterLink],
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
  private cartSubscription: Subscription = new Subscription();
  cartItems: CartItem[] = [];
  cartQuantity = 0;
  cartValue = 0;

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

  checkout(): void {
    // Implement checkout logic here
    console.log('Proceeding to checkout...');
  }
}
