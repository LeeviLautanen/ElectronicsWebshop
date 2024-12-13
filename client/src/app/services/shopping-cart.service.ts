import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { Product } from '../models/Product.model';
import { Cart } from '../models/Cart.model';
import { ShippingOption } from '../models/ShippingOption.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.dev';

@Injectable({
  providedIn: 'root',
})
export class ShoppingCartService {
  baseUrl = environment.baseUrl;

  private shippingOptionsSubject = new BehaviorSubject<ShippingOption[]>([]);
  shippingOptions$ = this.shippingOptionsSubject.asObservable();

  private cartSubject = new BehaviorSubject<Cart>(this.loadCart());
  cart$ = this.cartSubject.asObservable().pipe(
    map((cart) => ({
      cartItems: cart.cartItems,
      itemQuantity: cart.cartItems.reduce(
        (total, item) => total + item.quantity,
        0
      ),
      shippingOption: cart.shippingOption,
      cartValue: cart.cartItems.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      ),
    }))
  );

  constructor(private http: HttpClient) {}

  addItem(product: Product, quantity: number) {
    const currentItems = this.cartSubject.value.cartItems;
    const existingItem = currentItems.find(
      (item) => item.product.public_id === product.public_id
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      currentItems.push({ ...{ product, quantity } });
    }

    this.cartSubject.next({
      ...this.cartSubject.value,
      cartItems: currentItems,
    });
    this.saveCart();
  }

  removeItem(product: Product, quantity?: number) {
    let currentItems = this.cartSubject.value.cartItems;
    const existingItem = currentItems.find(
      (item) => item.product.slug === product.slug
    );

    if (existingItem == undefined) {
      console.log("ERROR: Item to be deleted wasn't found");
      return;
    }

    if (quantity != undefined) {
      existingItem.quantity -= quantity;
    } else {
      currentItems = this.cartSubject.value.cartItems.filter(
        (item) => item.product.slug !== product.slug
      );
    }

    this.cartSubject.next({
      ...this.cartSubject.value,
      cartItems: currentItems,
    });
    this.saveCart();
  }

  // Set the selected shipping option
  selectShippingOption(option: ShippingOption) {
    this.cartSubject.next({
      ...this.cartSubject.value,
      shippingOption: option,
    });
    this.saveCart();
  }

  // Fetch all shipping options
  loadShippingOptions() {
    this.http
      .get<ShippingOption[]>(`${this.baseUrl}/api/shipping`)
      .pipe(
        map((options) => {
          options.forEach((option) => {
            option.image = `${this.baseUrl}/assets/${option.image}`;
          });
          return options;
        })
      )
      .subscribe((options) => {
        this.shippingOptionsSubject.next(options);
        if (this.cartSubject.value.shippingOption == null) {
          this.selectShippingOption(this.getCheapestShippingOption());
        }
      });
  }

  // Get the cheapest shipping option with the current cart
  getCheapestShippingOption(): ShippingOption {
    return this.shippingOptionsSubject.value[0];
  }

  emptyCart() {
    this.cartSubject.next({
      ...this.cartSubject.value,
      cartItems: [],
    });
    this.saveCart();
  }

  // Load cart from session storage
  private loadCart(): Cart {
    const cartData = sessionStorage.getItem('bittiboksi-ostoskori');
    return cartData
      ? JSON.parse(cartData)
      : { cartItems: [], itemQuantity: 0, shippingOption: null, cartValue: 1 };
  }

  // Save cart to session storage
  private saveCart(): void {
    sessionStorage.setItem(
      'bittiboksi-ostoskori',
      JSON.stringify(this.cartSubject.value)
    );
  }
}
