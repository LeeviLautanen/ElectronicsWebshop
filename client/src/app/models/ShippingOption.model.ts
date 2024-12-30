export interface ShippingOption {
  public_id: string;
  name: string;
  description: string;
  delivery_time: string;
  image: string;
  price: number;
  max_weight_g: number;
  max_height_mm: number;
}
