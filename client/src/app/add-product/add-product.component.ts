import { Component } from '@angular/core';
import { Product } from '../models/Product.model';
import { FormsModule } from '@angular/forms';
import { ProductDataService } from '../product-data.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css',
})
export class AddProductComponent {
  product: Product = {
    slug: 'test-item',
    name: 'Test item',
    description:
      'Test item Test item Test item Test item Test item Test item Test item Test item Test item Test item Test item Test item Test item Test item Test item Test item Test item Test item ',
    image: 'no-image.jpg',
    price: 6.9,
    stock: 50,
  };

  constructor(private productDataService: ProductDataService) {}

  onSubmit() {
    this.productDataService.addProduct(this.product).subscribe({
      next: (response) => {
        console.log('Product added:', response);
        this.product = {
          slug: '',
          name: '',
          description: '',
          image: '',
          price: 0,
          stock: 0,
        };
      },
      error: (err) => {
        console.error('Error adding product:', err);
      },
    });
  }
}
