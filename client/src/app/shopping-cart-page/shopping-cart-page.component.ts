import { Component, OnInit } from '@angular/core';
import { ShoppingCartService } from '../services/shopping-cart.service';
import { CartItem } from '../models/CartItem.model';
import { CommonModule } from '@angular/common';
import { CartProductCardComponent } from '../cart-product-card/cart-product-card.component';
import { Subscription } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-shopping-cart-page',
  standalone: true,
  imports: [CommonModule, CartProductCardComponent, RouterLink],
  templateUrl: './shopping-cart-page.component.html',
  styleUrls: ['./shopping-cart-page.component.css'],
})
export class ShoppingCartPageComponent implements OnInit {
  private cartSubscription: Subscription = new Subscription();
  cartItems: CartItem[] = [];
  cartQuantity = 0;
  cartValue = 0;

  constructor(
    private shoppingCartService: ShoppingCartService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to the cart observable and update values
    this.cartSubscription = this.shoppingCartService.cart$.subscribe(
      (cartData) => {
        this.cartItems = cartData.cartItems;
        this.cartQuantity = cartData.itemQuantity;
        this.cartValue = cartData.cartValue;
      }
    );
  }

  ngOnDestroy(): void {
    // For possible memory leaks
    this.cartSubscription.unsubscribe();
  }

  checkout(): void {
    if (this.cartQuantity <= 0) {
      this.toastr.error(
        'Kassalle siirtyminen epäonnistui',
        'Ostoskori on tyhjä.'
      );
    } else {
      this.router.navigateByUrl('/kassa');
    }
  }
}
