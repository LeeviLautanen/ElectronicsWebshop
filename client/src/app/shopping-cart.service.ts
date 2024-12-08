import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { Product } from './models/Product.model';
import { CartItem } from './models/CartItem.model';

@Injectable({
  providedIn: 'root',
})
export class ShoppingCartService {
  private cart = new BehaviorSubject<CartItem[]>(this.loadCart());
  cart$ = this.cart.asObservable().pipe(
    map((cart) => ({
      items: cart,
      quantity: cart.reduce((total, item) => total + item.quantity, 0),
      value: cart.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      ),
    }))
  );

  getCart(): CartItem[] {
    return this.cart.value;
  }

  addItem(product: Product, quantity: number): void {
    const currentCart = this.cart.value;
    const existingItem = currentCart.find(
      (item) => item.product.slug === product.slug
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      currentCart.push({ ...{ product, quantity } });
    }

    this.cart.next([...currentCart]);
    this.saveCart();
  }

  removeItem(product: Product, quantity?: number): void {
    let currentCart = this.cart.value;
    const existingItem = currentCart.find(
      (item) => item.product.slug === product.slug
    );

    if (existingItem == undefined) {
      console.log("ERROR: Item to be deleted wasn't found");
      return;
    }

    if (quantity != undefined) {
      existingItem.quantity -= quantity;
    } else {
      currentCart = this.cart.value.filter(
        (item) => item.product.slug !== product.slug
      );
    }

    this.cart.next([...currentCart]);
    this.saveCart();
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
