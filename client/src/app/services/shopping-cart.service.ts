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

  // Add product to cart
  addItem(product: Product, quantity: number) {
    return;
    const currentItems = this.cartSubject.value.cartItems;
    const existingItem = currentItems.find(
      (item) => item.product.public_id === product.public_id
    );

    if (existingItem) {
      //existingItem.quantity += quantity;
    } else {
      currentItems.push({ ...{ product, quantity } });
    }

    this.cartSubject.next({
      ...this.cartSubject.value,
      cartItems: currentItems,
    });
    this.saveCart();
  }

  // Remove product from cart, delete all if no quantity provided
  removeItem(product: Product, quantity?: number) {
    // Find item to be removed
    let currentItems = this.cartSubject.value.cartItems;
    const existingItem = currentItems.find(
      (item) => item.product.public_id === product.public_id
    );

    if (existingItem == undefined) {
      console.log("ERROR: Item to be deleted wasn't found");
      return;
    }

    // Delete item from cart if no quantity given or if new quantity is 0
    if (quantity == undefined || existingItem.quantity - quantity == 0) {
      currentItems = this.cartSubject.value.cartItems.filter(
        (item) => item.product.slug !== product.slug
      );
    } else {
      existingItem.quantity -= quantity;
    }

    // Update and save cart
    this.cartSubject.next({
      ...this.cartSubject.value,
      cartItems: currentItems,
    });
    this.saveCart();
  }

  // Get quantity of a product in cart
  getProductQuantity(product: Product): number {
    let currentItems = this.cartSubject.value.cartItems;
    const existingItem = currentItems.find(
      (item) => item.product.public_id === product.public_id
    );
    if (existingItem) {
      return existingItem.quantity;
    }
    return 0;
  }

  // Fetch all possible shipping options for current cart
  fetchShippingOptions() {
    const { cartHeight, cartWeight } = this.cartSubject.value.cartItems.reduce(
      (totals, { product, quantity }) => {
        return {
          cartHeight: Math.max(totals.cartHeight, product.height_mm),
          cartWeight: totals.cartWeight + product.weight_g * quantity,
        };
      },
      { cartHeight: 0, cartWeight: 0 }
    );

    this.http
      .post<ShippingOption[]>(`${this.baseUrl}/api/shippingOptions`, {
        cartHeight: cartHeight,
        cartWeight: cartWeight,
      })
      .pipe(
        map((options) => {
          options.forEach((option) => {
            option.image = `${this.baseUrl}/uploads/${option.image}`;
          });
          return options;
        })
      )
      .subscribe((options) => {
        // Update list of shipping options and auto select cheapest one
        this.shippingOptionsSubject.next(options);
        this.selectShippingOption(this.getCheapestShippingOption());
      });
  }

  // Set the selected shipping option
  selectShippingOption(option: ShippingOption | null) {
    this.cartSubject.next({
      ...this.cartSubject.value,
      shippingOption: option,
    });
    this.saveCart();
  }

  // Get the cheapest shipping option with the current cart
  getCheapestShippingOption(): ShippingOption | null {
    const cheapestOption = this.shippingOptionsSubject.value[0];
    if (cheapestOption) {
      return cheapestOption;
    }
    return null;
  }

  // Delete all products from cart
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
