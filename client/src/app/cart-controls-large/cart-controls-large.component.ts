import { Component, Input } from '@angular/core';
import { Product } from '../models/Product.model';
import { ShoppingCartService } from '../services/shopping-cart.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapCartPlus,
  bootstrapDashCircleFill,
  bootstrapPlusCircleFill,
} from '@ng-icons/bootstrap-icons';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cart-controls-large',
  standalone: true,
  imports: [NgIcon, CommonModule, FormsModule],
  templateUrl: './cart-controls-large.component.html',
  styleUrl: './cart-controls-large.component.css',
  providers: [
    provideIcons({
      bootstrapCartPlus,
      bootstrapPlusCircleFill,
      bootstrapDashCircleFill,
    }),
  ],
})
export class CartControlsLargeComponent {
  @Input() product!: Product;
  quantity = 1;

  constructor(
    private shoppingCartService: ShoppingCartService,
    private toastrService: ToastrService
  ) {}

  increaseQuantity(): void {
    this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) this.quantity--;
  }

  addToCart() {
    if (this.quantity <= 0) {
      this.toastrService.error(
        `Määrän täytyy olla positiivinen luku, ${this.quantity} ei kelpaa.`,
        'Ostoskoriin lisääminen epäonnistui'
      );
      return;
    }

    const currentQuantity = this.shoppingCartService.getProductQuantity(
      this.product
    );

    if (this.product.stock < currentQuantity + this.quantity) {
      this.toastrService.error(
        `Vain ${this.product.stock} kappaletta varastossa.`,
        'Ostoskoriin lisääminen epäonnistui'
      );
      return;
    }

    this.shoppingCartService.addItem(this.product, this.quantity);
    this.quantity = 1;
  }
}
