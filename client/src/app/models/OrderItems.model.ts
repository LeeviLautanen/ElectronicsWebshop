export interface OrderData {
  orderId: string;
  shippingName: string;
  shippingCost: number;
  orderItems: [{ name: string; quantity: number; price: number }];
}
