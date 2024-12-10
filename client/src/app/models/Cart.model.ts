import { CartItem } from './CartItem.model';
import { ShippingOption } from './ShippingOption.model';

export interface Cart {
  cartItems: CartItem[];
  itemQuantity: number;
  shippingOption: ShippingOption;
  cartValue: number;
}
