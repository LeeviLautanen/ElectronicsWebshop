import { Component, Input } from '@angular/core';
import {
  bootstrapCartPlus,
  bootstrapDashCircleFill,
  bootstrapPlusCircleFill,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Product } from '../models/Product.model';
import { CommonModule } from '@angular/common';
import { ShoppingCartService } from '../services/shopping-cart.service';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cart-controls-small',
  standalone: true,
  imports: [NgIcon, CommonModule, FormsModule],
  templateUrl: './cart-controls-small.component.html',
  styleUrl: './cart-controls-small.component.css',
  providers: [
    provideIcons({
      bootstrapCartPlus,
      bootstrapPlusCircleFill,
      bootstrapDashCircleFill,
    }),
  ],
})
export class CartControlsSmallComponent {
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
