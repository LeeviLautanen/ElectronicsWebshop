import { Component, OnInit } from '@angular/core';
import { ShoppingCartService } from '../services/shopping-cart.service';
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
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

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

  constructor(
    private shoppingCartService: ShoppingCartService,
    private toastr: ToastrService,
    private router: Router
  ) {}

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
