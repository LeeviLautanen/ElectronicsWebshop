import { Component, Input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { CartItem } from '../models/CartItem.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShoppingCartService } from '../services/shopping-cart.service';
import { ToastrService } from 'ngx-toastr';
import {
  bootstrapDashCircleFill,
  bootstrapPlusCircleFill,
  bootstrapTrash3,
} from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-cart-product-card',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon],
  templateUrl: './cart-product-card.component.html',
  styleUrl: './cart-product-card.component.css',
  providers: [
    provideIcons({
      bootstrapPlusCircleFill,
      bootstrapDashCircleFill,
      bootstrapTrash3,
    }),
  ],
})
export class CartProductCardComponent {
  @Input() cartItem!: CartItem;

  constructor(
    private shoppingCartService: ShoppingCartService,
    private toastrService: ToastrService
  ) {}

  increaseQuantity(): void {
    if (this.cartItem.product.stock < this.cartItem.quantity) {
      this.toastrService.error(
        `Vain ${this.cartItem.product.stock} kappaletta varastossa.`,
        'Ostoskoriin lisääminen epäonnistui'
      );
      return;
    }
    this.shoppingCartService.addItem(this.cartItem.product, 1);
  }

  decreaseQuantity(): void {
    this.shoppingCartService.removeItem(this.cartItem.product, 1);
  }

  removeFromCart(): void {
    this.shoppingCartService.removeItem(this.cartItem.product);
  }
}
