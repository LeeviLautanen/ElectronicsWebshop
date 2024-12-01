import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from './models/Product.model';
import { CartItem } from './models/CartItem.model';

@Injectable({
  providedIn: 'root',
})
export class ShoppingCartService {
  private cart = new BehaviorSubject<CartItem[]>(this.loadCart());
  cart$ = this.cart.asObservable();

  addItem(product: Product, quantity: number): void {
    if (product.stock < quantity) {
    }

    const currentCart = this.cart.value;
    const existingItem = currentCart.find(
      (item) => item.product.id === product.id
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      currentCart.push({ ...{ product, quantity } });
    }

    this.cart.next([...currentCart]);
    this.saveCart();
  }

  removeItem(productId: number): void {
    const updatedCart = this.cart.value.filter(
      (item) => item.product.id !== productId
    );
    this.cart.next(updatedCart);
    this.saveCart();
  }

  getCart(): CartItem[] {
    return this.cart.value;
  }

  private loadCart(): CartItem[] {
    const cartData = sessionStorage.getItem('bittiboksi-ostoskori');
    return cartData ? JSON.parse(cartData) : [];
  }

  private saveCart(): void {
    sessionStorage.setItem(
      'bittiboksi-ostoskori',
      JSON.stringify(this.cart.value)
    );
  }
}
