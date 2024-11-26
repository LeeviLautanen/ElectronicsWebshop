import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  bootstrapCartPlus,
  bootstrapDashCircleFill,
  bootstrapPlusCircleFill,
} from '@ng-icons/bootstrap-icons';
import { NgIconComponent, provideIcons } from '@ng-icons/core';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  templateUrl: './product-grid.component.html',
  styleUrl: './product-grid.component.css',
  providers: [
    provideIcons({
      bootstrapCartPlus,
      bootstrapPlusCircleFill,
      bootstrapDashCircleFill,
    }),
  ],
})
export class ProductGridComponent {
  @Input() products: any[] = [];

  increaseQuantity(product: any) {
    product.quantity = (product.quantity || 1) + 1;
  }

  decreaseQuantity(product: any) {
    if (product.quantity > 1) {
      product.quantity -= 1;
    }
  }

  addToCart(product: any) {
    console.log(`Added ${product.quantity} of ${product.name} to the cart.`);
    product.quantity = 1;
  }
}
