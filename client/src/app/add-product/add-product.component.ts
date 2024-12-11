import { Component } from '@angular/core';
import { Product } from '../models/Product.model';
import { FormsModule } from '@angular/forms';
import { ProductDataService } from '../services/product-data.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css',
})
export class AddProductComponent {
  product: Product = {
    public_id: '',
    slug: '',
    name: 'Test item',
    description:
      'Test item Test item Test item Test item Test item Test item Test item Test item Test item Test item Test item Test item Test item Test item Test item Test item Test item Test item ',
    image: 'no-image.jpg',
    price: 6.9,
    stock: 50,
    weight_g: 5,
    height_mm: 12,
  };

  constructor(private productDataService: ProductDataService) {}

  onSubmit() {
    this.product.slug = this.generateSlug(this.product.name);
    this.productDataService.addProduct(this.product).subscribe({
      next: (response) => {
        console.log('Product added:', response);
        this.product = {
          public_id: '',
          slug: '',
          name: '',
          description: '',
          image: '',
          price: 0,
          stock: 0,
          weight_g: 0,
          height_mm: 0,
        };
      },
      error: (err) => {
        console.error('Error adding product:', err);
      },
    });
  }

  generateSlug(input: string) {
    return input
      .toLowerCase()
      .trim() // Remove leading and trailing whitespace
      .replace(/[\s]+/g, '-') // Replace spaces with hyphens
      .replace(/[^\w\-]+/g, ''); // Remove special characters (optional)
  }
}
